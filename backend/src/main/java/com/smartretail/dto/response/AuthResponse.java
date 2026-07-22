package com.smartretail.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private String email;
    private String ownerName;
    private Long storeId;
    private String storeName;
}
