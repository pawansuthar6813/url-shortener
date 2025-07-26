package com.pawan.urlshortner.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Configuration
@EnableMongoAuditing(auditorAwareRef = "auditorProvider")
public class MongoConfig {

    /**
     * Provides the current auditor (user) for auditing purposes
     */
    @Bean
    public AuditorAware<String> auditorProvider() {
        return new AuditorAwareImpl();
    }

    /**
     * Enables JSR-303 validation for MongoDB entities
     */
    @Bean
    public ValidatingMongoEventListener validatingMongoEventListener() {
        return new ValidatingMongoEventListener(validator());
    }

    /**
     * Provides JSR-303 validator
     */
    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }

    /**
     * Custom mongo conversions if needed
     */
    @Bean
    @Primary
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(java.util.Collections.emptyList());
    }

    /**
     * Implementation of AuditorAware to provide current user for auditing
     */
    public static class AuditorAwareImpl implements AuditorAware<String> {

        @Override
        public Optional<String> getCurrentAuditor() {
            try {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                if (authentication == null || !authentication.isAuthenticated()
                        || "anonymousUser".equals(authentication.getPrincipal())) {
                    return Optional.of("system");
                }

                // If using UserPrincipal, get the user ID
                if (authentication.getPrincipal() instanceof com.pawan.urlshortner.security.UserPrincipal) {
                    com.pawan.urlshortner.security.UserPrincipal userPrincipal =
                            (com.pawan.urlshortner.security.UserPrincipal) authentication.getPrincipal();
                    return Optional.of(userPrincipal.getId());
                }

                // Fallback to authentication name
                return Optional.of(authentication.getName());
            } catch (Exception e) {
                // Return system if there's any issue
                return Optional.of("system");
            }
        }
    }
}