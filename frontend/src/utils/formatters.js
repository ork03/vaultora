export const maskSecret = value => '•'.repeat(Math.min(Math.max(String(value || '').length, 8), 18));
