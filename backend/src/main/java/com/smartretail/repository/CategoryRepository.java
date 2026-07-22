package com.smartretail.repository;

import com.smartretail.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByStoreIdOrderByNameAsc(Long storeId);
    List<Category> findByStoreIdAndNameContainingIgnoreCase(Long storeId, String name);
    Optional<Category> findByIdAndStoreId(Long id, Long storeId);
    boolean existsByNameAndStoreId(String name, Long storeId);
}
