package com.smartretail.controller;

import com.smartretail.dto.request.OfferRequest;
import com.smartretail.dto.response.ApiResponse;
import com.smartretail.dto.response.OfferResponse;
import com.smartretail.entity.Owner;
import com.smartretail.service.OfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OfferResponse>>> getAll(@AuthenticationPrincipal Owner owner) {
        return ResponseEntity.ok(ApiResponse.success(offerService.getAllByStore(owner.getStore().getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OfferResponse>> getById(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(offerService.getById(id, owner.getStore().getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OfferResponse>> create(
            @AuthenticationPrincipal Owner owner,
            @Valid @RequestBody OfferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Offer created", offerService.create(request, owner.getStore().getId())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OfferResponse>> update(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id,
            @Valid @RequestBody OfferRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success("Offer updated", offerService.update(id, request, owner.getStore().getId())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id) {
        offerService.delete(id, owner.getStore().getId());
        return ResponseEntity.ok(ApiResponse.success("Offer deleted", null));
    }
}
