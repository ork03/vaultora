import { vaultService } from '../vault/vaultService';
export const unlockService = { loadVault: () => vaultService.get() };
