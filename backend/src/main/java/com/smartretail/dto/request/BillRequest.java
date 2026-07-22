package com.smartretail.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillRequest {

    private Long customerId;

    // Inline new customer creation (if customerId is null)
    @Valid
    private NewCustomer newCustomer;

    @NotEmpty(message = "Bill must have at least one item")
    @Valid
    private List<BillItemRequest> items;

    @DecimalMin(value = "0.0")
    @Builder.Default
    private BigDecimal billDiscountPercentage = BigDecimal.ZERO;

    // Manual getters to ensure visibility and handle legacy calls if any
    public BigDecimal getBillDiscountPercentage() {
        return billDiscountPercentage != null ? billDiscountPercentage : BigDecimal.ZERO;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BillItemRequest {

        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;

        @DecimalMin(value = "0.0")
        @Builder.Default
        private BigDecimal discount = BigDecimal.ZERO;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NewCustomer {
        @NotBlank(message = "Customer name is required")
        @Size(max = 200)
        private String name;

        @Email(message = "Invalid email")
        private String email;

        @Size(max = 20)
        private String phone;
    }
}
