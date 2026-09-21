import { api } from '../../services/apiClient';
export const vaultService = { get: () => api('/vault'), save: (payload, revision) => api('/vault', { method: 'PUT', headers: { 'If-Match': String(revision) }, body: JSON.stringify(payload) }) };
