package com.cai.socialmedia.util;

import com.google.cloud.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DateUtil {

    public static String formatTimestamp(Timestamp timestamp) {
        if (timestamp == null) return null;
        Date date = timestamp.toDate();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return formatter.format(date);
    }
}
