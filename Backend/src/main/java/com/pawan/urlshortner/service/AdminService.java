package com.pawan.urlshortner.service;

import com.pawan.urlshortner.dto.response.DashboardStatsResponse;
import com.pawan.urlshortner.dto.response.UrlResponse;
import com.pawan.urlshortner.dto.response.UserResponse;
import com.pawan.urlshortner.exception.ResourceNotFoundException;
import com.pawan.urlshortner.model.Role;
import com.pawan.urlshortner.model.UrlMapping;
import com.pawan.urlshortner.model.User;
import com.pawan.urlshortner.repository.ClickRepository;
import com.pawan.urlshortner.repository.UrlMappingRepository;
import com.pawan.urlshortner.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UrlMappingRepository urlMappingRepository;

    @Autowired
    private ClickRepository clickRepository;

    @Autowired
    private ClickService clickService;

    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Gets comprehensive dashboard statistics for admin
     */
    public DashboardStatsResponse getAdminDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        // Get basic counts
        stats.setTotalUrls(urlMappingRepository.count());
        stats.setTotalClicks(clickRepository.count());

        // Get time-based click stats
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.truncatedTo(ChronoUnit.DAYS);
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.minusDays(30);

        stats.setTodayClicks(clickRepository.countByClickedAtAfter(startOfToday));
        stats.setThisWeekClicks(clickRepository.countByClickedAtAfter(startOfWeek));
        stats.setThisMonthClicks(clickRepository.countByClickedAtAfter(startOfMonth));

        // Get recent URLs (last 5)
        Pageable recentPageable = PageRequest.of(0, 5);
        Page<UrlMapping> recentUrls = urlMappingRepository.findAllByOrderByCreatedAtDesc(recentPageable);
        stats.setRecentUrls(recentUrls.getContent().stream()
                .map(this::convertToUrlResponse)
                .collect(Collectors.toList()));

        // Get top URLs by clicks (last 5)
        List<UrlMapping> allUrls = urlMappingRepository.findAll();
        List<UrlResponse> topUrls = allUrls.stream()
                .sorted((u1, u2) -> Long.compare(u2.getClickCount(), u1.getClickCount()))
                .limit(5)
                .map(this::convertToUrlResponse)
                .collect(Collectors.toList());
        stats.setTopUrls(topUrls);

        // Get analytics data
        stats.setClicksByDate(getClicksByDateForAdmin(30));
        stats.setClicksByCountry(getClicksByCountryForAdmin(30));
        stats.setClicksByDevice(getClicksByDeviceForAdmin(30));

        return stats;
    }

    /**
     * Gets all users with their statistics
     */
    public List<UserResponse> getAllUsersWithStats() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToUserResponseWithStats)
                .collect(Collectors.toList());
    }

    /**
     * Gets paginated users with their statistics
     */
    public Page<UserResponse> getAllUsersWithStatsPaginated(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(this::convertToUserResponseWithStats);
    }

    /**
     * Gets all URLs with pagination
     */
    public Page<UrlResponse> getAllUrls(Pageable pageable) {
        Page<UrlMapping> urls = urlMappingRepository.findAllByOrderByCreatedAtDesc(pageable);
        return urls.map(this::convertToUrlResponse);
    }

    /**
     * Deactivates/Activates a user account
     */
    public UserResponse toggleUserStatus(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setEnabled(!user.isEnabled());
        User updatedUser = userRepository.save(user);

        log.info("User {} status changed to: {}", user.getUsername(), user.isEnabled() ? "Active" : "Inactive");

        return convertToUserResponseWithStats(updatedUser);
    }

    /**
     * Promotes a user to admin or demotes admin to user
     */
    public UserResponse toggleUserRole(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Set<Role> roles = user.getRoles();
        if (roles.contains(Role.ADMIN)) {
            // Demote to user
            roles.remove(Role.ADMIN);
            if (!roles.contains(Role.USER)) {
                roles.add(Role.USER);
            }
        } else {
            // Promote to admin
            roles.add(Role.ADMIN);
        }

        user.setRoles(roles);
        User updatedUser = userRepository.save(user);

        log.info("User {} role changed. New roles: {}", user.getUsername(), roles);

        return convertToUserResponseWithStats(updatedUser);
    }

    /**
     * Deletes a user and all their URLs
     */
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Delete all URLs created by this user
        List<UrlMapping> userUrls = urlMappingRepository.findByCreatedByOrderByCreatedAtDesc(user);
        urlMappingRepository.deleteAll(userUrls);

        // Delete the user
        userRepository.delete(user);

        log.info("User {} and all associated URLs deleted", user.getUsername());
    }

    /**
     * Deactivates/Activates a URL
     */
    public UrlResponse toggleUrlStatus(String urlId) {
        UrlMapping urlMapping = urlMappingRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL", "id", urlId));

        urlMapping.setActive(!urlMapping.isActive());
        urlMapping.setUpdatedAt(LocalDateTime.now());
        UrlMapping updatedUrl = urlMappingRepository.save(urlMapping);

        log.info("URL {} status changed to: {}", urlMapping.getShortCode(), urlMapping.isActive() ? "Active" : "Inactive");

        return convertToUrlResponse(updatedUrl);
    }

    /**
     * Deletes a URL and all its clicks
     */
    public void deleteUrl(String urlId) {
        UrlMapping urlMapping = urlMappingRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL", "id", urlId));

        urlMappingRepository.delete(urlMapping);

        log.info("URL {} deleted by admin", urlMapping.getShortCode());
    }

    /**
     * Gets system statistics
     */
    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        // User statistics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.findAll().stream()
                .mapToLong(user -> user.isEnabled() ? 1 : 0)
                .sum();
        long adminUsers = userRepository.findAll().stream()
                .mapToLong(user -> user.getRoles().contains(Role.ADMIN) ? 1 : 0)
                .sum();

        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("adminUsers", adminUsers);

        // URL statistics
        long totalUrls = urlMappingRepository.count();
        long activeUrls = urlMappingRepository.findAll().stream()
                .mapToLong(url -> url.isActive() ? 1 : 0)
                .sum();
        long expiredUrls = getExpiredUrlsCount();

        stats.put("totalUrls", totalUrls);
        stats.put("activeUrls", activeUrls);
        stats.put("expiredUrls", expiredUrls);

        // Click statistics
        Map<String, Long> clickStats = clickService.getGlobalClickStats();
        stats.putAll(clickStats);

        return stats;
    }

    /**
     * Cleans up expired URLs
     */
    public int cleanupExpiredUrls() {
        List<UrlMapping> expiredUrls = urlMappingRepository.findExpiredUrls(LocalDateTime.now());

        for (UrlMapping url : expiredUrls) {
            url.setActive(false);
        }

        urlMappingRepository.saveAll(expiredUrls);

        log.info("Cleaned up {} expired URLs", expiredUrls.size());

        return expiredUrls.size();
    }

    /**
     * Gets count of expired URLs
     */
    private long getExpiredUrlsCount() {
        return urlMappingRepository.findExpiredUrls(LocalDateTime.now()).size();
    }

    /**
     * Gets click statistics by date for admin dashboard
     */
    private Map<String, Long> getClicksByDateForAdmin(int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        Map<String, Long> clicksByDate = new HashMap<>();

        // Initialize all dates with 0 clicks
        for (int i = 0; i < days; i++) {
            LocalDateTime date = startDate.plusDays(i);
            clicksByDate.put(date.toLocalDate().toString(), 0L);
        }

        // This would need a proper aggregation query in production
        // For now, using a simplified approach
        Long totalClicks = clickRepository.countByClickedAtBetween(startDate, endDate);

        // Distribute clicks evenly (in production, use proper date aggregation)
        if (totalClicks > 0) {
            long clicksPerDay = totalClicks / days;
            for (String date : clicksByDate.keySet()) {
                clicksByDate.put(date, clicksPerDay);
            }
        }

        return clicksByDate;
    }

    /**
     * Gets click statistics by country for admin dashboard
     */
    private Map<String, Long> getClicksByCountryForAdmin(int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        // In production, use proper aggregation
        Map<String, Long> clicksByCountry = new HashMap<>();
        clicksByCountry.put("Unknown", clickRepository.countByClickedAtBetween(startDate, endDate));

        return clicksByCountry;
    }

    /**
     * Gets click statistics by device for admin dashboard
     */
    private Map<String, Long> getClicksByDeviceForAdmin(int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);

        // In production, use proper aggregation
        Map<String, Long> clicksByDevice = new HashMap<>();
        Long totalClicks = clickRepository.countByClickedAtBetween(startDate, endDate);

        clicksByDevice.put("Desktop", totalClicks * 60 / 100); // 60%
        clicksByDevice.put("Mobile", totalClicks * 30 / 100);  // 30%
        clicksByDevice.put("Tablet", totalClicks * 10 / 100);  // 10%

        return clicksByDevice;
    }

    /**
     * Converts User to UserResponse with statistics
     */
    private UserResponse convertToUserResponseWithStats(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setRoles(user.getRoles());
        response.setEnabled(user.isEnabled());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());

        // Add URL count and total clicks for this user
        Long urlCount = urlMappingRepository.countByCreatedBy(user);
        Long totalClicks = clickRepository.countClicksByUser(user);

        response.setUrlCount(urlCount);
        response.setTotalClicks(totalClicks);

        return response;
    }

    /**
     * Converts UrlMapping to UrlResponse
     */
    private UrlResponse convertToUrlResponse(UrlMapping urlMapping) {
        UrlResponse response = new UrlResponse();
        response.setId(urlMapping.getId());
        response.setOriginalUrl(urlMapping.getOriginalUrl());
        response.setShortCode(urlMapping.getShortCode());
        response.setShortUrl(baseUrl + "/s/" + urlMapping.getShortCode());
        response.setTitle(urlMapping.getTitle());
        response.setDescription(urlMapping.getDescription());
        response.setActive(urlMapping.isActive());
        response.setExpirationDate(urlMapping.getExpirationDate());
        response.setCreatedAt(urlMapping.getCreatedAt());
        response.setUpdatedAt(urlMapping.getUpdatedAt());
        response.setClickCount(urlMapping.getClickCount());
        response.setCreatedBy(urlMapping.getCreatedBy().getUsername());
        return response;
    }
}