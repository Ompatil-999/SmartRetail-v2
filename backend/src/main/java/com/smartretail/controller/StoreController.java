package com.smartretail.controller;

import com.smartretail.dto.request.StoreUpdateRequest;
import com.smartretail.dto.response.ApiResponse;
import com.smartretail.dto.response.DashboardResponse;
import com.smartretail.dto.response.StoreResponse;
import com.smartretail.entity.Owner;
import com.smartretail.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping
    public ResponseEntity<ApiResponse<StoreResponse>> getStore(@AuthenticationPrincipal Owner owner) {
        return ResponseEntity.ok(ApiResponse.success(storeService.getStore(owner.getStore().getId())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<StoreResponse>> updateStore(
            @AuthenticationPrincipal Owner owner,
            @Valid @RequestBody StoreUpdateRequest request) {
        return ResponseEntity
                .ok(ApiResponse.success("Store updated", storeService.updateStore(owner.getStore().getId(), request)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(@AuthenticationPrincipal Owner owner) {
        return ResponseEntity.ok(ApiResponse.success(storeService.getDashboard(owner.getStore().getId())));
    }
}
