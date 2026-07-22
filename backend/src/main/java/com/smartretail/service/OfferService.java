package com.smartretail.service;

import com.smartretail.dto.request.OfferRequest;
import com.smartretail.dto.response.OfferResponse;
import com.smartretail.entity.Offer;
import com.smartretail.exception.ResourceNotFoundException;
import com.smartretail.mapper.EntityMapper;
import com.smartretail.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfferService {

    private final OfferRepository offerRepository;
    private final EmailService emailService;
    private final EntityMapper mapper;

    public List<OfferResponse> getAllByStore(Long storeId) {
        return offerRepository.findByStoreIdOrderByCreatedAtDesc(storeId)
                .stream().map(mapper::toOfferResponse).collect(Collectors.toList());
    }

    public OfferResponse getById(Long id, Long storeId) {
        Offer offer = offerRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));
        return mapper.toOfferResponse(offer);
    }

    @Transactional
    public OfferResponse create(OfferRequest request, Long storeId) {
        if (request.getValidTill().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Valid till date must be in the future");
        }

        Offer offer = Offer.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .discount(request.getDiscount())
                .validFrom(request.getValidFrom())
                .validTill(request.getValidTill())
                .storeId(storeId)
                .build();
        offer = offerRepository.save(offer);
        log.info("Offer created: {} for store {}", offer.getTitle(), storeId);

        // Async email to all store customers
        emailService.sendOfferEmailToCustomers(storeId, offer);

        return mapper.toOfferResponse(offer);
    }

    @Transactional
    public OfferResponse update(Long id, OfferRequest request, Long storeId) {
        Offer offer = offerRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));

        offer.setTitle(request.getTitle());
        offer.setDescription(request.getDescription());
        offer.setDiscount(request.getDiscount());
        offer.setValidFrom(request.getValidFrom());
        offer.setValidTill(request.getValidTill());
        offer = offerRepository.save(offer);
        log.info("Offer updated: {} for store {}", offer.getTitle(), storeId);
        return mapper.toOfferResponse(offer);
    }

    @Transactional
    public void delete(Long id, Long storeId) {
        Offer offer = offerRepository.findByIdAndStoreId(id, storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Offer not found"));
        offerRepository.delete(offer);
        log.info("Offer deleted: {} for store {}", offer.getTitle(), storeId);
    }
}
