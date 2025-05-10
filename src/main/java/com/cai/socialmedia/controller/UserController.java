package com.cai.socialmedia.controller;

import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.service.UserService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.ExecutionException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public UserDocument getUserInfo(HttpServletRequest request) throws ExecutionException, InterruptedException, FirebaseAuthException {
        String idToken = extractBearerToken(request);
        log.info("GET /me isteği alındı");

        // Token'ı decode et
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        log.info("Token decode edildi - UID: {}", decodedToken.getUid());
        
        // Kullanıcıyı Firestore'dan al ya da oluştur
        UserDocument user = userService.getOrCreateUser(decodedToken, null);
        log.info("Kullanıcı bilgileri alındı/oluşturuldu - UID: {}", user.getUid());
        return user;
    }

    @PostMapping("/me")
    public UserDocument createUser(HttpServletRequest request, @RequestBody Map<String, String> body) throws ExecutionException, InterruptedException, FirebaseAuthException {
        String idToken = extractBearerToken(request);
        log.info("POST /me isteği alındı");

        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        log.info("Token decode edildi - UID: {}", decodedToken.getUid());

        String username = body.get("username");
        log.info("Username alındı: {}", username);

        UserDocument user = userService.getOrCreateUser(decodedToken, username);
        log.info("Kullanıcı oluşturuldu - UID: {}, Username: {}", user.getUid(), user.getUsername());
        return user;
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new RuntimeException("Missing or invalid Authorization header");
    }

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }
}