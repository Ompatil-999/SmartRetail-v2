package com.smartretail.repository;

import com.smartretail.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStoreIdOrderByNameAsc(Long storeId);

    Optional<Product> findByIdAndStoreId(Long id, Long storeId);

    Optional<Product> findByBarcodeAndStoreId(String barcode, Long storeId);

    boolean existsByBarcodeAndStoreId(String barcode, Long storeId);

    @Query("SELECT p FROM Product p WHERE p.storeId = :storeId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR p.barcode = :query)")
    List<Product> searchByNameOrBarcode(@Param("storeId") Long storeId, @Param("query") String query);

    @Query("SELECT p FROM Product p WHERE p.storeId = :storeId AND p.stockQty <= p.lowStockThreshold")
    List<Product> findLowStockProducts(@Param("storeId") Long storeId);

    long countByStoreId(Long storeId);
}
