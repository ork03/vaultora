export function validateMasterPassword(password) {
  if (!password || password.length < 12) return 'Use at least 12 characters for your master password.';
  return '';
}
