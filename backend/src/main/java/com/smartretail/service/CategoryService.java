package com.smartretail.service;

import com.smartretail.dto.request.CategoryRequest;
import com.smartretail.dto.response.CategoryResponse;
import com.smartretail.entity.Category;
import com.smartretail.exception.DuplicateResourceException;
import com.smartretail.exception.ResourceNotFoundException;
import com.smartretail.mapper.EntityMapper;
import com.smartretail.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final EntityMapper mapper;

    public List<CategoryResponse> getAllByStore(Long storeId) {
        return categoryRepository.findByStoreIdOrderByNameAsc(storeId)
                .stream().map(mapper::toCategoryResponse).collect(Collectors.toList());
    }

    public List<CategoryResponse> search(Long storeId, String query) {
        return categoryRepository.findByStoreIdAndNameContainingIgnoreCase(storeId, query)
                .stream().map(mapper::toCategoryResponse).collect(Collectors.toList());
    }

    public CategoryResponse getById(Long id, Long storeId) {
        Category cat = categoryRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return mapper.toCategoryResponse(cat);
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request, Long storeId) {
        if (categoryRepository.existsByNameAndStoreId(request.getName(), storeId)) {
            throw new DuplicateResourceException("Category '" + request.getName() + "' already exists");
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .storeId(storeId)
                .build();
        category = categoryRepository.save(category);
        log.info("Category created: {} for store {}", category.getName(), storeId);
        return mapper.toCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request, Long storeId) {
        Category category = categoryRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category = categoryRepository.save(category);
        log.info("Category updated: {} for store {}", category.getName(), storeId);
        return mapper.toCategoryResponse(category);
    }

    @Transactional
    public void delete(Long id, Long storeId) {
        Category category = categoryRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
        log.info("Category deleted: {} for store {}", category.getName(), storeId);
    }
}
