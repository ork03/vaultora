import { base64ToBytes } from './encryption';
const decoder = new TextDecoder();
export async function decryptVault(vault, key) {
  if (vault.version !== 1) throw new Error(`Unsupported vault format version: ${vault.version}`);
  const aad = new TextEncoder().encode(`vaultora:v${vault.version}`);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(vault.iv), additionalData: aad, tagLength: 128 }, key, base64ToBytes(vault.ciphertext));
  const items = JSON.parse(decoder.decode(decrypted));
  if (!Array.isArray(items)) throw new Error('The vault format is invalid.');
  return items;
}
