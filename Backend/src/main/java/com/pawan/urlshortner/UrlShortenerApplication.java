package com.pawan.urlshortner;

import com.pawan.urlshortner.model.Role;
import com.pawan.urlshortner.model.User;
import com.pawan.urlshortner.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class UrlShortenerApplication {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	public static void main(String[] args) {
		SpringApplication.run(UrlShortenerApplication.class, args);
	}

	/**
	 * Creates a default admin user on application startup if none exists
	 */
	@PostConstruct
	public void createDefaultAdmin() {
		try {
			// Check if admin user already exists
			if (!userRepository.existsByUsername("admin")) {
				System.out.println("Creating default admin user...");

				User admin = new User();
				admin.setUsername("admin");
				admin.setEmail("admin@shortlink.com");
				admin.setPassword(passwordEncoder.encode("admin123"));
				admin.setFirstName("System");
				admin.setLastName("Administrator");

				// Set both USER and ADMIN roles
				Set<Role> roles = new HashSet<>();
				roles.add(Role.USER);
				roles.add(Role.ADMIN);
				admin.setRoles(roles);

				// Set timestamps
				admin.setCreatedAt(LocalDateTime.now());
				admin.setUpdatedAt(LocalDateTime.now());
				admin.setEnabled(true);

				userRepository.save(admin);

				System.out.println("Default admin user created successfully!");
				System.out.println("Username: admin");
				System.out.println("Password: admin123");
				System.out.println("Email: admin@shortlink.com");
			} else {
				System.out.println("Admin user already exists, skipping creation.");
			}
		} catch (Exception e) {
			System.err.println("Error creating default admin user: " + e.getMessage());
			e.printStackTrace();
		}
	}
}