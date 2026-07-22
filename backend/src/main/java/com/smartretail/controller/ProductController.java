package com.smartretail.controller;

import com.smartretail.dto.request.ProductRequest;
import com.smartretail.dto.response.ApiResponse;
import com.smartretail.dto.response.ProductResponse;
import com.smartretail.entity.Owner;
import com.smartretail.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAll(
            @AuthenticationPrincipal Owner owner,
            @RequestParam(required = false) String search) {
        List<ProductResponse> list = (search != null && !search.isBlank())
                ? productService.search(owner.getStore().getId(), search)
                : productService.getAllByStore(owner.getStore().getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStock(@AuthenticationPrincipal Owner owner) {
        return ResponseEntity.ok(ApiResponse.success(productService.getLowStock(owner.getStore().getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getById(id, owner.getStore().getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> create(
            @AuthenticationPrincipal Owner owner,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created", productService.create(request, owner.getStore().getId())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Product updated", productService.update(id, request, owner.getStore().getId())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id) {
        productService.delete(id, owner.getStore().getId());
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<ApiResponse<ProductResponse>> uploadImage(
            @AuthenticationPrincipal Owner owner,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only JPG, PNG, and WebP images are allowed"));
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File size must be under 2MB"));
        }
        return ResponseEntity.ok(ApiResponse.success("Image uploaded",
                productService.uploadImage(id, file, owner.getStore().getId())));
    }
}
