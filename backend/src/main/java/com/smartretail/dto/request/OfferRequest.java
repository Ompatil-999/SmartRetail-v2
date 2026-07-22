package com.smartretail.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OfferRequest {

    @NotBlank(message = "Offer title is required")
    @Size(max = 200)
    private String title;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Discount is required")
    @DecimalMin(value = "0.01")
    @DecimalMax(value = "100.0")
    private BigDecimal discount;

    private LocalDate validFrom;

    @NotNull(message = "Valid till date is required")
    private LocalDate validTill;
}
