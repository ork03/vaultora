# Vaultora — Phase 1

Vaultora is a zero-knowledge personal credential vault. It provides account registration, JWT login, client-side encrypted credential CRUD, and local search.

## Security model (Phase 2)

- The master password is never sent to or stored by the server.
- The browser derives a non-extractable AES-256-GCM key using PBKDF2-SHA-256 with a random per-vault salt and 600,000 iterations.
- The whole credential vault is encrypted in the browser with a new random 96-bit IV for every save.
- MongoDB stores only `ciphertext`, `iv`, `salt`, and a format version. Search and decryption occur locally after unlock.
- The active vault key and plaintext live only in memory and are cleared on manual lock, sign-out, refresh, or five minutes of inactivity.

This is a learning project. A production password manager should undergo an independent security review and use a well-audited Argon2id implementation where feasible.

## Phase 3 features

- Cryptographically random password generation in the browser.
- Custom categories and favorite entries.
- Encrypted secure notes, API keys, recovery codes, and license keys.
- Local password-reuse detection. It compares decrypted secrets only in the active browser session and sends no matching data to the server.

## Prerequisites

- Java 21+ and Maven 3.9+
- Node 20+
- MongoDB running locally on port 27017

## Run

Start MongoDB, then run the API:

```powershell
cd D:\javaprograms\vaultora\backend
mvn spring-boot:run
```

In another terminal, start the React client:

```powershell
cd D:\javaprograms\vaultora\frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

## API

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/vault` | Retrieve the signed-in user's encrypted vault blob |
| PUT | `/api/vault` | Save an encrypted vault blob |

Vault endpoints require `Authorization: Bearer <token>`. They never accept plaintext credentials or a master password.

## Phase 4 clients

The React client is installable as a mobile PWA. A Chromium companion extension supporting explicit, local-memory-only login autofill is in [browser-extension](browser-extension). See [PHASE4.md](PHASE4.md) before loading it or planning passkeys/biometric authentication.
