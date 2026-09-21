// Production serves the React app and API from the same origin. Vite proxies
// this relative path to the local backend during development.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const AUTO_LOCK_MS = 5 * 60 * 1000;
export const VAULT_VERSION = 1;
export const PBKDF2_ITERATIONS = 600_000; // Web Crypto-native vault KDF; deliberately retained until a vetted Argon2id WASM implementation is adopted.
