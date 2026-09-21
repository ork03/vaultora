package com.vaultora.vault;
import jakarta.validation.constraints.NotBlank;import jakarta.validation.constraints.Size;
public final class VaultDtos {private VaultDtos(){}
 public record EncryptedVaultRequest(@NotBlank @Size(max=2_000_000) String ciphertext,@NotBlank @Size(min=16,max=128) String iv,@NotBlank @Size(min=16,max=256) String salt,int version){}
 public record EncryptedVaultResponse(String ciphertext,String iv,String salt,int version,long revision){static EncryptedVaultResponse from(Vault v){return new EncryptedVaultResponse(v.getCiphertext(),v.getIv(),v.getSalt(),v.getVersion(),v.getRevision());}}
}
