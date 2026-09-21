package com.vaultora.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class LoginRateLimiter {
    private static final int MAX_ACCOUNT_ATTEMPTS = 5;
    private static final int MAX_IP_ATTEMPTS = 30;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final StringRedisTemplate redis;

    public LoginRateLimiter(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public boolean allowed(String email, String ipAddress) {
        String accountKey = "vaultora:rl:account:" + sha256(email);
        String ipKey = "vaultora:rl:ip:" + sha256(ipAddress);

        long accountAttempts = increment(accountKey);
        long ipAttempts = increment(ipKey);

        return accountAttempts <= MAX_ACCOUNT_ATTEMPTS && ipAttempts <= MAX_IP_ATTEMPTS;
    }

    private long increment(String key) {
        Long value = redis.opsForValue().increment(key);
        if (value != null && value == 1L) {
            redis.expire(key, WINDOW);
        }
        return value == null ? Long.MAX_VALUE : value;
    }

    private static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to hash rate-limit key", e);
        }
    }
}
