package com.cai.socialmedia.controller;

import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.service.UserService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public UserDocument getUserInfo(HttpServletRequest request) throws ExecutionException, InterruptedException, FirebaseAuthException {
        String idToken = extractBearerToken(request);

        // Token'ı decode et
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
        System.out.println("Token alındı: " + idToken);
        System.out.println("Decoded UID: " + decodedToken.getUid());
        // Kullanıcıyı Firestore'dan al ya da oluştur
        return userService.getOrCreateUser(decodedToken);
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new RuntimeException("Missing or invalid Authorization header");
    }
}

