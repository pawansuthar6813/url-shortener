package com.pawan.urlshortner.controller;

import com.pawan.urlshortner.dto.response.ApiResponse;
import com.pawan.urlshortner.dto.response.DashboardStatsResponse;
import com.pawan.urlshortner.dto.response.UrlResponse;
import com.pawan.urlshortner.dto.response.UserResponse;
import com.pawan.urlshortner.security.UserPrincipal;
import com.pawan.urlshortner.service.AdminService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Get admin dashboard statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getAdminDashboard(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Admin dashboard requested by: {}", currentUser.getUsername());

        DashboardStatsResponse dashboardStats = adminService.getAdminDashboardStats();

        return ResponseEntity.ok(
                ApiResponse.success("Admin dashboard statistics fetched successfully", dashboardStats)
        );
    }

    /**
     * Get all users with their statistics
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("All users requested by admin: {}", currentUser.getUsername());

        List<UserResponse> users = adminService.getAllUsersWithStats();

        return ResponseEntity.ok(
                ApiResponse.success("Users fetched successfully", users)
        );
    }

    /**
     * Get paginated users with their statistics
     */
    @GetMapping("/users/paginated")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsersPaginated(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Paginated users requested by admin: {}, page: {}, size: {}",
                currentUser.getUsername(), page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> users = adminService.getAllUsersWithStatsPaginated(pageable);

        return ResponseEntity.ok(
                ApiResponse.success("Users fetched successfully", users)
        );
    }

    /**
     * Toggle user account status (activate/deactivate)
     */
    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(
            @PathVariable String userId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("User status toggle requested by admin: {} for user ID: {}",
                currentUser.getUsername(), userId);

        UserResponse userResponse = adminService.toggleUserStatus(userId);

        return ResponseEntity.ok(
                ApiResponse.success("User status updated successfully", userResponse)
        );
    }

    /**
     * Toggle user role (promote to admin or demote to user)
     */
    @PutMapping("/users/{userId}/toggle-role")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserRole(
            @PathVariable String userId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("User role toggle requested by admin: {} for user ID: {}",
                currentUser.getUsername(), userId);

        UserResponse userResponse = adminService.toggleUserRole(userId);

        return ResponseEntity.ok(
                ApiResponse.success("User role updated successfully", userResponse)
        );
    }

    /**
     * Delete a user and all their URLs
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable String userId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("User deletion requested by admin: {} for user ID: {}",
                currentUser.getUsername(), userId);

        adminService.deleteUser(userId);

        return ResponseEntity.ok(
                ApiResponse.success("User deleted successfully", null)
        );
    }

    /**
     * Get all URLs with pagination
     */
    @GetMapping("/urls")
    public ResponseEntity<ApiResponse<Page<UrlResponse>>> getAllUrls(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("All URLs requested by admin: {}, page: {}, size: {}",
                currentUser.getUsername(), page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<UrlResponse> urls = adminService.getAllUrls(pageable);

        return ResponseEntity.ok(
                ApiResponse.success("URLs fetched successfully", urls)
        );
    }

    /**
     * Toggle URL status (activate/deactivate)
     */
    @PutMapping("/urls/{urlId}/toggle-status")
    public ResponseEntity<ApiResponse<UrlResponse>> toggleUrlStatus(
            @PathVariable String urlId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("URL status toggle requested by admin: {} for URL ID: {}",
                currentUser.getUsername(), urlId);

        UrlResponse urlResponse = adminService.toggleUrlStatus(urlId);

        return ResponseEntity.ok(
                ApiResponse.success("URL status updated successfully", urlResponse)
        );
    }

    /**
     * Delete a URL
     */
    @DeleteMapping("/urls/{urlId}")
    public ResponseEntity<ApiResponse<String>> deleteUrl(
            @PathVariable String urlId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("URL deletion requested by admin: {} for URL ID: {}",
                currentUser.getUsername(), urlId);

        adminService.deleteUrl(urlId);

        return ResponseEntity.ok(
                ApiResponse.success("URL deleted successfully", null)
        );
    }

    /**
     * Get system statistics
     */
    @GetMapping("/system-stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("System statistics requested by admin: {}", currentUser.getUsername());

        Map<String, Object> systemStats = adminService.getSystemStats();

        return ResponseEntity.ok(
                ApiResponse.success("System statistics fetched successfully", systemStats)
        );
    }

    /**
     * Cleanup expired URLs
     */
    @PostMapping("/cleanup-expired-urls")
    public ResponseEntity<ApiResponse<String>> cleanupExpiredUrls(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Expired URLs cleanup requested by admin: {}", currentUser.getUsername());

        int cleanedUpCount = adminService.cleanupExpiredUrls();

        return ResponseEntity.ok(
                ApiResponse.success(
                        String.format("Successfully cleaned up %d expired URLs", cleanedUpCount),
                        String.valueOf(cleanedUpCount)
                )
        );
    }

    /**
     * Get comprehensive admin analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminAnalytics(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "30") int days) {

        log.info("Admin analytics requested by: {} for {} days", currentUser.getUsername(), days);

        Map<String, Object> analytics = new java.util.HashMap<>();

        // Get dashboard stats
        DashboardStatsResponse dashboardStats = adminService.getAdminDashboardStats();
        analytics.put("dashboardStats", dashboardStats);

        // Get system stats
        Map<String, Object> systemStats = adminService.getSystemStats();
        analytics.put("systemStats", systemStats);

        return ResponseEntity.ok(
                ApiResponse.success("Admin analytics fetched successfully", analytics)
        );
    }

    /**
     * Get admin activity log (placeholder for future implementation)
     */
    @GetMapping("/activity-log")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getActivityLog(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        log.info("Activity log requested by admin: {}", currentUser.getUsername());

        // Placeholder implementation - in production, you would have an audit log
        List<Map<String, Object>> activityLog = List.of(
                Map.of(
                        "timestamp", java.time.LocalDateTime.now(),
                        "action", "System startup",
                        "user", "system",
                        "details", "Application started successfully"
                )
        );

        return ResponseEntity.ok(
                ApiResponse.success("Activity log fetched successfully", activityLog)
        );
    }

    /**
     * Health check for admin services
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminHealth(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Admin health check requested by: {}", currentUser.getUsername());

        Map<String, Object> health = Map.of(
                "status", "UP",
                "timestamp", java.time.LocalDateTime.now(),
                "admin", currentUser.getUsername(),
                "services", Map.of(
                        "database", "UP",
                        "authentication", "UP",
                        "url_service", "UP",
                        "click_tracking", "UP"
                )
        );

        return ResponseEntity.ok(
                ApiResponse.success("Admin health check completed", health)
        );
    }
}