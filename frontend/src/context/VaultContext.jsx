import { createContext, useCallback, useState } from 'react';
import { decryptVault, deriveVaultKey, encryptVault, newSalt } from '../crypto/vaultCrypto';
import { vaultService } from '../features/vault/vaultService';
import { VAULT_VERSION } from '../utils/constants';
export const VaultContext=createContext(null);
export function VaultProvider({children}){
 const [session,setSession]=useState(null);
 const lock=useCallback(()=>setSession(null),[]);
 const unlock=useCallback(async master=>{const remote=await vaultService.get();const salt=remote?.salt||newSalt();const key=await deriveVaultKey(master,salt);const items=remote?await decryptVault(remote,key):[];if(!remote){const saved=await vaultService.save(await encryptVault(items,key,salt,VAULT_VERSION),0);setSession({key,salt,items,revision:saved.revision});}else setSession({key,salt,items,revision:remote.revision});},[]);
 const save=useCallback(async items=>{if(!session)throw new Error('Vault is locked.');const saved=await vaultService.save(await encryptVault(items,session.key,session.salt,VAULT_VERSION),session.revision);setSession(p=>({...p,items,revision:saved.revision}));},[session]);
 return <VaultContext.Provider value={{session,unlock,lock,save}}>{children}</VaultContext.Provider>;
}
