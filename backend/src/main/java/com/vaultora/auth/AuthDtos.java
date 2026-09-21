package com.vaultora.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() { }

    public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 12, max = 100) String password) { }

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password) { }

    public record AuthResponse(String email, String token) { }

    public record ExtensionAuthResponse(String email, String token, long expiresInSeconds) { }
}
