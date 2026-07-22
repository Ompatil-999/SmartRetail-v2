package com.smartretail.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private long totalProducts;
    private long totalCustomers;
    private long totalBills;
    private BigDecimal totalRevenue;
    private long lowStockProducts;
    private List<TopProduct> topSellingProducts;
    private List<SalesData> salesTrend;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TopProduct {
        private String name;
        private long quantitySold;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SalesData {
        private String date;
        private BigDecimal total;
    }
}
