package com.floodwatch.config;

import com.floodwatch.entity.User;
import com.floodwatch.entity.UserRole;
import com.floodwatch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create admin user if not exists
        if (!userRepository.findByEmail("admin@floodwatch.com").isPresent()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@floodwatch.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("System Administrator");
            admin.setRole(UserRole.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println("Created admin user: admin@floodwatch.com (password: admin123)");
        }

        // Create regular user if not exists
        if (!userRepository.findByEmail("user@floodwatch.com").isPresent()) {
            User user = new User();
            user.setUsername("user");
            user.setEmail("user@floodwatch.com");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setFullName("Regular User");
            user.setRole(UserRole.CITIZEN);
            user.setEnabled(true);
            userRepository.save(user);
            System.out.println("Created regular user: user@floodwatch.com (password: user123)");
        }

        // Create test admin user if not exists
        if (!userRepository.findByEmail("testadmin@floodwatch.com").isPresent()) {
            User testAdmin = new User();
            testAdmin.setUsername("testadmin");
            testAdmin.setEmail("testadmin@floodwatch.com");
            testAdmin.setPassword(passwordEncoder.encode("admin"));
            testAdmin.setFullName("Test Administrator");
            testAdmin.setRole(UserRole.ADMIN);
            testAdmin.setEnabled(true);
            userRepository.save(testAdmin);
            System.out.println("Created test admin user: testadmin@floodwatch.com (password: admin)");
        }

        // Create test regular user if not exists
        if (!userRepository.findByEmail("testuser@floodwatch.com").isPresent()) {
            User testUser = new User();
            testUser.setUsername("testuser");
            testUser.setEmail("testuser@floodwatch.com");
            testUser.setPassword(passwordEncoder.encode("user"));
            testUser.setFullName("Test User");
            testUser.setRole(UserRole.CITIZEN);
            testUser.setEnabled(true);
            userRepository.save(testUser);
            System.out.println("Created test user: testuser@floodwatch.com (password: user)");
        }
    }
}
