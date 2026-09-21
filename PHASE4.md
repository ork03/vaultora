# Phase 4: advanced clients

## Mobile

The React client is now installable as a Progressive Web App (PWA). It uses a web app manifest and caches the application shell for a faster mobile launch. Vault data still requires network synchronization; plaintext is never cached by the service worker.

## Browser extension and autofill

`browser-extension/` is a Chromium Manifest V3 extension. Load it through `chrome://extensions` → **Developer mode** → **Load unpacked**, then choose that folder.

The popup signs in to the local API, decrypts the vault only in the popup's memory, matches the active site's hostname, and fills a selected login only when the user clicks it. It does not submit forms, store the master password, or retain decrypted values after locking or popup closure.

For local development it is restricted to `http://localhost:8081/*`. Before a production release, set `host_permissions` to the exact deployed API host and use HTTPS.

## Biometrics and passkeys

Passkeys are not a client-only toggle. A WebAuthn relying-party backend must generate one-time challenges, persist public credentials, verify attestation/assertions and origin/RP ID, and issue a session only after verification. Platform authenticators can then perform biometric user verification (Windows Hello, Touch ID, Face ID) without the app handling biometric data.

Implement this only after the production domain is fixed and the backend has a reviewed WebAuthn library and test environment. It must not be used as a replacement for master-password encryption without a separate, reviewed key-recovery or key-wrapping design.
