package com.smartretail.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String barcode;
    private Integer stockQty;
    private Integer lowStockThreshold;
    private boolean lowStock;
    private Long categoryId;
    private String categoryName;
    private String imageUrl;
}
