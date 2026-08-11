package com.water.monitoring_and_billing_platform.util;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Getter
@Builder
@ToString
public class PeriodResolver {

    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String label;
    private final Integer month;
    private final Integer year;
    private final boolean isExplicitLatest;
    private final boolean isPeriodSpecified;

    private static final Pattern YEAR_PATTERN = Pattern.compile("\\b(202[0-9])\\b");
    private static final Pattern MONTHS_AGO_PATTERN = Pattern.compile("(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)\\s+months?\\s+ago", Pattern.CASE_INSENSITIVE);

    public static PeriodResolver resolve(String message, LocalDate referenceDate) {
        if (referenceDate == null) {
            referenceDate = LocalDate.now();
        }
        String lower = message != null ? message.toLowerCase().trim() : "";

        // Check if explicitly asking for "latest", "recent", "current reading", "now"
        boolean isLatest = (lower.contains("latest") || lower.contains("recent") || lower.contains("current reading") || lower.contains("right now"))
                && !lower.contains("last month") && !lower.contains("previous month");

        // 1. Check for specific year mention
        Integer extractedYear = null;
        Matcher yearMatcher = YEAR_PATTERN.matcher(lower);
        if (yearMatcher.find()) {
            extractedYear = Integer.parseInt(yearMatcher.group(1));
        }

        // 2. Relative Period Phrases
        if (lower.contains("last month") || lower.contains("previous month") || lower.contains("past month") || lower.contains("one month ago") || lower.contains("1 month ago")) {
            LocalDate targetDate = referenceDate.minusMonths(1);
            LocalDate start = targetDate.withDayOfMonth(1);
            LocalDate end = targetDate.withDayOfMonth(targetDate.lengthOfMonth());
            String label = targetDate.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + targetDate.getYear();
            return PeriodResolver.builder()
                    .startDate(start)
                    .endDate(end)
                    .label(label)
                    .month(targetDate.getMonthValue())
                    .year(targetDate.getYear())
                    .isExplicitLatest(false)
                    .isPeriodSpecified(true)
                    .build();
        }

        if (lower.contains("this month") || lower.contains("current month")) {
            LocalDate start = referenceDate.withDayOfMonth(1);
            LocalDate end = referenceDate.withDayOfMonth(referenceDate.lengthOfMonth());
            String label = referenceDate.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + referenceDate.getYear();
            return PeriodResolver.builder()
                    .startDate(start)
                    .endDate(end)
                    .label(label)
                    .month(referenceDate.getMonthValue())
                    .year(referenceDate.getYear())
                    .isExplicitLatest(false)
                    .isPeriodSpecified(true)
                    .build();
        }

        if (lower.contains("today")) {
            return PeriodResolver.builder()
                    .startDate(referenceDate)
                    .endDate(referenceDate)
                    .label("Today (" + referenceDate + ")")
                    .month(referenceDate.getMonthValue())
                    .year(referenceDate.getYear())
                    .isExplicitLatest(false)
                    .isPeriodSpecified(true)
                    .build();
        }

        if (lower.contains("yesterday")) {
            LocalDate yesterday = referenceDate.minusDays(1);
            return PeriodResolver.builder()
                    .startDate(yesterday)
                    .endDate(yesterday)
                    .label("Yesterday (" + yesterday + ")")
                    .month(yesterday.getMonthValue())
                    .year(yesterday.getYear())
                    .isExplicitLatest(false)
                    .isPeriodSpecified(true)
                    .build();
        }

        if (lower.contains("last 3 months") || lower.contains("past 3 months")) {
            LocalDate start = referenceDate.minusMonths(3).withDayOfMonth(1);
            LocalDate end = referenceDate.withDayOfMonth(referenceDate.lengthOfMonth());
            return PeriodResolver.builder()
                    .startDate(start)
                    .endDate(end)
                    .label("Last 3 Months (" + start.getMonth().name() + " - " + end.getMonth().name() + " " + end.getYear() + ")")
                    .month(null)
                    .year(end.getYear())
                    .isExplicitLatest(false)
                    .isPeriodSpecified(true)
                    .build();
        }

        Matcher monthsAgoMatcher = MONTHS_AGO_PATTERN.matcher(lower);
        if (monthsAgoMatcher.find()) {
            String word = monthsAgoMatcher.group(1).toLowerCase();
            int count = parseWordNumber(word);
            LocalDate targetDate = referenceDate.minusMonths(count);
            LocalDate start = targetDate.withDayOfMonth(1);
            LocalDate end = targetDate.withDayOfMonth(targetDate.lengthOfMonth());
            String label = targetDate.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + targetDate.getYear();
            return PeriodResolver.builder()
                    .startDate(start)
                    .endDate(end)
                    .label(label)
                    .month(targetDate.getMonthValue())
                    .year(targetDate.getYear())
                    .isExplicitLatest(false)
                    .isPeriodSpecified(true)
                    .build();
        }

        // 3. Named Calendar Months (e.g. "March", "June 2026", "in April")
        Month matchedMonth = null;
        if (lower.contains("january") || lower.matches(".*\\bjan\\b.*")) matchedMonth = Month.JANUARY;
        else if (lower.contains("february") || lower.matches(".*\\bfeb\\b.*")) matchedMonth = Month.FEBRUARY;
        else if (lower.contains("march") || lower.matches(".*\\bmar\\b.*")) matchedMonth = Month.MARCH;
        else if (lower.contains("april") || lower.matches(".*\\bapr\\b.*")) matchedMonth = Month.APRIL;
        else if (lower.contains("may") || lower.matches(".*\\bmay\\b.*")) matchedMonth = Month.MAY;
        else if (lower.contains("june") || lower.matches(".*\\bjun\\b.*")) matchedMonth = Month.JUNE;
        else if (lower.contains("july") || lower.matches(".*\\bjul\\b.*")) matchedMonth = Month.JULY;
        else if (lower.contains("august") || lower.matches(".*\\baug\\b.*")) matchedMonth = Month.AUGUST;
        else if (lower.contains("september") || lower.matches(".*\\bsep\\b.*")) matchedMonth = Month.SEPTEMBER;
        else if (lower.contains("october") || lower.matches(".*\\boct\\b.*")) matchedMonth = Month.OCTOBER;
        else if (lower.contains("november") || lower.matches(".*\\bnov\\b.*")) matchedMonth = Month.NOVEMBER;
        else if (lower.contains("december") || lower.matches(".*\\bdec\\b.*")) matchedMonth = Month.DECEMBER;

        if (matchedMonth != null) {
            int targetYear = extractedYear != null ? extractedYear : referenceDate.getYear();
            LocalDate start = LocalDate.of(targetYear, matchedMonth, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            String label = matchedMonth.getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + targetYear;
            return PeriodResolver.builder()
                    .startDate(start)
                    .endDate(end)
                    .label(label)
                    .month(matchedMonth.getValue())
                    .year(targetYear)
                    .isExplicitLatest(false)
                    .isPeriodSpecified(true)
                    .build();
        }

        // 4. Default: No specific period detected (or explicit latest)
        return PeriodResolver.builder()
                .startDate(null)
                .endDate(null)
                .label(null)
                .month(null)
                .year(extractedYear)
                .isExplicitLatest(isLatest)
                .isPeriodSpecified(false)
                .build();
    }

    private static int parseWordNumber(String word) {
        return switch (word) {
            case "one", "1" -> 1;
            case "two", "2" -> 2;
            case "three", "3" -> 3;
            case "four", "4" -> 4;
            case "five", "5" -> 5;
            case "six", "6" -> 6;
            case "seven", "7" -> 7;
            case "eight", "8" -> 8;
            case "nine", "9" -> 9;
            case "ten", "10" -> 10;
            default -> 1;
        };
    }
}
