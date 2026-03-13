// package com.example.comproject.service;

// import com.example.comproject.dto.UserDTO;
// import com.example.comproject.entity.User;
// import com.example.comproject.repository.UserRepository;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;
// import java.util.List;
// import java.util.stream.Collectors;

// @Service
// public class UserService {
//     private final UserRepository userRepository;
//     private final PasswordEncoder passwordEncoder;

//     public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
//         this.userRepository = userRepository;
//         this.passwordEncoder = passwordEncoder;
//     }

//     public UserDTO submitRegistrationRequest(UserDTO dto) {
//         if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
//             throw new RuntimeException("User already exists with this email");
//         }
        
//         User user = convertToEntity(dto);
//         user.setStatus(User.Status.PENDING);
//         user = userRepository.save(user);
//         return convertToDTO(user);
//     }

//     public List<UserDTO> getPendingRegistrations() {
//         return userRepository.findByStatus(User.Status.PENDING)
//                 .stream().map(this::convertToDTO).collect(Collectors.toList());
//     }

//     public UserDTO approveRegistration(Long id) {
//         User user = userRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("User not found"));
        
//         if (user.getStatus() != User.Status.PENDING) {
//             throw new RuntimeException("User registration already processed");
//         }

//         // Generate random password for approved user
//         String generatedPassword = generateRandomPassword();
//         user.setPassword(passwordEncoder.encode(generatedPassword));
//         user.setStatus(User.Status.ACTIVE);
//         user = userRepository.save(user);
        
//         // TODO: Send email with credentials
//         // EmailService.sendCredentials(user.getEmail(), generatedPassword);
        
//         return convertToDTO(user);
//     }

//     private String generateRandomPassword() {
//         String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//         StringBuilder password = new StringBuilder();
//         for (int i = 0; i < 8; i++) {
//             password.append(chars.charAt((int) (Math.random() * chars.length())));
//         }
//         return password.toString();
//     }

//     public UserDTO rejectRegistration(Long id, String remarks) {
//         User user = userRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("User not found"));
        
//         user.setStatus(User.Status.REJECTED);
//         user.setAdminRemarks(remarks);
//         user = userRepository.save(user);
//         return convertToDTO(user);
//     }

//     public UserDTO createUser(UserDTO dto) {
//         User user = new User();
//         user.setFullName(dto.getFullName());
//         user.setEmail(dto.getEmail());
//         user.setPassword(passwordEncoder.encode(dto.getPassword()));
//         user.setRole(dto.getRole());
//         user.setStatus(dto.getStatus() != null ? dto.getStatus() : User.Status.PENDING);
//         return convertToDTO(userRepository.save(user));
//     }

//     public UserDTO getUserById(Long id) {
//         return userRepository.findById(id).map(this::convertToDTO).orElse(null);
//     }

//     public UserDTO getUserByEmail(String email) {
//         return userRepository.findByEmail(email).map(this::convertToDTO).orElse(null);
//     }

//     public List<UserDTO> getAllUsers() {
//         return userRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
//     }

//     public UserDTO updateUser(Long id, UserDTO dto) {
//         if (userRepository.existsById(id)) {
//             User user = new User();
//             user.setId(id);
//             user.setFullName(dto.getFullName());
//             user.setEmail(dto.getEmail());
//             if (dto.getPassword() != null) {
//                 user.setPassword(passwordEncoder.encode(dto.getPassword()));
//             }
//             user.setRole(dto.getRole());
//             user.setStatus(dto.getStatus());
//             return convertToDTO(userRepository.save(user));
//         }
//         return null;
//     }

//     public void deleteUser(Long id) {
//         userRepository.deleteById(id);
//     }

//     private UserDTO convertToDTO(User user) {
//         UserDTO dto = new UserDTO();
//         dto.setId(user.getId());
//         dto.setFullName(user.getFullName());
//         dto.setEmail(user.getEmail());
//         dto.setPhone(user.getPhone());
//         dto.setRole(user.getRole());
//         dto.setStatus(user.getStatus());
//         dto.setBusinessName(user.getBusinessName());
//         dto.setIndustry(user.getIndustry());
//         dto.setAnnualRevenue(user.getAnnualRevenue());
//         dto.setEmployeeCount(user.getEmployeeCount());
//         dto.setCity(user.getCity());
//         dto.setMessage(user.getMessage());
//         dto.setAdminRemarks(user.getAdminRemarks());
//         dto.setCreatedAt(user.getCreatedAt());
//         return dto;
//     }

