export function newSalt() { const bytes = crypto.getRandomValues(new Uint8Array(16)); let binary = ''; bytes.forEach(b => binary += String.fromCharCode(b)); return btoa(binary); }
