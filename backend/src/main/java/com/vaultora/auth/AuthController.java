package com.vaultora.auth;

import com.vaultora.security.JwtService;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;
    private final boolean secureCookie;
    private final long extensionExpirationMs;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            @Value("${app.cookie.secure:false}") boolean secureCookie,
            @Value("${app.jwt.extension-expiration-ms:600000}") long extensionExpirationMs) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.secureCookie = secureCookie;
        this.extensionExpirationMs = extensionExpirationMs;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.AuthResponse register(
            @Valid @RequestBody AuthDtos.RegisterRequest request,
            HttpServletResponse response) {
        var user = authService.register(request);
        String token = jwtService.generate(user.getId(), user.getEmail());
        setCookie(response, token);
        return new AuthDtos.AuthResponse(user.getEmail(), null);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(
            @Valid @RequestBody AuthDtos.LoginRequest request,
            HttpServletRequest requestServlet,
            HttpServletResponse response) {
        var user = authService.login(request, requestServlet);
        String token = jwtService.generate(user.getId(), user.getEmail());
        setCookie(response, token);
        return new AuthDtos.AuthResponse(user.getEmail(), null);
    }

    /**
     * Browser-extension login deliberately uses a short-lived bearer token.
     * The extension keeps it only in chrome.storage.session; it is never
     * persisted to localStorage, sync storage, or a webpage.
     */
    @PostMapping("/extension-login")
    public AuthDtos.ExtensionAuthResponse extensionLogin(
            @Valid @RequestBody AuthDtos.LoginRequest request,
            HttpServletRequest requestServlet) {
        var user = authService.login(request, requestServlet);
        String token = jwtService.generateExtension(user.getId(), user.getEmail());
        return new AuthDtos.ExtensionAuthResponse(
            user.getEmail(), token, extensionExpirationMs / 1000);
    }

    @GetMapping("/me")
    public AuthDtos.AuthResponse me(Authentication authentication) {
        return new AuthDtos.AuthResponse(authentication.getName(), null);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("VAULTORA_SESSION", "")
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ZERO)
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void setCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("VAULTORA_SESSION", token)
            .httpOnly(true)
            .secure(secureCookie)
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ofMinutes(30))
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
