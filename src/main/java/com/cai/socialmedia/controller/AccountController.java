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

    //TODO: Subscriptions için de tablo oluşturulacak, log tutulacak
    @PostMapping("/change-plan")
    public ResponseEntity<ApiResponse<Void>> changePlan(HttpServletRequest request, @RequestParam String newPlan) {
        String token = (String) request.getAttribute("firebaseUid");
        SubscriptionType subscriptionType = SubscriptionType.fromString(newPlan);
        userService.updateSubscription(token, subscriptionType);
        return ResponseEntity.ok(ApiResponse.success("Abonelik türü güncellendi", null));
    }

}
