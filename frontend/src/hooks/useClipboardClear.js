import { useCallback } from 'react';
export function useClipboardClear(ms = 30000) {
  return useCallback(async value => { await navigator.clipboard.writeText(value); window.setTimeout(async () => { try { const current = await navigator.clipboard.readText(); if (current === value) await navigator.clipboard.writeText(''); } catch { /* Browser may deny clipboard reads. */ } }, ms); }, [ms]);
}
