package com.smartretail.service;

import com.smartretail.dto.request.CustomerRequest;
import com.smartretail.dto.response.CustomerResponse;
import com.smartretail.entity.Customer;
import com.smartretail.exception.DuplicateResourceException;
import com.smartretail.exception.ResourceNotFoundException;
import com.smartretail.mapper.EntityMapper;
import com.smartretail.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final EntityMapper mapper;

    public List<CustomerResponse> getAllByStore(Long storeId) {
        return customerRepository.findByStoreIdOrderByNameAsc(storeId)
                .stream().map(mapper::toCustomerResponse).collect(Collectors.toList());
    }

    public List<CustomerResponse> search(Long storeId, String query) {
        return customerRepository.findByStoreIdAndNameContainingIgnoreCase(storeId, query)
                .stream().map(mapper::toCustomerResponse).collect(Collectors.toList());
    }

    public CustomerResponse getById(Long id, Long storeId) {
        Customer customer = customerRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return mapper.toCustomerResponse(customer);
    }

    @Transactional
    public CustomerResponse create(CustomerRequest request, Long storeId) {
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && customerRepository.existsByEmailAndStoreId(request.getEmail(), storeId)) {
            throw new DuplicateResourceException("Customer email already exists in this store");
        }
        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .storeId(storeId)
                .build();
        customer = customerRepository.save(customer);
        log.info("Customer created: {} for store {}", customer.getName(), storeId);
        return mapper.toCustomerResponse(customer);
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request, Long storeId) {
        Customer customer = customerRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equals(customer.getEmail())
                && customerRepository.existsByEmailAndStoreId(request.getEmail(), storeId)) {
            throw new DuplicateResourceException("Customer email already exists in this store");
        }

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer = customerRepository.save(customer);
        log.info("Customer updated: {} for store {}", customer.getName(), storeId);
        return mapper.toCustomerResponse(customer);
    }

    @Transactional
    public void delete(Long id, Long storeId) {
        Customer customer = customerRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        customerRepository.delete(customer);
        log.info("Customer deleted: {} for store {}", customer.getName(), storeId);
    }
}
