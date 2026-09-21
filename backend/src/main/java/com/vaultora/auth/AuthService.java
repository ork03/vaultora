package com.vaultora.auth;

import java.time.Instant;
import com.vaultora.user.User;
import com.vaultora.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final BCryptPasswordEncoder legacyBcrypt;
    private final LoginRateLimiter limiter;

    public AuthService(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            BCryptPasswordEncoder legacyBcrypt,
            LoginRateLimiter limiter) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.legacyBcrypt = legacyBcrypt;
        this.limiter = limiter;
    }

    public User register(AuthDtos.RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "An account already exists for this email");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setCreatedAt(Instant.now());
        return users.save(user);
    }

    public User login(AuthDtos.LoginRequest request, HttpServletRequest http) {
        String email = request.email().trim().toLowerCase();

        if (!limiter.allowed(email, http.getRemoteAddr())) {
            throw new ResponseStatusException(
                HttpStatus.TOO_MANY_REQUESTS,
                "Too many login attempts. Please try again later.");
        }

        User user = users.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        String stored = user.getPasswordHash();
        boolean argon2Match = stored != null && passwordEncoder.matches(request.password(), stored);
        boolean legacyBcryptMatch = stored != null
            && (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$"))
            && legacyBcrypt.matches(request.password(), stored);

        if (!argon2Match && !legacyBcryptMatch) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        // Existing BCrypt users are transparently upgraded to Argon2id.
        if (legacyBcryptMatch) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            users.save(user);
        }

        return user;
    }
}
