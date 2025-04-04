package com.cai.socialmedia.enums;

import lombok.Getter;

@Getter
public enum SubscriptionType {
    FREE(1),
    PRO(2),
    PROPLUS(3);

    private final int dailyQuota;

    SubscriptionType(int dailyQuota) {
        this.dailyQuota = dailyQuota;
    }

}
