export function errorMessage(error, fallback = 'Something went wrong.') { return error instanceof Error ? error.message : fallback; }
