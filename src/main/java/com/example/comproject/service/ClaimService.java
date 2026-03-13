package com.example.comproject.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.comproject.dto.ClaimDTO;
import com.example.comproject.entity.Claim;
import com.example.comproject.entity.PolicyApplication;
import com.example.comproject.exception.InvalidOperationException;
import com.example.comproject.exception.ResourceNotFoundException;
import com.example.comproject.repository.ClaimOfficerRepository;
import com.example.comproject.repository.ClaimRepository;
import com.example.comproject.repository.PolicyApplicationRepository;

@Service
public class ClaimService {
    private final ClaimRepository claimRepository;
    private final PolicyApplicationRepository policyApplicationRepository;
    private final ClaimOfficerRepository claimOfficerRepository;
    private final FileStorageService fileStorageService;
    private final ClaimDocumentService claimDocumentService;
    private final AppNotificationService notificationService;

    public ClaimService(ClaimRepository claimRepository,
                       PolicyApplicationRepository policyApplicationRepository,
                       ClaimOfficerRepository claimOfficerRepository,
                       FileStorageService fileStorageService,
                       ClaimDocumentService claimDocumentService,
                       AppNotificationService notificationService) {
        this.claimRepository = claimRepository;
        this.policyApplicationRepository = policyApplicationRepository;
        this.claimOfficerRepository = claimOfficerRepository;
        this.fileStorageService = fileStorageService;
        this.claimDocumentService = claimDocumentService;
        this.notificationService = notificationService;
    }

    public ClaimDTO createClaim(ClaimDTO dto, List<org.springframework.web.multipart.MultipartFile> documents) {
        Claim claim = new Claim();
        claim.setClaimNumber(generateClaimNumber());
        PolicyApplication app = policyApplicationRepository.findById(dto.getPolicyApplicationId()).orElseThrow();
        claim.setPolicyApplication(app);

        // Check available coverage balance
        java.math.BigDecimal totalSettled = claimRepository.findByPolicyApplicationId(app.getId()).stream()
            .filter(c -> c.getStatus() == Claim.ClaimStatus.SETTLED || 
                        c.getStatus() == Claim.ClaimStatus.APPROVED ||
                        c.getStatus() == Claim.ClaimStatus.PARTIALLY_APPROVED)
            .map(Claim::getClaimAmount)
            .filter(amt -> amt != null)
            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        
        java.math.BigDecimal availableBalance = app.getSelectedCoverageAmount().subtract(totalSettled);
        if (dto.getClaimAmount().compareTo(availableBalance) > 0) {
            throw new InvalidOperationException("Claim amount exceeds available coverage balance: " + availableBalance);
        }
        
        if (app.getBusinessProfile() != null && app.getBusinessProfile().getClaimOfficer() != null) {
            claim.setClaimOfficer(app.getBusinessProfile().getClaimOfficer());
        } else if (app.getClaimOfficer() != null) {
            claim.setClaimOfficer(app.getClaimOfficer());
        }

        claim.setDescription(dto.getDescription());
        claim.setClaimAmount(dto.getClaimAmount());
        claim.setIncidentDate(dto.getIncidentDate());
        claim.setIncidentLocation(dto.getIncidentLocation());
        claim.setStatus(Claim.ClaimStatus.SUBMITTED);
        
        Claim savedClaim = claimRepository.save(claim);
        
        if (documents != null && !documents.isEmpty()) {
            for (org.springframework.web.multipart.MultipartFile file : documents) {
                String fileName = fileStorageService.storeFile(file);
                com.example.comproject.entity.ClaimDocument doc = new com.example.comproject.entity.ClaimDocument();
                doc.setClaim(savedClaim);
                doc.setFileName(file.getOriginalFilename());
                doc.setFilePath(fileName);
                doc.setFileType(file.getContentType());
                doc.setFileSize(file.getSize());
                doc.setUploadedAt(java.time.LocalDateTime.now());
                claimDocumentService.uploadDocument(doc);
            }
        }
        
        ClaimDTO result = toDTO(savedClaim);

        // Notify assigned claim officer
        if (savedClaim.getClaimOfficer() != null && savedClaim.getClaimOfficer().getUser() != null) {
            notificationService.notify(
                savedClaim.getClaimOfficer().getUser(),
                "New claim (" + savedClaim.getClaimNumber() + ") has been raised by "
                    + app.getUser().getFullName() + " under policy " + app.getPolicyNumber() + ". Please review.",
                "CLAIM_RAISED"
            );
        }
        // Notify assigned agent
        if (app.getAgent() != null && app.getAgent().getUser() != null) {
            notificationService.notify(
                app.getAgent().getUser(),
                "A claim (" + savedClaim.getClaimNumber() + ") has been raised by your client "
                    + app.getUser().getFullName() + " under policy " + app.getPolicyNumber() + ".",
                "CLAIM_RAISED"
            );
        }

        return result;
    }

