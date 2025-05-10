package com.cai.socialmedia.util;

import com.google.cloud.Timestamp;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class DateUtil {

    public static String formatTimestamp(Timestamp timestamp) {
        if (timestamp == null) return null;
        Date date = timestamp.toDate();
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        return formatter.format(date);
    }

    public static String formatYearMonthDayPlusDays(int daysToAdd) {
        LocalDate futureDate = LocalDate.now().plusDays(daysToAdd);
        return futureDate.format(DateTimeFormatter.ISO_LOCAL_DATE); // yyyy-MM-dd
    }

    public static String formatYearMonthDay() {
        LocalDate futureDate = LocalDate.now();
        return futureDate.format(DateTimeFormatter.ISO_LOCAL_DATE); // yyyy-MM-dd
    }
}
