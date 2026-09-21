package com.vaultora.vault;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface VaultRepository extends MongoRepository<Vault, String> {
    Optional<Vault> findByUserId(String userId);
}
