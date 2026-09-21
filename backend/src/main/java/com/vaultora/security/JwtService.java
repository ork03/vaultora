package com.vaultora.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMs;
    private final long extensionExpirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs,
            @Value("${app.jwt.extension-expiration-ms:600000}") long extensionExpirationMs) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 256 bits (32 bytes).");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.extensionExpirationMs = extensionExpirationMs;
    }

    public String generate(String userId, String email) {
        return generate(userId, email, expirationMs, "web");
    }

    public String generateExtension(String userId, String email) {
        return generate(userId, email, extensionExpirationMs, "extension");
    }

    private String generate(String userId, String email, long lifetimeMs, String client) {
        Date now = new Date();
        return Jwts.builder()
            .subject(userId)
            .claim("email", email)
            .claim("client", client)
            .issuedAt(now)
            .expiration(new Date(now.getTime() + lifetimeMs))
            .signWith(key)
            .compact();
    }

    public String userId(String token) {
        return claims(token).getSubject();
    }

    public boolean valid(String token) {
        try {
            claims(token);
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }

    public boolean validExtension(String token) {
        try {
            return "extension".equals(claims(token).get("client", String.class));
        } catch (RuntimeException e) {
            return false;
        }
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
