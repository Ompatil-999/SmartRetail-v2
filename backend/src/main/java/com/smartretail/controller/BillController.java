package com.smartretail.controller;

import com.smartretail.dto.request.BillRequest;
import com.smartretail.dto.response.ApiResponse;
import com.smartretail.dto.response.BillResponse;
import com.smartretail.entity.Owner;
import com.smartretail.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillingService billingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillResponse>>> getAll(
            @AuthenticationPrincipal Owner owner,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getBillsByFilter(owner.getStore().getId(), month, year)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillResponse>> getById(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getById(id, owner.getStore().getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BillResponse>> create(
            @AuthenticationPrincipal Owner owner,
            @Valid @RequestBody BillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bill created",
                        billingService.createBill(request, owner.getStore().getId())));
    }
}
