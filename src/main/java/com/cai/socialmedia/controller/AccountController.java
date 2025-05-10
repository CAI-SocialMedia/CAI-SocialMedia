package com.cai.socialmedia.controller;

import com.cai.socialmedia.dto.UpdateUserRequestDTO;
import com.cai.socialmedia.enums.SubscriptionType;
import com.cai.socialmedia.service.UserService;
import com.cai.socialmedia.util.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
@AllArgsConstructor
public class AccountController {

    private final UserService userService;

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<Void>> updateUser(HttpServletRequest request, @RequestBody UpdateUserRequestDTO updateRequest) {
        String token = (String) request.getAttribute("firebaseUid");
        userService.updateUserFields(token, updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Hesap güncellendi", null));
    }

    @PostMapping("/delete")
    public ResponseEntity<ApiResponse<Void>> softDeleteUser(HttpServletRequest request) {
        String token = (String) request.getAttribute("firebaseUid");
        userService.softDeleteUser(token);
        return ResponseEntity.ok(ApiResponse.success("Hesap silindi", null));
    }

    //TODO: Subscriptions için de tablo oluşturulacak, log tutulacak
    @PostMapping("/change-plan")
    public ResponseEntity<ApiResponse<Void>> changePlan(HttpServletRequest request, @RequestParam String newPlan) {
        String token = (String) request.getAttribute("firebaseUid");
        SubscriptionType subscriptionType = SubscriptionType.fromString(newPlan);
        userService.updateSubscription(token, subscriptionType);
        return ResponseEntity.ok(ApiResponse.success("Abonelik türü güncellendi", null));
    }

}
