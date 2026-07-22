
package com.smartretail.service;

import com.smartretail.dto.request.LoginRequest;
import com.smartretail.dto.response.AuthResponse;
import com.smartretail.entity.Owner;
import com.smartretail.entity.Store;
import com.smartretail.repository.OwnerRepository;
import com.smartretail.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private OwnerRepository ownerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private Owner owner;
    private Store store;

    @BeforeEach
    void setUp() {
        store = Store.builder().id(1L).storeName("Test Store").build();
        owner = Owner.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .ownerName("Test Owner")
                .store(store)
                .build();
    }

    @Test
    void login_ShouldUseFindByEmailWithStore() {
        LoginRequest request = new LoginRequest("test@example.com", "password");

        when(ownerRepository.findByEmailWithStore(request.getEmail())).thenReturn(Optional.of(owner));
        when(passwordEncoder.matches(request.getPassword(), owner.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyLong())).thenReturn("mockToken");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("test@example.com", response.getEmail());
        verify(ownerRepository, times(1)).findByEmailWithStore("test@example.com");
        verify(ownerRepository, never()).findByEmail(anyString());
    }
}
