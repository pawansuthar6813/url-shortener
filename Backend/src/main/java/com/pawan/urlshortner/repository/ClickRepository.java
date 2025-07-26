// ClickRepository.java
package com.pawan.urlshortner.repository;

import com.pawan.urlshortner.model.Click;
import com.pawan.urlshortner.model.UrlMapping;
import com.pawan.urlshortner.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClickRepository extends MongoRepository<Click, String> {
    List<Click> findByUrlMappingOrderByClickedAtDesc(UrlMapping urlMapping);
    Page<Click> findByUrlMappingOrderByClickedAtDesc(UrlMapping urlMapping, Pageable pageable);

    Long countByUrlMapping(UrlMapping urlMapping);
    Long countByUrlMappingAndClickedAtAfter(UrlMapping urlMapping, LocalDateTime date);

    // Analytics queries
    @Query("{ 'urlMapping.createdBy': ?0, 'clickedAt': { $gte: ?1, $lt: ?2 } }")
    Long countClicksByUserAndDateRange(User user, LocalDateTime startDate, LocalDateTime endDate);

    @Query("{ 'urlMapping.createdBy': ?0 }")
    Long countClicksByUser(User user);

    @Query("{ 'urlMapping.createdBy': ?0, 'clickedAt': { $gte: ?1 } }")
    Long countClicksByUserAfterDate(User user, LocalDateTime date);

    @Query("{ 'urlMapping.createdBy': ?0 }")
    List<Click> findClicksByUser(User user);

    // Admin analytics
    Long countByClickedAtAfter(LocalDateTime date);
    Long countByClickedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query(value = "{ 'clickedAt': { $gte: ?0, $lt: ?1 } }",
            fields = "{ 'country': 1, '_id': 0 }")
    List<Click> findClicksForCountryStats(LocalDateTime startDate, LocalDateTime endDate);

    @Query(value = "{ 'clickedAt': { $gte: ?0, $lt: ?1 } }",
            fields = "{ 'device': 1, '_id': 0 }")
    List<Click> findClicksForDeviceStats(LocalDateTime startDate, LocalDateTime endDate);

    @Query(value = "{ 'urlMapping.createdBy': ?0, 'clickedAt': { $gte: ?1, $lt: ?2 } }",
            fields = "{ 'clickedAt': 1, '_id': 0 }")
    List<Click> findClicksForDateStats(User user, LocalDateTime startDate, LocalDateTime endDate);
}