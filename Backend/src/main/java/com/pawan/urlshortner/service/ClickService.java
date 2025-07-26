package com.pawan.urlshortner.service;

import com.pawan.urlshortner.dto.response.ClickResponse;
import com.pawan.urlshortner.model.Click;
import com.pawan.urlshortner.model.UrlMapping;
import com.pawan.urlshortner.model.User;
import com.pawan.urlshortner.repository.ClickRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ClickService {

    @Autowired
    private ClickRepository clickRepository;

    /**
     * Records a click for the given URL mapping
     */
    public void recordClick(UrlMapping urlMapping, HttpServletRequest request) {
        try {
            Click click = new Click();
            click.setUrlMapping(urlMapping);
            click.setIpAddress(getClientIpAddress(request));
            click.setUserAgent(getUserAgent(request));
            click.setReferer(getReferer(request));
            click.setCountry(getCountryFromIp(click.getIpAddress()));
            click.setCity(getCityFromIp(click.getIpAddress()));
            click.setDevice(getDeviceType(click.getUserAgent()));
            click.setBrowser(getBrowserType(click.getUserAgent()));
            click.setClickedAt(LocalDateTime.now());

            clickRepository.save(click);
            log.info("Click recorded for URL: {} from IP: {}", urlMapping.getShortCode(), click.getIpAddress());
        } catch (Exception e) {
            log.error("Failed to record click for URL: " + urlMapping.getShortCode(), e);
        }
    }

    /**
     * Gets clicks for a specific URL mapping
     */
    public List<ClickResponse> getClicksForUrl(UrlMapping urlMapping) {
        List<Click> clicks = clickRepository.findByUrlMappingOrderByClickedAtDesc(urlMapping);
        return clicks.stream()
                .map(this::convertToClickResponse)
                .collect(Collectors.toList());
    }

    /**
     * Gets paginated clicks for a specific URL mapping
     */
    public Page<ClickResponse> getClicksForUrlPaginated(UrlMapping urlMapping, Pageable pageable) {
        Page<Click> clicks = clickRepository.findByUrlMappingOrderByClickedAtDesc(urlMapping, pageable);
        return clicks.map(this::convertToClickResponse);
    }

    /**
     * Gets total click count for a URL mapping
     */
    public Long getClickCount(UrlMapping urlMapping) {
        return clickRepository.countByUrlMapping(urlMapping);
    }

    /**
     * Gets click count for a URL mapping after a specific date
     */
    public Long getClickCountAfterDate(UrlMapping urlMapping, LocalDateTime date) {
        return clickRepository.countByUrlMappingAndClickedAtAfter(urlMapping, date);
    }

    /**
     * Gets click analytics for a user
     */
    public Map<String, Long> getUserClickAnalytics(User user) {
        Map<String, Long> analytics = new HashMap<>();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.truncatedTo(ChronoUnit.DAYS);
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusDays(30);

        analytics.put("total", clickRepository.countClicksByUser(user));
        analytics.put("today", clickRepository.countClicksByUserAndDateRange(user, startOfToday, now));
        analytics.put("thisWeek", clickRepository.countClicksByUserAndDateRange(user, startOfWeek, now));
        analytics.put("thisMonth", clickRepository.countClicksByUserAndDateRange(user, startOfMonth, now));

        return analytics;
    }

    /**
     * Gets click statistics by date for a user
     */
    public Map<String, Long> getClicksByDate(User user, int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        List<Click> clicks = clickRepository.findClicksForDateStats(user, startDate, endDate);

        Map<String, Long> clicksByDate = new HashMap<>();
        for (Click click : clicks) {
            String date = click.getClickedAt().toLocalDate().toString();
            clicksByDate.merge(date, 1L, Long::sum);
        }

        return clicksByDate;
    }

    /**
     * Gets click statistics by country
     */
    public Map<String, Long> getClicksByCountry(User user, int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        List<Click> clicks = clickRepository.findClicksForCountryStats(startDate, endDate);

        Map<String, Long> clicksByCountry = new HashMap<>();
        for (Click click : clicks) {
            String country = click.getCountry() != null ? click.getCountry() : "Unknown";
            clicksByCountry.merge(country, 1L, Long::sum);
        }

        return clicksByCountry;
    }

    /**
     * Gets click statistics by device
     */
    public Map<String, Long> getClicksByDevice(User user, int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        List<Click> clicks = clickRepository.findClicksForDeviceStats(startDate, endDate);

        Map<String, Long> clicksByDevice = new HashMap<>();
        for (Click click : clicks) {
            String device = click.getDevice() != null ? click.getDevice() : "Unknown";
            clicksByDevice.merge(device, 1L, Long::sum);
        }

        return clicksByDevice;
    }

    /**
     * Gets global click statistics (admin only)
     */
    public Map<String, Long> getGlobalClickStats() {
        Map<String, Long> stats = new HashMap<>();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.truncatedTo(ChronoUnit.DAYS);
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusDays(30);

        stats.put("total", clickRepository.count());
        stats.put("today", clickRepository.countByClickedAtAfter(startOfToday));
        stats.put("thisWeek", clickRepository.countByClickedAtAfter(startOfWeek));
        stats.put("thisMonth", clickRepository.countByClickedAtAfter(startOfMonth));

        return stats;
    }

    /**
     * Converts Click entity to ClickResponse DTO
     */
    private ClickResponse convertToClickResponse(Click click) {
        ClickResponse response = new ClickResponse();
        response.setId(click.getId());
        response.setUrlMappingId(click.getUrlMapping().getId());
        response.setShortCode(click.getUrlMapping().getShortCode());
        response.setIpAddress(click.getIpAddress());
        response.setUserAgent(click.getUserAgent());
        response.setReferer(click.getReferer());
        response.setCountry(click.getCountry());
        response.setCity(click.getCity());
        response.setDevice(click.getDevice());
        response.setBrowser(click.getBrowser());
        response.setClickedAt(click.getClickedAt());
        return response;
    }

    /**
     * Extracts client IP address from request
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    /**
     * Gets user agent from request
     */
    private String getUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent : "Unknown";
    }

    /**
     * Gets referer from request
     */
    private String getReferer(HttpServletRequest request) {
        String referer = request.getHeader("Referer");
        return referer != null ? referer : "Direct";
    }

    /**
     * Simple device type detection from user agent
     */
    private String getDeviceType(String userAgent) {
        if (userAgent == null) return "Unknown";

        userAgent = userAgent.toLowerCase();

        if (userAgent.contains("mobile") || userAgent.contains("android") || userAgent.contains("iphone")) {
            return "Mobile";
        } else if (userAgent.contains("tablet") || userAgent.contains("ipad")) {
            return "Tablet";
        } else {
            return "Desktop";
        }
    }

    /**
     * Simple browser type detection from user agent
     */
    private String getBrowserType(String userAgent) {
        if (userAgent == null) return "Unknown";

        userAgent = userAgent.toLowerCase();

        if (userAgent.contains("chrome")) {
            return "Chrome";
        } else if (userAgent.contains("firefox")) {
            return "Firefox";
        } else if (userAgent.contains("safari")) {
            return "Safari";
        } else if (userAgent.contains("edge")) {
            return "Edge";
        } else if (userAgent.contains("opera")) {
            return "Opera";
        } else {
            return "Other";
        }
    }

    /**
     * Mock country detection (in production, use a GeoIP service)
     */
    private String getCountryFromIp(String ipAddress) {
        // In production, integrate with a GeoIP service like MaxMind
        // For demo purposes, return a placeholder
        if (ipAddress != null && ipAddress.startsWith("127.")) {
            return "Local";
        }
        return "Unknown";
    }

    /**
     * Mock city detection (in production, use a GeoIP service)
     */
    private String getCityFromIp(String ipAddress) {
        // In production, integrate with a GeoIP service like MaxMind
        // For demo purposes, return a placeholder
        if (ipAddress != null && ipAddress.startsWith("127.")) {
            return "Localhost";
        }
        return "Unknown";
    }
}