package com.smartretail.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoreResponse {
    private Long id;
    private String storeName;
    private String gstNumber;
    private BigDecimal defaultTaxRate;
    private String address;
    private String phone;
}
