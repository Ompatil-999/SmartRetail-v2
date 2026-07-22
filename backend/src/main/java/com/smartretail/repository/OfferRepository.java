package com.smartretail.repository;

import com.smartretail.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByStoreIdOrderByCreatedAtDesc(Long storeId);
    Optional<Offer> findByIdAndStoreId(Long id, Long storeId);
}
