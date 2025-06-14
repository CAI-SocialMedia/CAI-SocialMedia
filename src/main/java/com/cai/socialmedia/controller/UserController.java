package com.cai.socialmedia.controller;

import com.cai.socialmedia.dto.PublicUserDTO;
import com.cai.socialmedia.dto.UpdateUserRequestDTO;
import com.cai.socialmedia.dto.UserDTO;
import com.cai.socialmedia.enums.SubscriptionType;
import com.cai.socialmedia.model.UserDocument;
import com.cai.socialmedia.service.UserService;
import com.cai.socialmedia.exception.ApiException;
import com.cai.socialmedia.util.ApiResponse;
import com.cai.socialmedia.util.SecurityUtil;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
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
        String uid = SecurityUtil.getAuthenticatedUidOrThrow();
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
    public ResponseEntity<UserDTO> updateUser(@RequestBody Map<String, String> body) {
        String uid = SecurityUtil.getAuthenticatedUidOrThrow();
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

    // Abonelik planını güncelle
    @PostMapping("/subscription/update")
    public ResponseEntity<ApiResponse<Void>> updateSubscription(@RequestBody Map<String, String> body) {
        String uid = SecurityUtil.getAuthenticatedUidOrThrow();
        String newPlan = body.get("subscriptionType");
        if (newPlan == null || newPlan.isEmpty()) {
            throw new ApiException("Abonelik planı gönderilmedi");
        }
        userService.updateSubscription(uid, SubscriptionType.fromString(newPlan));
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Kullanıcının mevcut abonelik planını getir
    @GetMapping("/subscription")
    public ResponseEntity<ApiResponse<SubscriptionType>> getCurrentSubscription() {
        String uid = SecurityUtil.getAuthenticatedUidOrThrow();
        UserDocument user = userService.getUserByUid(uid);
        return ResponseEntity.ok(ApiResponse.success(user.getSubscriptionType()));
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

    @GetMapping("/public/{userUid}")
    public ResponseEntity<ApiResponse<PublicUserDTO>> getPublicUserByUid(@PathVariable String userUid) {
        SecurityUtil.getAuthenticatedUidOrThrow();
        PublicUserDTO fullUser = userService.getPublicUserByUid(userUid);
        return ResponseEntity.ok(ApiResponse.success(fullUser));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PublicUserDTO>>> searchUsers(@RequestParam String q) {
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("Arama sorgusu bos olamaz"));
        }
        try {
            String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
            List<PublicUserDTO> results = userService.searchUsers(q.trim(), userUid);
            return ResponseEntity.ok(ApiResponse.success("Arama basarili", results));
        } catch (Exception e) {
            log.error("Kullanici arama hatasi: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.fail("Beklenmeyen hata olustu"));
        }
    }
}
