package com.smartretail.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OfferResponse {
    private Long id;
    private String title;
    private String description;
    private BigDecimal discount;
    private LocalDate validFrom;
    private LocalDate validTill;
    private Boolean active;
    private boolean expired;
}
