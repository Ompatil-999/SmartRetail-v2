
package com.smartretail.security;

import com.smartretail.entity.Owner;
import com.smartretail.entity.Store;
import com.smartretail.repository.OwnerRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class JwtAuthFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private OwnerRepository ownerRepository;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthFilter jwtAuthFilter;

    private Owner owner;
    private Store store;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        store = Store.builder().id(1L).storeName("Test Store").build();
        owner = Owner.builder()
                .id(1L)
                .email("test@example.com")
                .role("OWNER")
                .store(store)
                .build();
    }

    @Test
    void doFilterInternal_ShouldUseFindByEmailWithStore() throws Exception {
        String token = "validToken";
        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.validateToken(token)).thenReturn(true);
        when(jwtUtil.getEmailFromToken(token)).thenReturn("test@example.com");
        when(jwtUtil.getStoreIdFromToken(token)).thenReturn(1L);
        when(ownerRepository.findByEmailWithStore("test@example.com")).thenReturn(Optional.of(owner));

        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        verify(ownerRepository, times(1)).findByEmailWithStore("test@example.com");
        verify(ownerRepository, never()).findByEmail(anyString());
        verify(filterChain).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
