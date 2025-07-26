// UrlMappingRepository.java
package com.pawan.urlshortner.repository;

import com.pawan.urlshortner.model.UrlMapping;
import com.pawan.urlshortner.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UrlMappingRepository extends MongoRepository<UrlMapping, String> {
    Optional<UrlMapping> findByShortCode(String shortCode);
    Boolean existsByShortCode(String shortCode);

    List<UrlMapping> findByCreatedByOrderByCreatedAtDesc(User user);
    Page<UrlMapping> findByCreatedByOrderByCreatedAtDesc(User user, Pageable pageable);

    List<UrlMapping> findByCreatedByAndIsActiveOrderByCreatedAtDesc(User user, boolean isActive);

    Long countByCreatedBy(User user);
    Long countByCreatedByAndCreatedAtAfter(User user, LocalDateTime date);

    @Query("{ 'createdBy': ?0, 'clickCount': { $gt: 0 } }")
    List<UrlMapping> findTopUrlsByUser(User user, Pageable pageable);

    // Admin methods
    Page<UrlMapping> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("{ 'expirationDate': { $lt: ?0 }, 'isActive': true }")
    List<UrlMapping> findExpiredUrls(LocalDateTime currentDate);
}