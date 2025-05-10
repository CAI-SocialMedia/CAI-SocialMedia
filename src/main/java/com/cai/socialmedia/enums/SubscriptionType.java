package com.cai.socialmedia.enums;

import com.cai.socialmedia.exception.ApiException;
import lombok.Getter;

@Getter
public enum SubscriptionType {
    FREE(1, "Free Plan"),
    PRO(3, "Pro Plan"),
    PROPLUS(5, "Pro+ Plan");

    private final int dailyQuota;
    private final String description;

    SubscriptionType(int dailyQuota, String description) {
        this.dailyQuota = dailyQuota;
        this.description = description;
    }

    public static SubscriptionType fromString(String type) {
        try {
            return SubscriptionType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException("Geçersiz abonelik türü " + type);
        }
    }
}
