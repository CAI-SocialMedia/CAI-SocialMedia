package com.cai.socialmedia.controller;

import com.cai.socialmedia.dto.UpdateUserRequestDTO;
import com.cai.socialmedia.dto.UserDTO;
import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.service.UserService;
import com.cai.socialmedia.exception.ApiException;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    // Kullanıcı Bilgileri
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        String uid = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(userService.getUserDtoByUid(uid));
    }

    // Kullanıcı Kayıt ve Güncelleme
    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(HttpServletRequest request, @RequestBody Map<String, String> body) {
        try {
            String idToken = extractBearerToken(request);
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String username = body.get("username");

            UserDocument user = userService.createUser(decodedToken, username);
            return ResponseEntity.ok(new UserDTO(
                user.getUid(),
                user.getUsername(),
                user.getDisplayName(),
                user.getProfilePhotoUid(),
                user.getCredits(),
                user.getSubscriptionType().name()
            ));
        } catch (FirebaseAuthException e) {
            throw new ApiException("Geçersiz Firebase token");
        }
    }

    @PutMapping("/update")
    public ResponseEntity<UserDTO> updateUser(HttpServletRequest request, @RequestBody Map<String, String> body) {
        String uid = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = body.get("username");
        String displayName = body.get("displayName");
        String profilePhotoUid = body.get("profilePhotoUid");

        UserDocument user = userService.updateUser(uid, new UpdateUserRequestDTO(uid, username, displayName, profilePhotoUid));
        return ResponseEntity.ok(new UserDTO(
            user.getUid(),
            user.getUsername(),
            user.getDisplayName(),
            user.getProfilePhotoUid(),
            user.getCredits(),
            user.getSubscriptionType().name()
        ));
    }

    // Kullanıcı Adı Kontrolü
    @PostMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        boolean available = !userService.existsByUsername(username);
        return ResponseEntity.ok(Map.of("available", available));
    }

    // Yardımcı Metodlar
    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        throw new ApiException("Geçersiz veya eksik Authorization header");
    }
}
