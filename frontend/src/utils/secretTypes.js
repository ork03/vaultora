export const SECRET_TYPES = {
  login: 'Login',
  apiKey: 'API key',
  recoveryCodes: 'Recovery codes',
  licenseKey: 'License key',
  secureNote: 'Secure note'
};
export const EMPTY_SECRET = { title: '', type: 'login', category: 'General', favorite: false, website: '', username: '', secret: '', notes: '' };
export const secretLabel = type => ({ login: 'Password', apiKey: 'API key / secret', recoveryCodes: 'Recovery codes', licenseKey: 'License key' }[type] ?? 'Protected content');
