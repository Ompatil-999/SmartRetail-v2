package com.smartretail.repository;

import com.smartretail.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByStoreIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long storeId, LocalDateTime start, LocalDateTime end);
    List<Bill> findByStoreIdOrderByCreatedAtDesc(Long storeId);
    Optional<Bill> findByIdAndStoreId(Long id, Long storeId);
    boolean existsByBillNumberAndStoreId(String billNumber, Long storeId);
    List<Bill> findByCustomerIdAndStoreId(Long customerId, Long storeId);
    long countByStoreId(Long storeId);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b WHERE b.storeId = :storeId")
    BigDecimal getTotalRevenue(@Param("storeId") Long storeId);

    @Query("SELECT DATE(b.createdAt) as date, SUM(b.totalAmount) as total " +
           "FROM Bill b " +
           "WHERE b.storeId = :storeId AND b.createdAt >= :startDate " +
           "GROUP BY DATE(b.createdAt) " +
           "ORDER BY date ASC")
    List<Object[]> findSalesTrend(@Param("storeId") Long storeId, @Param("startDate") LocalDateTime startDate);
}
