package com.pawan.urlshortner.util;

import java.security.SecureRandom;
import java.util.regex.Pattern;

public class UrlShortenerUtil {

    private static final String CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int SHORT_CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Pattern URL_PATTERN = Pattern.compile(
            "^(https?://)?" + // Protocol (optional)
                    "([\\w\\-\\.]+)" + // Domain
                    "(\\.[a-zA-Z]{2,})?" + // TLD (optional for localhost)
                    "(:[0-9]+)?" + // Port (optional)
                    "(/.*)?$" // Path (optional)
    );

    /**
     * Generates a random short code of specified length
     */
    public static String generateShortCode() {
        return generateShortCode(SHORT_CODE_LENGTH);
    }

    /**
     * Generates a random short code of custom length
     */
    public static String generateShortCode(int length) {
        StringBuilder shortCode = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            shortCode.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return shortCode.toString();
    }

    /**
     * Validates if the provided string is a valid URL
     */
    public static boolean isValidUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        return URL_PATTERN.matcher(url.trim()).matches();
    }

    /**
     * Normalizes URL by adding protocol if missing
     */
    public static String normalizeUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return url;
        }

        url = url.trim();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        return url;
    }

    /**
     * Validates custom short code format
     */
    public static boolean isValidCustomCode(String customCode) {
        if (customCode == null || customCode.trim().isEmpty()) {
            return false;
        }

        String trimmed = customCode.trim();

        // Check length (3-20 characters)
        if (trimmed.length() < 3 || trimmed.length() > 20) {
            return false;
        }

        // Check if contains only alphanumeric characters, hyphens, and underscores
        return trimmed.matches("^[a-zA-Z0-9_-]+$");
    }

    /**
     * Extracts domain from URL for analytics
     */
    public static String extractDomain(String url) {
        if (url == null || url.trim().isEmpty()) {
            return "Unknown";
        }

        try {
            url = normalizeUrl(url);
            String domain = url.replaceFirst("https?://", "");
            domain = domain.split("/")[0];
            domain = domain.split(":")[0]; // Remove port if present
            return domain.toLowerCase();
        } catch (Exception e) {
            return "Unknown";
        }
    }

    /**
     * Checks if URL is potentially malicious (basic check)
     */
    public static boolean isSuspiciousUrl(String url) {
        if (url == null) return true;

        String lowerUrl = url.toLowerCase();
        String[] suspiciousPatterns = {
                "bit.ly", "tinyurl.com", "t.co", // Already shortened URLs
                "malware", "phishing", "virus",
                "127.0.0.1", "localhost"
        };

        for (String pattern : suspiciousPatterns) {
            if (lowerUrl.contains(pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generates a QR code URL for the short URL (using external service)
     */
    public static String generateQRCodeUrl(String shortUrl) {
        if (shortUrl == null || shortUrl.trim().isEmpty()) {
            return null;
        }

        try {
            String encodedUrl = java.net.URLEncoder.encode(shortUrl, "UTF-8");
            return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodedUrl;
        } catch (Exception e) {
            return null;
        }
    }
}