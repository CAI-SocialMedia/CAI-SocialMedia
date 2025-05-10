package com.cai.socialmedia.model;

import com.cai.socialmedia.enums.Role;
import com.cai.socialmedia.enums.SubscriptionType;
import lombok.Data;
import lombok.Getter;

@Getter
@Data
public class UserDocument {
    private String uid;

    private String username;
    private String email;
    private String displayName;
    private String profilePhotoUid;

    private Role role;

    private SubscriptionType subscriptionType;
    private Boolean isPremium;
    private String subscriptionStartDate;
    private String subscriptionEndDate;
    private Integer dailyQuota;
    private Integer credits;
    private String lastQuotaResetDate;

    private String createdAt;
    private String updatedAt;
    private Boolean isDeleted = false;
}
