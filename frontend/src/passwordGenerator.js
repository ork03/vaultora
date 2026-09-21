const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+';
export function generatePassword(length = 20) { const values = new Uint32Array(length); crypto.getRandomValues(values); return Array.from(values, v => chars[v % chars.length]).join(''); }
