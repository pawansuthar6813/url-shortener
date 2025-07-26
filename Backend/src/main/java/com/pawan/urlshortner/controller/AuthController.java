package com.pawan.urlshortner.controller;

import com.pawan.urlshortner.dto.request.LoginRequest;
import com.pawan.urlshortner.dto.request.SignupRequest;
import com.pawan.urlshortner.dto.response.ApiResponse;
import com.pawan.urlshortner.dto.response.JwtResponse;
import com.pawan.urlshortner.service.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * User login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for user: {}", loginRequest.getUsernameOrEmail());

        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);

            log.info("User {} logged in successfully", loginRequest.getUsernameOrEmail());

            return ResponseEntity.ok(
                    ApiResponse.success("User logged in successfully", jwtResponse)
            );
        } catch (Exception e) {
            log.error("Login failed for user: {}", loginRequest.getUsernameOrEmail(), e);
            throw e;
        }
    }

    /**
     * User registration endpoint
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<JwtResponse>> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        log.info("Registration attempt for user: {}", signUpRequest.getUsername());

        try {
            JwtResponse jwtResponse = authService.registerUser(signUpRequest);

            log.info("User {} registered successfully", signUpRequest.getUsername());

            return ResponseEntity.ok(
                    ApiResponse.success("User registered successfully", jwtResponse)
            );
        } catch (Exception e) {
            log.error("Registration failed for user: {}", signUpRequest.getUsername(), e);
            throw e;
        }
    }

    /**
     * Logout endpoint (client-side token removal)
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser() {
        // In a stateless JWT implementation, logout is typically handled client-side
        // by removing the token from storage. However, you could implement token blacklisting
        // or use refresh token revocation here if needed.

        log.info("User logout request received");

        return ResponseEntity.ok(
                ApiResponse.success("User logged out successfully", "Token should be removed from client storage")
        );
    }

    /**
     * Refresh token endpoint (optional - if implementing refresh tokens)
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<String>> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        // This is a placeholder for refresh token functionality
        // You would implement refresh token validation and new token generation here

        log.info("Token refresh request received");

        return ResponseEntity.ok(
                ApiResponse.success("Token refresh functionality not implemented yet", null)
        );
    }

    /**
     * Health check endpoint for authentication service
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(
                ApiResponse.success("Authentication service is running", "OK")
        );
    }
}