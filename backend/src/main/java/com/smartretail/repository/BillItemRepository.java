package com.smartretail.repository;

import com.smartretail.entity.BillItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillItemRepository extends JpaRepository<BillItem, Long> {

    @Query("SELECT bi.productName, SUM(bi.quantity) as totalSold " +
           "FROM BillItem bi " +
           "WHERE bi.bill.storeId = :storeId " +
           "GROUP BY bi.productName " +
           "ORDER BY totalSold DESC")
    List<Object[]> findTopSellingProducts(@Param("storeId") Long storeId, Pageable pageable);
}
