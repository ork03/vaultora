# Vaultora architecture

Vaultora is a client-side encrypted password-vault application. The browser encrypts and decrypts vault contents; the backend stores only encrypted vault data and manages user accounts, sessions, rate limiting, and concurrency.

## High-level design

```text
                         ┌──────────────────────────┐
                         │        Web browser       │
                         │ React + Vite on :5173    │
                         └────────────┬─────────────┘
                                      │ HTTPS/HTTP API calls
                                      │ HttpOnly session cookie
                                      ▼
                         ┌──────────────────────────┐
                         │      Vaultora API         │
                         │ Spring Boot on :8081     │
                         └───────┬─────────┬────────┘
                                 │         │
                         account data      │ login rate-limit counters
                                 │         │
                                 ▼         ▼
                    ┌───────────────┐ ┌───────────────┐
                    │ MongoDB :27017│ │ Redis :6379   │
                    │ users, vaults │ │ temporary TTL │
                    └───────────────┘ └───────────────┘

  Browser extension ────────────────────────────────► Vaultora API :8081
  (Chrome popup, short-lived bearer token)
```

## Components

### Frontend (`frontend/`)

The frontend is a React single-page application served by Vite during development.

- `src/app/` sets up application providers and routes.
- `src/context/AuthContext.jsx` keeps the signed-in user in React state.
- `src/context/VaultContext.jsx` keeps the unlocked encryption key and decrypted vault only in memory.
- `src/features/` contains screens and feature logic: authentication, vault, unlock, settings, and password generator.
- `src/crypto/` derives vault keys and encrypts/decrypts vault data using the browser Web Crypto API.
- `src/services/apiClient.js` is the one HTTP API boundary for the web app.

The frontend expects the API at `http://localhost:8081/api` by default. Set `VITE_API_BASE_URL` in a frontend environment file to use a different API endpoint.

The service worker is intentionally disabled on localhost. This prevents cached Vite development modules from mixing with a newer development build. It can be registered outside local development for offline static-asset caching.

### Backend (`backend/`)

The backend is a Spring Boot API.

- `auth/` contains registration, login, logout, current-user, and extension-login endpoints.
- `security/` validates JWTs, installs the authenticated user in Spring Security, creates session cookies, configures CORS, and sets browser security headers.
- `user/` stores user accounts and password hashes in MongoDB.
- `vault/` stores and retrieves encrypted vault records in MongoDB.
- `common/ApiExceptionHandler.java` turns common application errors into API responses.

The API listens on port `8081` unless the `PORT` environment variable overrides it:

```properties
server.port=${PORT:8081}
```

### MongoDB

MongoDB is the durable data store.

- `users` contains email addresses, password hashes, and creation time.
- `vaults` contains encrypted data only: ciphertext, IV, salt, vault format version, timestamps, and a revision number.

The backend never receives the vault master password or decrypted vault contents.

### Redis

Redis stores short-lived login rate-limit counters. The counters are hashed and expire after the configured window, so Redis is not used as a permanent account or vault store.

### Browser extension (`browser-extension/`)

The browser extension has its own small UI and API client.

- It logs in through `/api/auth/extension-login`.
- The backend returns a short-lived bearer token for extension use.
- The extension decrypts vault contents only in its popup memory.
- It fills a selected login when the user explicitly clicks it; it does not automatically submit forms.

## Authentication flow

```text
1. User submits email and account password.
2. Frontend POSTs /api/auth/register or /api/auth/login.
3. Backend validates credentials and creates a signed JWT.
4. Backend returns the JWT in the HttpOnly VAULTORA_SESSION cookie.
5. Browser automatically sends that cookie on later API requests.
6. JwtAuthenticationFilter validates the JWT before protected endpoints run.
7. Frontend calls /api/auth/me after a refresh to restore signed-in state.
```

The cookie is HttpOnly so frontend JavaScript cannot read it. In production, enable the `COOKIE_SECURE` setting and serve the frontend and API over HTTPS.

## Vault encryption flow

```text
1. User enters the vault master password on the unlock screen.
2. Frontend derives a non-exportable AES-256 key with PBKDF2-SHA-256 and the vault salt.
3. Frontend encrypts the JSON vault with AES-GCM using a fresh random IV.
4. Frontend PUTs ciphertext, IV, salt, version, and revision to /api/vault.
5. Backend stores those encrypted fields unchanged in MongoDB.
6. On a later unlock, frontend GETs the encrypted record and decrypts it locally.
```

The master password and derived key are not sent to the backend. The unlocked key exists only in React memory and is discarded when the vault is locked, the tab is refreshed, or the app is closed.

## Vault revision protection

Each vault record has a MongoDB revision number.

```text
Client GETs vault       → receives revision 3
Client PUTs vault with  → If-Match: 3
Backend saves it        → revision becomes 4
```

If another device has already saved revision 4, a client attempting to save revision 3 receives a conflict instead of overwriting newer encrypted data.

## Local development

Start dependencies with Docker Compose:

```powershell
docker compose up -d
```

Run the backend on port 8081 and the frontend on port 5173. The frontend CORS origin `http://localhost:5173` is allowed by the backend configuration.

Important environment settings:

| Setting | Purpose |
| --- | --- |
| `PORT` | Backend port; defaults to `8081`. |
| `MONGODB_URI` | MongoDB connection string. |
| `REDIS_URL` | Redis connection string. |
| `JWT_SECRET` | Intended production source for the JWT signing secret; wire this into `app.jwt.secret` before deployment. |
| `COOKIE_SECURE` | Set to `true` when using HTTPS. |
| `VITE_API_BASE_URL` | Frontend API endpoint override. |

## Security boundaries

- The frontend is responsible for encryption and decryption.
- The backend is responsible for identity, sessions, authorization, validation, and encrypted-data storage.
- MongoDB stores encrypted vault payloads, not plaintext secrets.
- Redis holds expiring rate-limit data only.
- The browser extension receives only a short-lived token and keeps decrypted data in temporary memory.

Before production, replace the currently hard-coded `app.jwt.secret` with a `JWT_SECRET` environment-variable reference, use HTTPS, configure exact allowed origins, and add automated tests for authentication and vault conflict scenarios.
