package com.smartretail.service;

import com.smartretail.dto.request.BillRequest;
import com.smartretail.dto.response.BillResponse;
import com.smartretail.entity.*;
import com.smartretail.exception.DuplicateResourceException;
import com.smartretail.exception.InsufficientStockException;
import com.smartretail.exception.ResourceNotFoundException;
import com.smartretail.mapper.EntityMapper;
import com.smartretail.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

        private final BillRepository billRepository;
        private final ProductRepository productRepository;
        private final CustomerRepository customerRepository;
        private final StoreRepository storeRepository;
        private final EntityMapper mapper;
        private final QrCodeService qrCodeService;
        private final EmailService emailService;

        public List<BillResponse> getBillsByFilter(Long storeId) {
                return getBillsByFilter(storeId, null, null);
        }

        public List<BillResponse> getBillsByFilter(Long storeId, Integer month, Integer year) {
                if (month != null || year != null) {
                        LocalDateTime start;
                        LocalDateTime end;

                        if (month != null && year != null) {
                                // Filter by specific month and year
                                LocalDate startDate = LocalDate.of(year, month, 1);
                                start = startDate.atStartOfDay();
                                end = startDate.plusMonths(1).atStartOfDay().minusNanos(1);
                        } else if (year != null) {
                                // Filter by specific year
                                LocalDate startDate = LocalDate.of(year, 1, 1);
                                start = startDate.atStartOfDay();
                                end = startDate.plusYears(1).atStartOfDay().minusNanos(1);
                        } else {
                                // Only month provided, assume current year
                                LocalDate startDate = LocalDate.of(LocalDate.now().getYear(), month, 1);
                                start = startDate.atStartOfDay();
                                end = startDate.plusMonths(1).atStartOfDay().minusNanos(1);
                        }

                        return billRepository.findByStoreIdAndCreatedAtBetweenOrderByCreatedAtDesc(storeId, start, end)
                                        .stream().map(b -> enrichBillResponse(b, null)).collect(Collectors.toList());
                }
                return billRepository.findByStoreIdOrderByCreatedAtDesc(storeId)
                                .stream().map(b -> enrichBillResponse(b, null)).collect(Collectors.toList());
        }

        public BillResponse getById(Long id, Long storeId) {
                Bill bill = billRepository.findByIdAndStoreId(id, storeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
                Store store = storeRepository.findById(storeId).orElse(null);
                return enrichBillResponse(bill, store);
        }

        public List<BillResponse> getByCustomer(Long customerId, Long storeId) {
                return billRepository.findByCustomerIdAndStoreId(customerId, storeId)
                                .stream().map(b -> enrichBillResponse(b, null)).collect(Collectors.toList());
        }

        /**
         * Creates a bill using strict billing order:
         * Subtotal → Item Discount → Bill Discount → GST → Final Total
         * 
         * Also handles:
         * - Inline customer creation (if newCustomer provided)
         * - QR code generation
         * - Async invoice email dispatch
         */
        @Transactional
        public BillResponse createBill(BillRequest request, Long storeId) {
                Store store = storeRepository.findById(storeId)
                                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

                // Generate unique bill number
                String billNumber = generateBillNumber(storeId);

                // Resolve or create customer
                Customer customer = resolveCustomer(request, storeId);

                Bill bill = Bill.builder()
                                .billNumber(billNumber)
                                .customer(customer)
                                .storeId(storeId)
                                .taxRate(store.getDefaultTaxRate())
                                .items(new ArrayList<>())
                                .build();

                BigDecimal subtotal = BigDecimal.ZERO;
                BigDecimal totalItemDiscount = BigDecimal.ZERO;

                // Process each item
                for (BillRequest.BillItemRequest itemReq : request.getItems()) {
                        Product product = productRepository.findByIdAndStoreId(itemReq.getProductId(), storeId)
                                        .orElseThrow(
                                                        () -> new ResourceNotFoundException("Product not found: ID "
                                                                        + itemReq.getProductId()));

                        // Validate stock
                        if (product.getStockQty() < itemReq.getQuantity()) {
                                throw new InsufficientStockException(
                                                "Insufficient stock for '" + product.getName() + "'. Available: "
                                                                + product.getStockQty()
                                                                + ", Requested: " + itemReq.getQuantity());
                        }

                        // Calculate line total: (unitPrice * qty) - itemDiscount
                        BigDecimal lineGross = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                        BigDecimal itemDiscount = itemReq.getDiscount() != null ? itemReq.getDiscount()
                                        : BigDecimal.ZERO;
                        BigDecimal lineTotal = lineGross.subtract(itemDiscount).max(BigDecimal.ZERO);

                        subtotal = subtotal.add(lineGross);
                        totalItemDiscount = totalItemDiscount.add(itemDiscount);

                        // Reduce inventory
                        product.setStockQty(product.getStockQty() - itemReq.getQuantity());
                        productRepository.save(product);

                        BillItem billItem = BillItem.builder()
                                        .bill(bill)
                                        .product(product)
                                        .productName(product.getName())
                                        .quantity(itemReq.getQuantity())
                                        .unitPrice(product.getPrice())
                                        .discount(itemDiscount)
                                        .lineTotal(lineTotal)
                                        .build();

                        bill.getItems().add(billItem);
                }

                // Billing order: Subtotal → Item Discount → Bill Discount → GST → Total
                BigDecimal billDiscountPercent = request.getBillDiscountPercentage() != null ? request.getBillDiscountPercentage()
                                : BigDecimal.ZERO;
                BigDecimal afterItemDiscount = subtotal.subtract(totalItemDiscount).max(BigDecimal.ZERO);
                
                // Calculate bill discount amount from percentage
                BigDecimal billDiscount = afterItemDiscount.multiply(billDiscountPercent)
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                
                BigDecimal taxableAmount = afterItemDiscount.subtract(billDiscount).max(BigDecimal.ZERO);
                BigDecimal taxAmount = taxableAmount.multiply(store.getDefaultTaxRate())
                                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                BigDecimal totalAmount = taxableAmount.add(taxAmount).setScale(2, RoundingMode.HALF_UP);

                bill.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
                bill.setItemDiscount(totalItemDiscount.setScale(2, RoundingMode.HALF_UP));
                bill.setBillDiscount(billDiscount.setScale(2, RoundingMode.HALF_UP));
                bill.setBillDiscountPercentage(billDiscountPercent.setScale(2, RoundingMode.HALF_UP));
                bill.setTaxableAmount(taxableAmount.setScale(2, RoundingMode.HALF_UP));
                bill.setTaxAmount(taxAmount);
                bill.setTotalAmount(totalAmount);

                bill = billRepository.save(bill);
                log.info("Bill created: {} totaling {} for store {}", billNumber, totalAmount, storeId);

                // Build response with QR code and store details
                BillResponse response = enrichBillResponse(bill, store);

                // Generate QR code
                String qrData = qrCodeService.buildQrData(billNumber, storeId, totalAmount.toPlainString());
                response.setQrCodeBase64(qrCodeService.generateQrCodeBase64(qrData, 200));

                // Async invoice email (if customer has email)
                if (customer != null && customer.getEmail() != null && !customer.getEmail().isBlank()) {
                        emailService.sendInvoiceEmail(bill, store, customer);
                }

                return response;
        }

        /**
         * Resolves customer: use existing by ID, create new inline, or null for
         * walk-in.
         */
        private Customer resolveCustomer(BillRequest request, Long storeId) {
                // Option 1: Existing customer by ID
                if (request.getCustomerId() != null) {
                        return customerRepository.findByIdAndStoreId(request.getCustomerId(), storeId)
                                        .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
                }

                // Option 2: Create new customer inline
                if (request.getNewCustomer() != null) {
                        BillRequest.NewCustomer nc = request.getNewCustomer();

                        // Duplicate check by email within store
                        if (nc.getEmail() != null && !nc.getEmail().isBlank()
                                        && customerRepository.existsByEmailAndStoreId(nc.getEmail(), storeId)) {
                                throw new DuplicateResourceException(
                                                "Customer with email '" + nc.getEmail() + "' already exists");
                        }

                        Customer customer = Customer.builder()
                                        .name(nc.getName())
                                        .email(nc.getEmail())
                                        .phone(nc.getPhone())
                                        .storeId(storeId)
                                        .build();
                        customer = customerRepository.save(customer);
                        log.info("Inline customer created: {} for store {}", customer.getName(), storeId);
                        return customer;
                }

                // Option 3: Walk-in customer (null)
                return null;
        }

        private BillResponse enrichBillResponse(Bill bill, Store store) {
                BillResponse response = mapper.toBillResponse(bill);

                // Add store details
                if (store == null && bill.getStoreId() != null) {
                        store = storeRepository.findById(bill.getStoreId()).orElse(null);
                }
                if (store != null) {
                        response.setStoreName(store.getStoreName());
                        response.setStoreGstNumber(store.getGstNumber());
                        response.setStorePhone(store.getPhone());
                        response.setStoreAddress(store.getAddress());
                }

                // Add customer details
                if (bill.getCustomer() != null) {
                        response.setCustomerEmail(bill.getCustomer().getEmail());
                        response.setCustomerPhone(bill.getCustomer().getPhone());
                }

                // Generate QR for existing bills on fetch
                String qrData = qrCodeService.buildQrData(bill.getBillNumber(), bill.getStoreId(),
                                bill.getTotalAmount().toPlainString());
                response.setQrCodeBase64(qrCodeService.generateQrCodeBase64(qrData, 200));

                return response;
        }

        private String generateBillNumber(Long storeId) {
                String prefix = "INV-" + storeId + "-";
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
                String random = String.valueOf(ThreadLocalRandom.current().nextInt(100, 999));
                String billNumber = prefix + timestamp + random;

                // Guard against (extremely unlikely) duplicates
                while (billRepository.existsByBillNumberAndStoreId(billNumber, storeId)) {
                        random = String.valueOf(ThreadLocalRandom.current().nextInt(100, 999));
                        billNumber = prefix + timestamp + random;
                }
                return billNumber;
        }
}
