import { api } from '../../services/apiClient';
export const authService = {
  login: credentials => api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: credentials => api('/auth/register', { method: 'POST', body: JSON.stringify(credentials) }),
  me: () => api('/auth/me'),
  logout: () => api('/auth/logout', { method: 'POST' })
};
