const encoder = new TextEncoder();
const decoder = new TextDecoder();

function decode(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, x => x.charCodeAt(0));
}

// Kept PBKDF2-SHA-256 because it is implemented by Web Crypto in both
// Chromium extension pages and the web app. The server-side account password
// hash is Argon2id. A vetted Argon2id WASM implementation can be introduced
// later for vault KDF parity without writing custom cryptography.
export async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: decode(salt),
      iterations: 600000,
      hash: 'SHA-256'
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

export async function decrypt(vault, key) {
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decode(vault.iv) },
    key,
    decode(vault.ciphertext)
  );
  return JSON.parse(decoder.decode(plaintext));
}
