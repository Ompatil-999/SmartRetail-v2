package com.smartretail.controller;

import com.smartretail.dto.request.CategoryRequest;
import com.smartretail.dto.response.ApiResponse;
import com.smartretail.dto.response.CategoryResponse;
import com.smartretail.entity.Owner;
import com.smartretail.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAll(
            @AuthenticationPrincipal Owner owner,
            @RequestParam(required = false) String search) {
        List<CategoryResponse> list = (search != null && !search.isBlank())
                ? categoryService.search(owner.getStore().getId(), search)
                : categoryService.getAllByStore(owner.getStore().getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getById(id, owner.getStore().getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @AuthenticationPrincipal Owner owner,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created",
                        categoryService.create(request, owner.getStore().getId())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Category updated", categoryService.update(id, request, owner.getStore().getId())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal Owner owner, @PathVariable Long id) {
        categoryService.delete(id, owner.getStore().getId());
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }
}
