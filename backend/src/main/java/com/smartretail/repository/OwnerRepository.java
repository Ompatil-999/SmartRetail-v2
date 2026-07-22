package com.smartretail.repository;

import com.smartretail.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT o FROM Owner o JOIN FETCH o.store WHERE o.email = :email")
    Optional<Owner> findByEmailWithStore(@org.springframework.data.repository.query.Param("email") String email);

    boolean existsByEmail(String email);
}
