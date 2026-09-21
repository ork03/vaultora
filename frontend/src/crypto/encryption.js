const encoder = new TextEncoder();
const bytesToBase64 = bytes => { let binary = ''; bytes.forEach(b => { binary += String.fromCharCode(b); }); return btoa(binary); };
const base64ToBytes = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
export async function encryptVault(items, key, salt, version = 1) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const aad = encoder.encode(`vaultora:v${version}`);
  const plaintext = encoder.encode(JSON.stringify(items));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 }, key, plaintext);
  return { ciphertext: bytesToBase64(new Uint8Array(encrypted)), iv: bytesToBase64(iv), salt, version };
}
export { base64ToBytes };
