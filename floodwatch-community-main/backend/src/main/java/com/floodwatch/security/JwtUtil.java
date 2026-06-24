package com.floodwatch.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    private SecretKey signingKey;

    @PostConstruct
    private void initializeSigningKey() {
        if (jwtSecret != null) {
            byte[] secretBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            // HS512 requires >= 64 bytes (512 bits)
            if (secretBytes.length >= 64) {
                this.signingKey = Keys.hmacShaKeyFor(secretBytes);
            }
        }

        if (this.signingKey == null) {
            // Generate a secure HS512 key and print its Base64 to persist if desired
            this.signingKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
            String base64 = Base64.getEncoder().encodeToString(this.signingKey.getEncoded());
            System.out.println("[JwtUtil] Generated secure HS512 key. To persist, set in application.yml as jwt.secret (Base64): " + base64);
        }
    }

    private SecretKey getSigningKey() {
        return this.signingKey;
    }

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}