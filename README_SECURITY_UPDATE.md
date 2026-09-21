# Vaultora — security-focused update

This version implements the requested security changes while keeping the current whole-vault encrypted-blob architecture.

## Implemented

### Account password hashing
- New account passwords use **Argon2id** through Spring Security's `Argon2PasswordEncoder`.
- Existing BCrypt hashes are still accepted and transparently rehashed to Argon2id after a successful login.
- The account password is never used as the vault encryption key.

### Vault encryption
The browser still performs:
`Master password -> PBKDF2-SHA-256 (600,000 iterations) -> non-exportable AES-256-GCM key -> encrypted vault`.

PBKDF2 is intentionally retained for the vault KDF in this release because it is available natively through Web Crypto in both the web app and Chromium extension. We did **not** introduce custom Argon2/WASM cryptography merely to change the algorithm. A vetted, pinned Argon2id WASM implementation can be evaluated separately and migrated with a vault format version.

### Whole-vault encryption
The current design remains:
`decrypt whole vault -> modify -> encrypt whole vault -> PUT encrypted blob`.

This is appropriate for the current product scale. A future item-level encrypted record design should be introduced only when measurements show that vault size makes whole-vault synchronization a problem.

### Password reuse detection
Implemented in the vault UI:
- Only `login` secrets are compared.
- Reused secrets are detected locally after decryption.
- The server never receives plaintext passwords.
- The selected login displays a `Reused secret` warning.

### Browser extension
The extension now:
- Uses a dedicated `/api/auth/extension-login` endpoint.
- Receives a short-lived 10-minute extension token.
- Stores that token only in `chrome.storage.session` (not localStorage/sync storage).
- Never stores the master password.
- Uses `activeTab` + `scripting` instead of an always-running content script on every website.
- Injects the fill logic only after the user explicitly chooses a credential.
- Uses exact normalized hostname matching for V1.
- Clears the extension session token when the user locks.
- Keeps the decrypted credentials only in popup memory.

### Large-user backend changes
- Redis-backed distributed login rate limiting instead of an in-memory limiter.
- Per-account and per-IP login attempt limits.
- Vault optimistic concurrency/revision checks.
- Short-lived web JWT session.
- Short-lived extension JWT session.
- HttpOnly SameSite web session cookie.
- Security headers and CSP.
- Required JWT secret; no production default secret.

## Local setup

Start MongoDB and Redis:

```bash
docker compose up -d
```

Backend:

```bash
cd backend
# Set JWT_SECRET to a random value of at least 32 bytes.
# Windows PowerShell:
$env:JWT_SECRET="replace-with-a-long-random-secret"
$env:COOKIE_SECURE="false"
# Then run with your Maven wrapper / IDE.
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

For production:
- Set `COOKIE_SECURE=true`.
- Set `JWT_SECRET` to a strong secret in a secret manager.
- Set `MONGODB_URI` to the production MongoDB deployment.
- Set `REDIS_URL` to the production Redis deployment.
- Set `EXTENSION_ORIGIN_PATTERN` to the exact deployed Chrome extension origin, e.g. `chrome-extension://YOUR_EXTENSION_ID`; do not leave the wildcard.
- Serve the web app and API over HTTPS.
- Configure a real reverse proxy/load balancer and trusted proxy headers.
- Do not log credentials, master passwords, JWTs, Authorization headers, or decrypted vault contents.

## Important security boundary

The backend can authenticate the user and synchronize the encrypted vault, but it does not receive the master password and cannot decrypt the vault contents.

No password-manager implementation should be called production-ready without an independent security review / penetration test and careful threat modeling.
