# Vaultora — updated architecture

Vaultora is a zero-knowledge digital secrets vault. The browser derives the vault key from the master password and decrypts the vault only in memory. Spring Boot stores ciphertext, IV, salt, version and revision; it does not receive the master password or plaintext vault entries.

## Frontend

The frontend is now feature-based and uses React + MUI:

- `app/` — routing and providers
- `components/` — reusable UI
- `features/` — auth, vault, unlock, generator and settings
- `crypto/` — PBKDF2 key derivation and AES-256-GCM encryption/decryption
- `context/` — authentication and in-memory vault session
- `hooks/` — auto-lock and clipboard handling
- `services/` — API boundary
- `theme/` — MUI theme

Sensitive vault data and the non-exportable CryptoKey are never persisted to localStorage/Redux.

Authentication uses an HttpOnly, SameSite=Strict session cookie. A short-lived token is also returned for the current browser-extension prototype; the web application deliberately does not persist it.

## Backend improvements

- 30-minute JWT session expiry by default.
- HttpOnly `VAULTORA_SESSION` cookie for the web app.
- CORS credentials enabled for the local frontend.
- Login rate limiting (prototype in-memory limiter; use Redis/distributed limiting before production).
- BCrypt strength increased to 12 rounds.
- Security headers including CSP, frame denial, content-type protection and referrer policy.
- Vault optimistic revision checks to prevent silent last-write-wins overwrites.
- Vault response includes a revision used by `If-Match`.
- JWT secret has no development fallback; set `JWT_SECRET`.

## Run

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Set `JWT_SECRET` to a long random secret, then start the Spring Boot application. MongoDB is expected at the configured `MONGODB_URI`.

For local development:

```text
MONGODB_URI=mongodb://localhost:27017/vaultora
JWT_SECRET=<long-random-secret>
COOKIE_SECURE=false
```

For HTTPS production, set `COOKIE_SECURE=true` and configure the CORS origin for the real frontend origin.

## Important production follow-ups

1. Move login rate limiting to Redis or another shared store.
2. Add WebAuthn/passkeys or TOTP MFA.
3. Add automated security and crypto tests.
4. Harden and separately authenticate the browser extension.
5. Add a deliberate encrypted-vault recovery design; do not implement server-side master-password reset.
6. Use HTTPS/HSTS in production.


## Security update
See `README_SECURITY_UPDATE.md` for the Argon2id account hashing, Redis rate limiting, and hardened browser-extension authentication changes.
