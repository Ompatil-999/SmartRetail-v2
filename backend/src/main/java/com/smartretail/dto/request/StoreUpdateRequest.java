package com.smartretail.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StoreUpdateRequest {

    @NotBlank(message = "Store name is required")
    @Size(max = 150)
    private String storeName;

    @Size(max = 20)
    private String gstNumber;

    @DecimalMin(value = "0.0", message = "Tax rate must be non-negative")
    @DecimalMax(value = "100.0", message = "Tax rate cannot exceed 100%")
    private BigDecimal defaultTaxRate;

    @Size(max = 500)
    private String address;

    @Size(max = 20)
    private String phone;
}
