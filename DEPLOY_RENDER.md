# Free deployment: Render + MongoDB Atlas

This project is prepared for a free hobby deployment with:

- **Render Web Service Free**: hosts the Spring Boot API and built React frontend together.
- **Render Key Value Free**: stores temporary login rate-limit counters.
- **MongoDB Atlas Free cluster**: stores accounts and encrypted vault records.

The frontend and API share one Render URL, so API calls use `/api` and the HttpOnly session cookie stays first-party. No production CORS configuration is needed for the web app.

> Free services are appropriate for demos and personal projects. Render free web services sleep after inactivity, so the first request after a pause can take about a minute. Do not use a free tier for a service that needs an uptime guarantee.

## 1. Create the MongoDB Atlas cluster

1. Create a free Atlas cluster in a region close to your Render region.
2. Create a database user with a strong generated password.
3. In Atlas Network Access, allow Render to reach the cluster. For a hobby deployment this might require temporary `0.0.0.0/0` access; use a stricter network policy when available.
4. Copy the SRV connection string and replace its password. It becomes the `MONGODB_URI` secret in Render. Include `/vaultora` before the query string, for example `mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/vaultora?retryWrites=true&w=majority`.

## 2. Push this repository to GitHub

Do not commit `.env`, MongoDB credentials, or any real JWT secret. The supplied `render.yaml` and `Dockerfile` are safe to commit.

## 3. Create the Render Blueprint

1. Sign in to Render and select **New > Blueprint**.
2. Connect the GitHub repository and select its `render.yaml` file.
3. Render creates the `vaultora` web service and `vaultora-rate-limits` Key Value service.
4. Enter the Atlas connection string when Render asks for `MONGODB_URI`.
5. Keep the generated `JWT_SECRET`; do not replace it with a short or predictable value.
6. Apply the Blueprint and wait for the first Docker deploy to finish.

Open the generated `https://vaultora-<unique>.onrender.com` URL. It serves both the React interface and the API. Render checks `/health` while deploying; it returns a small unauthenticated status response and does not expose account or vault data.

## 4. Production settings

The Blueprint sets `COOKIE_SECURE=true`. Render terminates HTTPS for the public URL, so production session cookies are secure.

If you publish the browser extension, add its exact Chrome extension ID as an environment variable in the web service:

```text
EXTENSION_ORIGIN_PATTERN=chrome-extension://YOUR_EXTENSION_ID
```

Set `WEB_ORIGIN` only if you later split the frontend onto a separate domain. Its value must be the exact frontend origin, for example `https://app.example.com`.

## Local development after this change

1. Copy `.env.example` to `.env` and generate a local JWT secret.
2. Start MongoDB and Redis with `docker compose up -d`.
3. Load the values from `.env` into your shell, then run the backend.
4. Run `npm run dev` inside `frontend/`.

Vite now proxies `/api` to `http://localhost:8081`, so the browser makes same-origin frontend requests while developing.

## Limits to expect

- Render Free services sleep after 15 minutes of inactivity and can take roughly a minute to wake.
- Atlas Free is limited to one free cluster per project and is intended for small workloads.
- Render Key Value Free is in-memory; losing its temporary rate-limit counters on restart is acceptable for this application.
- Use a paid plan, backups, monitoring, and a custom domain before treating the service as a production password manager.
