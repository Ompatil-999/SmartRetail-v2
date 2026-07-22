package com.smartretail.mapper;

import com.smartretail.dto.response.*;
import com.smartretail.entity.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class EntityMapper {

    public StoreResponse toStoreResponse(Store store) {
        return StoreResponse.builder()
                .id(store.getId())
                .storeName(store.getStoreName())
                .gstNumber(store.getGstNumber())
                .defaultTaxRate(store.getDefaultTaxRate())
                .address(store.getAddress())
                .phone(store.getPhone())
                .build();
    }

    public CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }

    public ProductResponse toProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .barcode(product.getBarcode())
                .stockQty(product.getStockQty())
                .lowStockThreshold(product.getLowStockThreshold())
                .lowStock(product.isLowStock())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .imageUrl(product.getImageUrl())
                .build();
    }

    public CustomerResponse toCustomerResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .build();
    }

    public BillResponse toBillResponse(Bill bill) {
        return BillResponse.builder()
                .id(bill.getId())
                .billNumber(bill.getBillNumber())
                .customerId(bill.getCustomer() != null ? bill.getCustomer().getId() : null)
                .customerName(bill.getCustomer() != null ? bill.getCustomer().getName() : null)
                .subtotal(bill.getSubtotal())
                .itemDiscount(bill.getItemDiscount())
                .billDiscount(bill.getBillDiscount())
                .billDiscountPercentage(bill.getBillDiscountPercentage())
                .taxableAmount(bill.getTaxableAmount())
                .taxRate(bill.getTaxRate())
                .taxAmount(bill.getTaxAmount())
                .totalAmount(bill.getTotalAmount())
                .status(bill.getStatus())
                .createdAt(bill.getCreatedAt())
                .items(bill.getItems().stream().map(this::toBillItemResponse).collect(Collectors.toList()))
                .build();
    }

    public BillResponse.BillItemResponse toBillItemResponse(BillItem item) {
        return BillResponse.BillItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .discount(item.getDiscount())
                .lineTotal(item.getLineTotal())
                .build();
    }

    public OfferResponse toOfferResponse(Offer offer) {
        return OfferResponse.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .description(offer.getDescription())
                .discount(offer.getDiscount())
                .validFrom(offer.getValidFrom())
                .validTill(offer.getValidTill())
                .active(offer.getActive())
                .expired(offer.isExpired())
                .build();
    }
}
