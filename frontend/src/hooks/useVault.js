import { useContext } from 'react';
import { VaultContext } from '../context/VaultContext';
export const useVault = () => useContext(VaultContext);
