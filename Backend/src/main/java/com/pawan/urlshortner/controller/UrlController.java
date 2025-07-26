package com.pawan.urlshortner.controller;

import com.pawan.urlshortner.dto.request.CreateUrlRequest;
import com.pawan.urlshortner.dto.response.ApiResponse;
import com.pawan.urlshortner.dto.response.ClickResponse;
import com.pawan.urlshortner.dto.response.UrlResponse;
import com.pawan.urlshortner.model.UrlMapping;
import com.pawan.urlshortner.repository.UrlMappingRepository;
import com.pawan.urlshortner.security.UserPrincipal;
import com.pawan.urlshortner.service.ClickService;
import com.pawan.urlshortner.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/url")
public class UrlController {

    @Autowired
    private UrlService urlService;

    @Autowired
    private ClickService clickService;

    @Autowired
    private UrlMappingRepository urlMappingRepository;

    /**
     * Create a new short URL
     */
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<UrlResponse>> createShortUrl(
            @Valid @RequestBody CreateUrlRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Creating short URL for user: {}, original URL: {}",
                currentUser.getUsername(), request.getOriginalUrl());

        UrlResponse urlResponse = urlService.createShortUrl(request, currentUser.getId());

        log.info("Short URL created successfully: {}", urlResponse.getShortCode());

        return ResponseEntity.ok(
                ApiResponse.success("Short URL created successfully", urlResponse)
        );
    }

    /**
     * Get all URLs for the current user
     */
    @GetMapping("/my-urls")
    public ResponseEntity<ApiResponse<List<UrlResponse>>> getUserUrls(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Fetching URLs for user: {}", currentUser.getUsername());

        List<UrlResponse> urls = urlService.getUserUrls(currentUser.getId());

        return ResponseEntity.ok(
                ApiResponse.success("URLs fetched successfully", urls)
        );
    }

    /**
     * Get paginated URLs for the current user
     */
    @GetMapping("/my-urls/paginated")
    public ResponseEntity<ApiResponse<Page<UrlResponse>>> getUserUrlsPaginated(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Fetching paginated URLs for user: {}, page: {}, size: {}",
                currentUser.getUsername(), page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<UrlResponse> urls = urlService.getUserUrlsPaginated(currentUser.getId(), pageable);

        return ResponseEntity.ok(
                ApiResponse.success("URLs fetched successfully", urls)
        );
    }

    /**
     * Get a specific URL by ID
     */
    @GetMapping("/{urlId}")
    public ResponseEntity<ApiResponse<UrlResponse>> getUrlById(
            @PathVariable String urlId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Fetching URL details for ID: {} by user: {}", urlId, currentUser.getUsername());

        UrlResponse urlResponse = urlService.getUrlById(urlId, currentUser.getId());

        return ResponseEntity.ok(
                ApiResponse.success("URL details fetched successfully", urlResponse)
        );
    }

    /**
     * Delete a URL
     */
    @DeleteMapping("/{urlId}")
    public ResponseEntity<ApiResponse<String>> deleteUrl(
            @PathVariable String urlId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Deleting URL ID: {} by user: {}", urlId, currentUser.getUsername());

        urlService.deleteUrl(urlId, currentUser.getId());

        return ResponseEntity.ok(
                ApiResponse.success("URL deleted successfully", null)
        );
    }

    /**
     * Toggle URL active status
     */
    @PutMapping("/{urlId}/toggle-status")
    public ResponseEntity<ApiResponse<UrlResponse>> toggleUrlStatus(
            @PathVariable String urlId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Toggling status for URL ID: {} by user: {}", urlId, currentUser.getUsername());

        UrlResponse urlResponse = urlService.toggleUrlStatus(urlId, currentUser.getId());

        return ResponseEntity.ok(
                ApiResponse.success("URL status updated successfully", urlResponse)
        );
    }

    /**
     * Get click analytics for a specific URL
     */
    @GetMapping("/{urlId}/analytics")
    public ResponseEntity<ApiResponse<List<ClickResponse>>> getUrlAnalytics(
            @PathVariable String urlId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        log.info("Fetching analytics for URL ID: {} by user: {}", urlId, currentUser.getUsername());

        // First verify the URL belongs to the user
        UrlResponse urlResponse = urlService.getUrlById(urlId, currentUser.getId());

        // Get the URL mapping for click analytics
        UrlMapping urlMapping = urlMappingRepository.findById(urlId)
                .orElseThrow(() -> new RuntimeException("URL not found"));

        List<ClickResponse> clicks = clickService.getClicksForUrl(urlMapping);

        return ResponseEntity.ok(
                ApiResponse.success("URL analytics fetched successfully", clicks)
        );
    }

    /**
     * Get paginated click analytics for a specific URL
     */
    @GetMapping("/{urlId}/analytics/paginated")
    public ResponseEntity<ApiResponse<Page<ClickResponse>>> getUrlAnalyticsPaginated(
            @PathVariable String urlId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("Fetching paginated analytics for URL ID: {} by user: {}, page: {}, size: {}",
                urlId, currentUser.getUsername(), page, size);

        // First verify the URL belongs to the user
        UrlResponse urlResponse = urlService.getUrlById(urlId, currentUser.getId());

        // Get the URL mapping for click analytics
        UrlMapping urlMapping = urlMappingRepository.findById(urlId)
                .orElseThrow(() -> new RuntimeException("URL not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<ClickResponse> clicks = clickService.getClicksForUrlPaginated(urlMapping, pageable);

        return ResponseEntity.ok(
                ApiResponse.success("URL analytics fetched successfully", clicks)
        );
    }
}

/**
 * Separate controller for URL redirection (public access)
 */
@RestController
@Slf4j
class UrlRedirectController {

    @Autowired
    private UrlService urlService;

    @Autowired
    private ClickService clickService;

    @Autowired
    private UrlMappingRepository urlMappingRepository;

    /**
     * Redirect short URL to original URL and record click
     */
    @GetMapping("/s/{shortCode}")
    public void redirectToOriginalUrl(
            @PathVariable String shortCode,
            HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        log.info("Redirect request for short code: {}", shortCode);

        try {
            // Get original URL
            String originalUrl = urlService.getOriginalUrl(shortCode);

            // Record the click asynchronously
            UrlMapping urlMapping = urlMappingRepository.findByShortCode(shortCode)
                    .orElseThrow(() -> new RuntimeException("URL not found"));

            // Record click in background
            new Thread(() -> {
                try {
                    clickService.recordClick(urlMapping, request);
                } catch (Exception e) {
                    log.error("Failed to record click for short code: " + shortCode, e);
                }
            }).start();

            log.info("Redirecting {} to {}", shortCode, originalUrl);

            // Perform redirect
            response.sendRedirect(originalUrl);

        } catch (Exception e) {
            log.error("Failed to redirect short code: " + shortCode, e);
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "URL not found or expired");
        }
    }
}