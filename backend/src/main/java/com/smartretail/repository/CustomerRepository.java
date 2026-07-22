package com.smartretail.repository;

import com.smartretail.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByStoreIdOrderByNameAsc(Long storeId);
    Optional<Customer> findByIdAndStoreId(Long id, Long storeId);
    boolean existsByEmailAndStoreId(String email, Long storeId);
    List<Customer> findByStoreIdAndNameContainingIgnoreCase(Long storeId, String name);
    long countByStoreId(Long storeId);
    List<Customer> findByStoreIdAndEmailIsNotNull(Long storeId);
}
