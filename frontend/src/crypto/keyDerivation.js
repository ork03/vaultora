import { PBKDF2_ITERATIONS } from '../utils/constants';
const encoder = new TextEncoder();
const base64ToBytes = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
export async function deriveVaultKey(masterPassword, salt) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(masterPassword), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: base64ToBytes(salt), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