//     private User convertToEntity(UserDTO dto) {
//         User user = new User();
//         user.setFullName(dto.getFullName());
//         user.setEmail(dto.getEmail());
//         user.setPhone(dto.getPhone());
//         user.setRole(dto.getRole());
//         user.setBusinessName(dto.getBusinessName());
//         user.setIndustry(dto.getIndustry());
//         user.setAnnualRevenue(dto.getAnnualRevenue());
//         user.setEmployeeCount(dto.getEmployeeCount());
//         user.setCity(dto.getCity());
//         user.setMessage(dto.getMessage());
//         return user;
//     }
// }

package com.example.comproject.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.comproject.dto.UserDTO;
import com.example.comproject.entity.Agent;
import com.example.comproject.entity.BusinessProfile;
import com.example.comproject.entity.ClaimOfficer;
import com.example.comproject.entity.User;
import com.example.comproject.repository.AgentRepository;
import com.example.comproject.repository.BusinessProfileRepository;
import com.example.comproject.repository.ClaimOfficerRepository;
import com.example.comproject.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BusinessProfileRepository businessProfileRepository;
    private final AgentRepository agentRepository;
    private final ClaimOfficerRepository claimOfficerRepository;
    private final EmailService emailService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       BusinessProfileRepository businessProfileRepository,
                       AgentRepository agentRepository,
                       ClaimOfficerRepository claimOfficerRepository,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.businessProfileRepository = businessProfileRepository;
        this.agentRepository = agentRepository;
        this.claimOfficerRepository = claimOfficerRepository;
        this.emailService = emailService;
    }

    //PUBLIC — Policyholder/Agent/ClaimOfficer submits registration
    public UserDTO submitRegistrationRequest(UserDTO dto) {

        // Check duplicate email
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with this email");
        }

        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole());
        user.setStatus(User.Status.PENDING);  // always PENDING on registration
        user.setPassword(null);               // no password until approved

        // Business fields only for POLICYHOLDER
        if (dto.getRole() == User.Role.POLICYHOLDER) {
            user.setBusinessName(dto.getBusinessName());
            user.setIndustry(dto.getIndustry());
            user.setAnnualRevenue(dto.getAnnualRevenue());
            user.setEmployeeCount(dto.getEmployeeCount());
            user.setCity(dto.getCity());
        }

        // Professional fields for AGENT / CLAIM_OFFICER 
        if (dto.getRole() == User.Role.AGENT ||
            dto.getRole() == User.Role.CLAIM_OFFICER) {
            user.setExperience(dto.getExperience());
            user.setSpecialization(dto.getSpecialization());
            user.setTerritory(dto.getTerritory());
            user.setRegion(dto.getRegion());
        }

        user.setMessage(dto.getMessage());
        user.setCreatedAt(LocalDateTime.now());

        return convertToDTO(userRepository.save(user));
    }

    //ADMIN — View all pending registrations
    public List<UserDTO> getPendingRegistrations() {
        return userRepository.findByStatus(User.Status.PENDING)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    //ADMIN — Approve registration
    public UserDTO approveRegistration(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() != User.Status.PENDING) {
            throw new RuntimeException("This registration has already been processed");
        }

        // Generate temp password
        String tempPassword = generateTempPassword();
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setStatus(User.Status.ACTIVE);
        // user.setReviewedAt(LocalDateTime.now());
        userRepository.save(user);

        try {
            // Create role profile automatically
            createRoleProfile(user);

            // Send welcome email with credentials
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName(), tempPassword);
        } catch (Exception e) {
            try {
                java.io.FileWriter fw = new java.io.FileWriter("error_log.txt");
                java.io.PrintWriter pw = new java.io.PrintWriter(fw);
                e.printStackTrace(pw);
                pw.close();
            } catch (Exception ex) {}
            throw new RuntimeException("Error during approval: " + e.getMessage(), e);
        }
        
        return convertToDTO(user);
    }

    // ADMIN — Reject registration
    public UserDTO rejectRegistration(Long id, String remarks) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() != User.Status.PENDING) {
            throw new RuntimeException("This registration has already been processed");
        }

        user.setStatus(User.Status.REJECTED);
        user.setAdminRemarks(remarks);

        // Send rejection email
        emailService.sendRejectionEmail(user.getEmail(), user.getFullName(), remarks);

        return convertToDTO(userRepository.save(user));
    }

    //ADMIN — Get all users
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // ADMIN — Get user by id
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ADMIN — Update user (fetch existing, update fields)
    public UserDTO updateUser(Long id, UserDTO dto) {
        // Fetch existing — don't create new object
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());

        // Only update password if provided
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return convertToDTO(userRepository.save(user));
    }

    //  ADMIN — Deactivate user (never hard delete)
    public UserDTO deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(User.Status.INACTIVE);
        return convertToDTO(userRepository.save(user));
    }

    // ADMIN — Reactivate user
    public UserDTO activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(User.Status.ACTIVE);
        return convertToDTO(userRepository.save(user));
    }

    // ── Private Helpers ──

    // Creates role-specific profile after approval
    private void createRoleProfile(User user) {
        switch (user.getRole()) {

            case POLICYHOLDER:
                if (!businessProfileRepository.existsByUserId(user.getId())) {
                    BusinessProfile profile = new BusinessProfile();
                    profile.setUser(user);
                    profile.setBusinessName(user.getBusinessName());
                    profile.setIndustry(user.getIndustry());
                    if (user.getAnnualRevenue() != null) {
                        profile.setAnnualRevenue(java.math.BigDecimal.valueOf(user.getAnnualRevenue()));
                    }
                    profile.setEmployeeCount(user.getEmployeeCount());
                    profile.setCity(user.getCity());
                    profile.setIsProfileCompleted(true);
                    businessProfileRepository.save(profile);
                }
                break;

            case AGENT:
                if (!agentRepository.existsByUserId(user.getId())) {
                    Agent agent = new Agent();
                    agent.setUser(user);
                    agent.setAgentCode(generateAgentCode());
                    agent.setLicenseNumber("LIC-" + System.currentTimeMillis());
                    agent.setTerritory(user.getTerritory());
                    agent.setCommissionRate(java.math.BigDecimal.valueOf(5.0));
                    // Map specialization string from registration to enum
                    if (user.getSpecialization() != null && !user.getSpecialization().isBlank()) {
                        try {
                            agent.setSpecialization(Agent.Specialization.valueOf(user.getSpecialization().toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            // keep null if unknown
                        }
                    }
                    agentRepository.save(agent);
                }
                break;
            case CLAIM_OFFICER:
                if (!claimOfficerRepository.existsByUserId(user.getId())) {
                    ClaimOfficer officer = new ClaimOfficer();
                    officer.setUser(user);
                    officer.setEmployeeCode(generateEmployeeCode("CO"));
                    officer.setRegion(user.getRegion());
                    // Map specialization string from registration to enum
                    if (user.getSpecialization() != null && !user.getSpecialization().isBlank()) {
                        try {
                            officer.setSpecialization(ClaimOfficer.Specialization.valueOf(user.getSpecialization().toUpperCase()));
                        } catch (IllegalArgumentException e) {
                            // keep null if unknown
                        }
                    }
                    claimOfficerRepository.save(officer);
                }
                break;

            default:
                break;
        }
    }

    
    private String generateTempPassword() {
        int number = 1000 + new Random().nextInt(9000);
        return "Fortify@" + number;
    }

    // AGT-0001
    private String generateAgentCode() {
        long count = agentRepository.count() + 1;
        return String.format("AGT-%04d", count);
    }

    // UW-0001 or CO-0001
    private String generateEmployeeCode(String prefix) {
        long count = userRepository.count() + 1;
        return String.format(prefix + "-%04d", count);
    }

    // ── DTO Converters ──
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setBusinessName(user.getBusinessName());
        dto.setIndustry(user.getIndustry());
        dto.setAnnualRevenue(user.getAnnualRevenue());
        dto.setEmployeeCount(user.getEmployeeCount());
        dto.setCity(user.getCity());
        dto.setMessage(user.getMessage());
        dto.setAdminRemarks(user.getAdminRemarks());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
