package com.smartretail.controller;

import com.smartretail.dto.request.CustomerRequest;
import com.smartretail.dto.response.ApiResponse;
import com.smartretail.dto.response.BillResponse;
import com.smartretail.dto.response.CustomerResponse;
import com.smartretail.entity.Owner;
import com.smartretail.service.BillingService;
import com.smartretail.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final BillingService billingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAll(
            @AuthenticationPrincipal Owner owner,
            @RequestParam(required = false) String search) {
        List<CustomerResponse> list = (search != null && !search.isBlank())
                ? customerService.search(owner.getStore().getId(), search)
                : customerService.getAllByStore(owner.getStore().getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getById(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getById(id, owner.getStore().getId())));
    }

    @GetMapping("/{id}/bills")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getCustomerBills(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(billingService.getByCustomer(id, owner.getStore().getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> create(
            @AuthenticationPrincipal Owner owner,
            @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer created",
                        customerService.create(request, owner.getStore().getId())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> update(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Customer updated", customerService.update(id, request, owner.getStore().getId())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id) {
        customerService.delete(id, owner.getStore().getId());
        return ResponseEntity.ok(ApiResponse.success("Customer deleted", null));
    }
}
