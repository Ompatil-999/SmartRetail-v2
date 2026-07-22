package com.smartretail.service;

import com.smartretail.dto.request.ForgotPasswordRequest;
import com.smartretail.dto.request.LoginRequest;
import com.smartretail.dto.request.RegisterRequest;
import com.smartretail.dto.request.ResetPasswordRequest;
import com.smartretail.dto.response.AuthResponse;
import com.smartretail.entity.Owner;
import com.smartretail.entity.PasswordResetToken;
import com.smartretail.entity.Store;
import com.smartretail.exception.DuplicateResourceException;
import com.smartretail.repository.OwnerRepository;
import com.smartretail.repository.PasswordResetTokenRepository;
import com.smartretail.repository.StoreRepository;
import com.smartretail.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final OwnerRepository ownerRepository;
    private final StoreRepository storeRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (ownerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        Store store = Store.builder()
                .storeName(request.getStoreName())
                .gstNumber(request.getGstNumber())
                .build();
        store = storeRepository.save(store);

        Owner owner = Owner.builder()
                .ownerName(request.getOwnerName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("OWNER")
                .store(store)
                .build();
        owner = ownerRepository.save(owner);

        String token = jwtUtil.generateToken(owner.getEmail(), store.getId());
        log.info("New store registered: {} by {}", store.getStoreName(), owner.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(owner.getEmail())
                .ownerName(owner.getOwnerName())
                .storeId(store.getId())
                .storeName(store.getStoreName())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Owner owner = ownerRepository.findByEmailWithStore(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), owner.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        Store store = owner.getStore();
        String token = jwtUtil.generateToken(owner.getEmail(), store.getId());
        log.info("Login successful: {}", owner.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(owner.getEmail())
                .ownerName(owner.getOwnerName())
                .storeId(store.getId())
                .storeName(store.getStoreName())
                .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Owner owner = ownerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("User not found with email: " + request.getEmail()));

        // Delete any existing tokens for this owner
        tokenRepository.deleteByOwner(owner);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .owner(owner)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();

        tokenRepository.save(resetToken);
        emailService.sendPasswordResetEmail(owner, token);
        log.info("Password reset token generated and email sent for: {}", owner.getEmail());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired reset token"));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new BadCredentialsException("Reset token has expired");
        }

        Owner owner = resetToken.getOwner();
        owner.setPassword(passwordEncoder.encode(request.getNewPassword()));
        ownerRepository.save(owner);

        tokenRepository.delete(resetToken);
        log.info("Password successfully reset for: {}", owner.getEmail());
    }
}
