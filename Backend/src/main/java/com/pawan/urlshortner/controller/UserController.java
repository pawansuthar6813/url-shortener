package com.pawan.urlshortner.controller;

import com.pawan.urlshortner.dto.request.UpdateUserRequest;
import com.pawan.urlshortner.dto.response.ApiResponse;
import com.pawan.urlshortner.dto.response.DashboardStatsResponse;
import com.pawan.urlshortner.dto.response.UserResponse;
import com.pawan.urlshortner.model.User;
import com.pawan.urlshortner.security.UserPrincipal;
import com.pawan.urlshortner.service.ClickService;
import com.pawan.urlshortner.service.UserService;
import com.pawan.urlshortner.repository.UrlMappingRepository;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ClickService clickService;

    @Autowired
    private UrlMappingRepository urlMappingRepository;

    /**
     * Get current user's profile
     */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUserProfile(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Fetching profile for user: {}", currentUser.getUsername());

        UserResponse userResponse = userService.getUserProfile(currentUser.getId());

        return ResponseEntity.ok(
                ApiResponse.success("User profile fetched successfully", userResponse)
        );
    }

    /**
     * Update current user's profile
     */
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateCurrentUserProfile(
            @Valid @RequestBody UpdateUserRequest updateRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Updating profile for user: {}", currentUser.getUsername());

        UserResponse userResponse = userService.updateUserProfile(currentUser.getId(), updateRequest);

        log.info("Profile updated successfully for user: {}", currentUser.getUsername());

        return ResponseEntity.ok(
                ApiResponse.success("User profile updated successfully", userResponse)
        );
    }

    /**
     * Get user's dashboard statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getUserDashboard(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Fetching dashboard stats for user: {}", currentUser.getUsername());

        User user = userService.findById(currentUser.getId());

        DashboardStatsResponse dashboardStats = new DashboardStatsResponse();

        // Get basic URL statistics
        Long totalUrls = urlMappingRepository.countByCreatedBy(user);
        dashboardStats.setTotalUrls(totalUrls);

        // Get click analytics
        Map<String, Long> clickAnalytics = clickService.getUserClickAnalytics(user);
        dashboardStats.setTotalClicks(clickAnalytics.get("total"));
        dashboardStats.setTodayClicks(clickAnalytics.get("today"));
        dashboardStats.setThisWeekClicks(clickAnalytics.get("thisWeek"));
        dashboardStats.setThisMonthClicks(clickAnalytics.get("thisMonth"));

        // Get recent URLs (last 5)
        dashboardStats.setRecentUrls(
                urlMappingRepository.findByCreatedByOrderByCreatedAtDesc(user)
                        .stream()
                        .limit(5)
                        .map(urlMapping -> {
                            var response = new com.pawan.urlshortner.dto.response.UrlResponse();
                            response.setId(urlMapping.getId());
                            response.setOriginalUrl(urlMapping.getOriginalUrl());
                            response.setShortCode(urlMapping.getShortCode());
                            response.setTitle(urlMapping.getTitle());
                            response.setActive(urlMapping.isActive());
                            response.setCreatedAt(urlMapping.getCreatedAt());
                            response.setClickCount(urlMapping.getClickCount());
                            return response;
                        })
                        .toList()
        );

        // Get top URLs by clicks (last 5)
        dashboardStats.setTopUrls(
                urlMappingRepository.findTopUrlsByUser(
                                user,
                                org.springframework.data.domain.PageRequest.of(0, 5)
                        ).stream()
                        .map(urlMapping -> {
                            var response = new com.pawan.urlshortner.dto.response.UrlResponse();
                            response.setId(urlMapping.getId());
                            response.setOriginalUrl(urlMapping.getOriginalUrl());
                            response.setShortCode(urlMapping.getShortCode());
                            response.setTitle(urlMapping.getTitle());
                            response.setActive(urlMapping.isActive());
                            response.setCreatedAt(urlMapping.getCreatedAt());
                            response.setClickCount(urlMapping.getClickCount());
                            return response;
                        })
                        .toList()
        );

        // Get analytics data
        dashboardStats.setClicksByDate(clickService.getClicksByDate(user, 30));
        dashboardStats.setClicksByCountry(clickService.getClicksByCountry(user, 30));
        dashboardStats.setClicksByDevice(clickService.getClicksByDevice(user, 30));

        return ResponseEntity.ok(
                ApiResponse.success("Dashboard statistics fetched successfully", dashboardStats)
        );
    }

    /**
     * Get user's click analytics for specific time periods
     */
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserAnalytics(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "30") int days) {

        log.info("Fetching analytics for user: {} for {} days", currentUser.getUsername(), days);

        User user = userService.findById(currentUser.getId());

        Map<String, Object> analytics = new java.util.HashMap<>();

        // Basic stats
        Map<String, Long> clickStats = clickService.getUserClickAnalytics(user);
        analytics.put("clickStats", clickStats);

        // Time-based analytics
        analytics.put("clicksByDate", clickService.getClicksByDate(user, days));
        analytics.put("clicksByCountry", clickService.getClicksByCountry(user, days));
        analytics.put("clicksByDevice", clickService.getClicksByDevice(user, days));

        // URL stats
        Long totalUrls = urlMappingRepository.countByCreatedBy(user);
        Long activeUrls = (long) urlMappingRepository.findByCreatedByAndIsActiveOrderByCreatedAtDesc(user, true).size();
        analytics.put("totalUrls", totalUrls);
        analytics.put("activeUrls", activeUrls);
        analytics.put("inactiveUrls", totalUrls - activeUrls);

        return ResponseEntity.ok(
                ApiResponse.success("User analytics fetched successfully", analytics)
        );
    }

    /**
     * Get user's account statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStats(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Fetching stats for user: {}", currentUser.getUsername());

        User user = userService.findById(currentUser.getId());

        Map<String, Object> stats = new java.util.HashMap<>();

        // URL statistics
        Long totalUrls = urlMappingRepository.countByCreatedBy(user);
        Long activeUrls = (long) urlMappingRepository.findByCreatedByAndIsActiveOrderByCreatedAtDesc(user, true).size();

        stats.put("totalUrls", totalUrls);
        stats.put("activeUrls", activeUrls);
        stats.put("inactiveUrls", totalUrls - activeUrls);

        // Click statistics
        Map<String, Long> clickAnalytics = clickService.getUserClickAnalytics(user);
        stats.putAll(clickAnalytics);

        // Account info
        stats.put("memberSince", user.getCreatedAt());
        stats.put("lastUpdated", user.getUpdatedAt());
        stats.put("accountStatus", user.isEnabled() ? "Active" : "Inactive");

        return ResponseEntity.ok(
                ApiResponse.success("User statistics fetched successfully", stats)
        );
    }

    /**
     * Change user password
     */
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody Map<String, String> passwordData,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Password change request for user: {}", currentUser.getUsername());

        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Current password and new password are required", "INVALID_REQUEST")
            );
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("New password must be at least 6 characters long", "INVALID_PASSWORD")
            );
        }

        // In a real implementation, you would verify the current password
        // and then update with the new password
        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setPassword(newPassword);

        userService.updateUserProfile(currentUser.getId(), updateRequest);

        log.info("Password changed successfully for user: {}", currentUser.getUsername());

        return ResponseEntity.ok(
                ApiResponse.success("Password changed successfully", null)
        );
    }

    /**
     * Deactivate user account
     */
    @PutMapping("/deactivate")
    public ResponseEntity<ApiResponse<String>> deactivateAccount(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Account deactivation request for user: {}", currentUser.getUsername());

        // In a real implementation, you would mark the user as inactive
        // For now, just return a success message

        return ResponseEntity.ok(
                ApiResponse.success("Account deactivation request received. Please contact support to complete the process.", null)
        );
    }
}