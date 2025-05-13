package com.cai.socialmedia.controller;

import com.cai.socialmedia.enums.SubscriptionType;
import com.cai.socialmedia.service.UserService;
import com.cai.socialmedia.util.ApiResponse;
import com.cai.socialmedia.util.SecurityUtil;
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
    public ResponseEntity<ApiResponse<Void>> changePlan(@RequestParam String newPlan) {
        String userUid = SecurityUtil.getAuthenticatedUidOrThrow();
        SubscriptionType subscriptionType = SubscriptionType.fromString(newPlan);
        userService.updateSubscription(userUid, subscriptionType);
        return ResponseEntity.ok(ApiResponse.success("Abonelik türü güncellendi", null));
    }

}
