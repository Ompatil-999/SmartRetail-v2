package com.smartretail.service;

import com.smartretail.dto.request.ProductRequest;
import com.smartretail.dto.response.ProductResponse;
import com.smartretail.entity.Category;
import com.smartretail.entity.Product;
import com.smartretail.exception.DuplicateResourceException;
import com.smartretail.exception.ResourceNotFoundException;
import com.smartretail.mapper.EntityMapper;
import com.smartretail.repository.CategoryRepository;
import com.smartretail.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final EntityMapper mapper;

    public List<ProductResponse> getAllByStore(Long storeId) {
        return productRepository.findByStoreIdOrderByNameAsc(storeId)
                .stream().map(mapper::toProductResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> search(Long storeId, String query) {
        return productRepository.searchByNameOrBarcode(storeId, query)
                .stream().map(mapper::toProductResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getLowStock(Long storeId) {
        return productRepository.findLowStockProducts(storeId)
                .stream().map(mapper::toProductResponse).collect(Collectors.toList());
    }

    public ProductResponse getById(Long id, Long storeId) {
        Product product = productRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return mapper.toProductResponse(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest request, Long storeId) {
        if (request.getBarcode() != null && !request.getBarcode().isBlank()
                && productRepository.existsByBarcodeAndStoreId(request.getBarcode(), storeId)) {
            throw new DuplicateResourceException("Barcode '" + request.getBarcode() + "' already in use");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndStoreId(request.getCategoryId(), storeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .barcode(request.getBarcode())
                .stockQty(request.getStockQty())
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10)
                .category(category)
                .storeId(storeId)
                .build();
        product = productRepository.save(product);
        log.info("Product created: {} for store {}", product.getName(), storeId);
        return mapper.toProductResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request, Long storeId) {
        Product product = productRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (request.getBarcode() != null && !request.getBarcode().isBlank()
                && !request.getBarcode().equals(product.getBarcode())
                && productRepository.existsByBarcodeAndStoreId(request.getBarcode(), storeId)) {
            throw new DuplicateResourceException("Barcode '" + request.getBarcode() + "' already in use");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndStoreId(request.getCategoryId(), storeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setBarcode(request.getBarcode());
        product.setStockQty(request.getStockQty());
        if (request.getLowStockThreshold() != null) {
            product.setLowStockThreshold(request.getLowStockThreshold());
        }
        product.setCategory(category);
        product = productRepository.save(product);
        log.info("Product updated: {} for store {}", product.getName(), storeId);
        return mapper.toProductResponse(product);
    }

    @Transactional
    public void delete(Long id, Long storeId) {
        Product product = productRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        productRepository.delete(product);
        log.info("Product deleted: {} for store {}", product.getName(), storeId);
    }

    @Transactional
    public ProductResponse uploadImage(Long id, MultipartFile file, Long storeId) {
        Product product = productRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        try {
            Path uploadPath = Paths.get("uploads", "products").toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String ext = getExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + "." + ext;
            Path filePath = uploadPath.resolve(filename);
            file.transferTo(filePath.toFile());

            product.setImageUrl("/uploads/products/" + filename);
            product = productRepository.save(product);
            log.info("Image uploaded for product {}: {}", product.getName(), filename);
            return mapper.toProductResponse(product);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    private String getExtension(String filename) {
        if (filename == null)
            return "jpg";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot + 1).toLowerCase() : "jpg";
    }
}
