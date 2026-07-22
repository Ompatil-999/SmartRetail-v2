package com.smartretail.component;

import com.smartretail.entity.Bill;
import com.smartretail.entity.BillItem;
import com.smartretail.entity.Product;
import com.smartretail.repository.BillRepository;
import com.smartretail.repository.ProductRepository;
import com.smartretail.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final BillRepository billRepository;
    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;

    @Override
    public void run(String... args) throws Exception {
        var stores = storeRepository.findAll();
        if (stores.isEmpty()) return;
        
        Long storeId = stores.get(0).getId();
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1).withHour(0).withMinute(0);
        long historicalCount = billRepository.findSalesTrend(storeId, yesterday.minusDays(7)).size();

        if (historicalCount > 5) {
            log.info("Historical data already exists. Skipping seeding.");
            return;
        }

        log.info("Seeding historical data for charts...");
        
        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            log.warn("No products found. Cannot seed bills.");
            return;
        }

        Random random = new Random();

        for (int i = 6; i >= 0; i--) {
            LocalDateTime date = LocalDateTime.now().minusDays(i).withHour(10).withMinute(0);
            
            // Create 3-5 bills per day
            int billsCount = 3 + random.nextInt(3);
            for (int b = 0; b < billsCount; b++) {
                LocalDateTime billTime = date.plusHours(random.nextInt(8)).plusMinutes(random.nextInt(60));
                
                Bill bill = Bill.builder()
                        .billNumber("SEED-" + i + "-" + b + "-" + random.nextInt(1000))
                        .storeId(storeId)
                        .createdAt(billTime)
                        .taxRate(new BigDecimal("18.00"))
                        .build();

                List<BillItem> items = new ArrayList<>();
                BigDecimal subtotal = BigDecimal.ZERO;

                // 1-4 items per bill
                int itemsCount = 1 + random.nextInt(4);
                for (int it = 0; it < itemsCount; it++) {
                    Product p = products.get(random.nextInt(products.size()));
                    int qty = 1 + random.nextInt(3);
                    BigDecimal lineTotal = p.getPrice().multiply(new BigDecimal(qty));
                    
                    BillItem item = BillItem.builder()
                            .bill(bill)
                            .product(p)
                            .productName(p.getName())
                            .quantity(qty)
                            .unitPrice(p.getPrice())
                            .lineTotal(lineTotal)
                            .build();
                    items.add(item);
                    subtotal = subtotal.add(lineTotal);
                }

                bill.setItems(items);
                bill.setSubtotal(subtotal);
                bill.setTaxableAmount(subtotal);
                bill.setTaxAmount(subtotal.multiply(new BigDecimal("0.18")));
                bill.setTotalAmount(subtotal.add(bill.getTaxAmount()));
                
                billRepository.save(bill);
            }
        }
        log.info("Seeding completed successfully!");
    }
}
