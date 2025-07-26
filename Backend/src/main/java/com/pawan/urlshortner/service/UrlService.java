// UrlService.java
package com.pawan.urlshortner.service;

import com.pawan.urlshortner.dto.request.CreateUrlRequest;
import com.pawan.urlshortner.dto.response.UrlResponse;
import com.pawan.urlshortner.exception.BadRequestException;
import com.pawan.urlshortner.exception.ResourceNotFoundException;
import com.pawan.urlshortner.model.UrlMapping;
import com.pawan.urlshortner.model.User;
import com.pawan.urlshortner.repository.UrlMappingRepository;
import com.pawan.urlshortner.util.UrlShortenerUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UrlService {

    @Autowired
    private UrlMappingRepository urlMappingRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ClickService clickService;

    @Value("${app.base-url}")
    private String baseUrl;

    public UrlResponse createShortUrl(CreateUrlRequest request, String userId) {
        User user = userService.findById(userId);

        String shortCode;
        if (StringUtils.hasText(request.getCustomCode())) {
            if (urlMappingRepository.existsByShortCode(request.getCustomCode())) {
                throw new BadRequestException("Custom code already exists");
            }
            shortCode = request.getCustomCode();
        } else {
            shortCode = generateUniqueShortCode();
        }

        UrlMapping urlMapping = new UrlMapping();
        urlMapping.setOriginalUrl(request.getOriginalUrl());
        urlMapping.setShortCode(shortCode);
        urlMapping.setCreatedBy(user);
        urlMapping.setTitle(request.getTitle());
        urlMapping.setDescription(request.getDescription());
        urlMapping.setExpirationDate(request.getExpirationDate());
        urlMapping.setCreatedAt(LocalDateTime.now());
        urlMapping.setUpdatedAt(LocalDateTime.now());

        UrlMapping savedUrl = urlMappingRepository.save(urlMapping);
        return convertToUrlResponse(savedUrl);
    }

    public String getOriginalUrl(String shortCode) {
        UrlMapping urlMapping = urlMappingRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new ResourceNotFoundException("URL", "shortCode", shortCode));

        if (!urlMapping.isActive()) {
            throw new BadRequestException("URL is inactive");
        }

        if (urlMapping.getExpirationDate() != null &&
                urlMapping.getExpirationDate().isBefore(LocalDateTime.now())) {
            urlMapping.setActive(false);
            urlMappingRepository.save(urlMapping);
            throw new BadRequestException("URL has expired");
        }

        // Increment click count
        urlMapping.setClickCount(urlMapping.getClickCount() + 1);
        urlMappingRepository.save(urlMapping);

        return urlMapping.getOriginalUrl();
    }

    public List<UrlResponse> getUserUrls(String userId) {
        User user = userService.findById(userId);
        List<UrlMapping> urls = urlMappingRepository.findByCreatedByOrderByCreatedAtDesc(user);
        return urls.stream()
                .map(this::convertToUrlResponse)
                .collect(Collectors.toList());
    }

    public Page<UrlResponse> getUserUrlsPaginated(String userId, Pageable pageable) {
        User user = userService.findById(userId);
        Page<UrlMapping> urls = urlMappingRepository.findByCreatedByOrderByCreatedAtDesc(user, pageable);
        return urls.map(this::convertToUrlResponse);
    }

    public UrlResponse getUrlById(String urlId, String userId) {
        UrlMapping urlMapping = urlMappingRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL", "id", urlId));

        if (!urlMapping.getCreatedBy().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }

        return convertToUrlResponse(urlMapping);
    }

    public void deleteUrl(String urlId, String userId) {
        UrlMapping urlMapping = urlMappingRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL", "id", urlId));

        if (!urlMapping.getCreatedBy().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }

        urlMappingRepository.delete(urlMapping);
    }

    public UrlResponse toggleUrlStatus(String urlId, String userId) {
        UrlMapping urlMapping = urlMappingRepository.findById(urlId)
                .orElseThrow(() -> new ResourceNotFoundException("URL", "id", urlId));

        if (!urlMapping.getCreatedBy().getId().equals(userId)) {
            throw new BadRequestException("Access denied");
        }

        urlMapping.setActive(!urlMapping.isActive());
        urlMapping.setUpdatedAt(LocalDateTime.now());
        UrlMapping updatedUrl = urlMappingRepository.save(urlMapping);

        return convertToUrlResponse(updatedUrl);
    }

    private String generateUniqueShortCode() {
        String shortCode;
        do {
            shortCode = UrlShortenerUtil.generateShortCode();
        } while (urlMappingRepository.existsByShortCode(shortCode));
        return shortCode;
    }

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