    public ClaimDTO assignClaimOfficer(Long claimId, Long claimOfficerId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));
        
        if (claim.getStatus() != Claim.ClaimStatus.SUBMITTED) {
            throw new InvalidOperationException("Can only assign officer to SUBMITTED claims");
        }

        claim.setClaimOfficer(claimOfficerRepository.findById(claimOfficerId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim officer not found")));
        claim.setStatus(Claim.ClaimStatus.ASSIGNED);
        
        return toDTO(claimRepository.save(claim));
    }

    public ClaimDTO approveClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));
        
        if (claim.getClaimOfficer() == null) {
            throw new InvalidOperationException("Claim officer must be assigned");
        }

        // Check available coverage balance before approval
        PolicyApplication app = claim.getPolicyApplication();
        java.math.BigDecimal currentTotalApproved = claimRepository.findByPolicyApplicationId(app.getId()).stream()
            .filter(c -> (c.getStatus() == Claim.ClaimStatus.SETTLED || 
                         c.getStatus() == Claim.ClaimStatus.APPROVED ||
                         c.getStatus() == Claim.ClaimStatus.PARTIALLY_APPROVED) && 
                         !c.getId().equals(claim.getId())) // Exclude self if already approved (unlikely but safe)
            .map(Claim::getClaimAmount)
            .filter(amt -> amt != null)
            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        
        java.math.BigDecimal remainingBalance = app.getSelectedCoverageAmount().subtract(currentTotalApproved);
        if (claim.getClaimAmount().compareTo(remainingBalance) > 0) {
            throw new InvalidOperationException("Approving this claim would exceed the available coverage balance: " + remainingBalance);
        }

        claim.setStatus(Claim.ClaimStatus.APPROVED);
        ClaimDTO result = toDTO(claimRepository.save(claim));

        // Notify the policyholder
        if (claim.getPolicyApplication() != null && claim.getPolicyApplication().getUser() != null) {
            notificationService.notify(
                claim.getPolicyApplication().getUser(),
                "Your claim (" + claim.getClaimNumber() + ") has been approved by the claims officer.",
                "CLAIM_APPROVED"
            );
        }

        return result;
    }

    public ClaimDTO rejectClaim(Long claimId, String reason) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));
        
        if (claim.getClaimOfficer() == null) {
            throw new InvalidOperationException("Claim officer must be assigned");
        }

        claim.setStatus(Claim.ClaimStatus.REJECTED);
        claim.setRejectionReason(reason);
        ClaimDTO result = toDTO(claimRepository.save(claim));

        // Notify the policyholder
        if (claim.getPolicyApplication() != null && claim.getPolicyApplication().getUser() != null) {
            notificationService.notify(
                claim.getPolicyApplication().getUser(),
                "Your claim (" + claim.getClaimNumber() + ") has been rejected. Reason: " + reason,
                "CLAIM_REJECTED"
            );
        }

        return result;
    }

    private String generateClaimNumber() {
        long count = claimRepository.count() + 1;
        return String.format("CLM-%04d", count);
    }

    public ClaimDTO getClaimById(Long id) {
        return claimRepository.findById(id).map(this::toDTO).orElse(null);
    }

    public List<ClaimDTO> getClaimsByPolicyApplication(Long policyApplicationId) {
        return claimRepository.findByPolicyApplicationId(policyApplicationId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ClaimDTO> getClaimsByClaimOfficer(Long claimOfficerId) {
        return claimRepository.findByClaimOfficerIdOrPolicyApplicationClaimOfficerIdOrPolicyApplicationBusinessProfileClaimOfficerId(
            claimOfficerId, claimOfficerId, claimOfficerId
        ).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ClaimDTO> getClaimsByUserId(Long userId) {
        return claimRepository.findAll().stream()
                .filter(c -> c.getPolicyApplication().getUser().getId() == userId)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ClaimDTO updateClaim(Long id, ClaimDTO dto) {
        if (claimRepository.existsById(id)) {
            Claim claim = claimRepository.findById(id).orElseThrow();
            claim.setDescription(dto.getDescription());
            claim.setClaimAmount(dto.getClaimAmount());
            claim.setIncidentDate(dto.getIncidentDate());
            claim.setIncidentLocation(dto.getIncidentLocation());
            claim.setStatus(dto.getStatus());
            if (dto.getClaimOfficerId() != null) {
                claim.setClaimOfficer(claimOfficerRepository.findById(dto.getClaimOfficerId()).orElse(null));
            }
            return toDTO(claimRepository.save(claim));
        }
        return null;
    }

    private ClaimDTO toDTO(Claim claim) {
        ClaimDTO dto = new ClaimDTO();
        dto.setId(claim.getId());
        dto.setClaimNumber(claim.getClaimNumber());
        dto.setPolicyApplicationId(claim.getPolicyApplication().getId());
        dto.setPolicyNumber(claim.getPolicyApplication().getPolicyNumber());
        dto.setDescription(claim.getDescription());
        dto.setClaimAmount(claim.getClaimAmount());
        dto.setIncidentDate(claim.getIncidentDate());
        dto.setIncidentLocation(claim.getIncidentLocation());
        dto.setStatus(claim.getStatus());
        if (claim.getClaimOfficer() != null) dto.setClaimOfficerId(claim.getClaimOfficer().getId());
        dto.setRejectionReason(claim.getRejectionReason());
        
        // Add policyholder name and plan name
        if (claim.getPolicyApplication() != null) {
            if (claim.getPolicyApplication().getUser() != null) {
                dto.setPolicyholderName(claim.getPolicyApplication().getUser().getFullName());
            }
            if (claim.getPolicyApplication().getPlan() != null) {
                dto.setPlanName(claim.getPolicyApplication().getPlan().getPolicyName());
            }
        }
        
        return dto;
    }

}
