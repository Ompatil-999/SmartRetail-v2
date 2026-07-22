package com.smartretail.service;

import com.smartretail.entity.*;
import com.smartretail.repository.CustomerRepository;
import com.smartretail.repository.StoreRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final CustomerRepository customerRepository;
    private final StoreRepository storeRepository;

    @Async
    public void sendOfferEmailToCustomers(Long storeId, Offer offer) {
        try {
            Store store = storeRepository.findById(storeId).orElse(null);
            if (store == null) {
                log.warn("Store {} not found for email notification", storeId);
                return;
            }

            List<Customer> customers = customerRepository.findByStoreIdAndEmailIsNotNull(storeId);
            log.info("Sending offer email to {} customers for store {}", customers.size(), storeId);

            for (Customer customer : customers) {
                try {
                    sendOfferEmail(customer, offer, store);
                } catch (Exception e) {
                    log.error("Failed to send email to {}: {}", customer.getEmail(), e.getMessage());
                }
            }

            log.info("Offer email dispatch completed for store {}", storeId);
        } catch (Exception e) {
            log.error("Error in offer email batch for store {}: {}", storeId, e.getMessage());
        }
    }

    @Async
    public void sendInvoiceEmail(Bill bill, Store store, Customer customer) {
        try {
            log.info("Sending invoice email for bill {} to {}", bill.getBillNumber(), customer.getEmail());

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(customer.getEmail());
            helper.setSubject("Invoice " + bill.getBillNumber() + " from " + store.getStoreName());

            String html = buildInvoiceEmailHtml(bill, store, customer);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Invoice email sent to {} for bill {}", customer.getEmail(), bill.getBillNumber());
        } catch (Exception e) {
            log.error("Failed to send invoice email for bill {}: {}", bill.getBillNumber(), e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(Owner owner, String token) {
        try {
            log.info("Sending password reset email to {}", owner.getEmail());

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(owner.getEmail());
            helper.setSubject("Password Reset Request - SmartRetail");

            String resetLink = "http://localhost:5173/reset-password?token=" + token;
            String html = buildPasswordResetEmailHtml(owner, resetLink);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Password reset email sent to {}", owner.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", owner.getEmail(), e.getMessage());
        }
    }

    private String buildPasswordResetEmailHtml(Owner owner, String resetLink) {
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">SmartRetail</h1>
                            <p style="color: rgba(255,255,255,0.85); margin-top: 5px;">Password Reset Request</p>
                        </div>
                        <div style="padding: 30px;">
                            <p style="color: #374151; font-size: 16px;">Hi <strong>%s</strong>,</p>
                            <p style="color: #6B7280; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new one. This link will expire in 24 hours.</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
                            </div>
                            <p style="color: #9CA3AF; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
                        </div>
                        <div style="background: #F9FAFB; padding: 15px; text-align: center; border-top: 1px solid #E5E7EB;">
                            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">© SmartRetail. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(owner.getOwnerName(), resetLink);
    }

    private String buildInvoiceEmailHtml(Bill bill, Store store, Customer customer) {
        StringBuilder itemRows = new StringBuilder();
        if (bill.getItems() != null) {
            for (BillItem item : bill.getItems()) {
                itemRows.append(String.format(
                        """
                                <tr>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; color: #374151;">%s</td>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; text-align: center; color: #374151;">%d</td>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; text-align: right; color: #374151;">₹%s</td>
                                    <td style="padding: 10px 12px; border-bottom: 1px solid #E5E7EB; text-align: right; font-weight: 600; color: #111827;">₹%s</td>
                                </tr>
                                """,
                        item.getProductName(),
                        item.getQuantity(),
                        item.getUnitPrice().toPlainString(),
                        item.getLineTotal().toPlainString()));
            }
        }

        String dateStr = bill.getCreatedAt() != null
                ? bill.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                : "";

        BigDecimal totalDiscounts = (bill.getItemDiscount() != null ? bill.getItemDiscount() : BigDecimal.ZERO)
                .add(bill.getBillDiscount() != null ? bill.getBillDiscount() : BigDecimal.ZERO);

        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head><meta charset="UTF-8"></head>
                        <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;">
                            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

                                <!-- Header -->
                                <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; text-align: center;">
                                    <h1 style="color: white; margin: 0; font-size: 24px;">%s</h1>
                                    <p style="color: rgba(255,255,255,0.85); margin-top: 5px; font-size: 14px;">Tax Invoice</p>
                                </div>

                                <!-- Invoice Details -->
                                <div style="padding: 25px 30px; background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
                                    <table style="width: 100%%; font-size: 14px;">
                                        <tr>
                                            <td style="color: #6B7280;">Invoice No:</td>
                                            <td style="text-align: right; font-weight: 600; color: #111827;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #6B7280;">Date:</td>
                                            <td style="text-align: right; color: #374151;">%s</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #6B7280;">Customer:</td>
                                            <td style="text-align: right; color: #374151;">%s</td>
                                        </tr>
                                    </table>
                                </div>

                                <!-- Items Table -->
                                <div style="padding: 0 30px;">
                                    <table style="width: 100%%; border-collapse: collapse; font-size: 14px; margin-top: 20px;">
                                        <thead>
                                            <tr style="background: #F3F4F6;">
                                                <th style="padding: 10px 12px; text-align: left; color: #6B7280; font-weight: 600; font-size: 12px; text-transform: uppercase;">Item</th>
                                                <th style="padding: 10px 12px; text-align: center; color: #6B7280; font-weight: 600; font-size: 12px; text-transform: uppercase;">Qty</th>
                                                <th style="padding: 10px 12px; text-align: right; color: #6B7280; font-weight: 600; font-size: 12px; text-transform: uppercase;">Price</th>
                                                <th style="padding: 10px 12px; text-align: right; color: #6B7280; font-weight: 600; font-size: 12px; text-transform: uppercase;">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            %s
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Totals -->
                                <div style="padding: 20px 30px; margin-top: 10px;">
                                    <table style="width: 100%%; font-size: 14px;">
                                        <tr>
                                            <td style="padding: 4px 0; color: #6B7280;">Subtotal</td>
                                            <td style="padding: 4px 0; text-align: right; color: #374151;">₹%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 4px 0; color: #059669;">Discounts</td>
                                            <td style="padding: 4px 0; text-align: right; color: #059669;">-₹%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 4px 0; color: #6B7280;">GST (%s%%)</td>
                                            <td style="padding: 4px 0; text-align: right; color: #374151;">₹%s</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 12px 0 4px; font-size: 18px; font-weight: 700; color: #111827; border-top: 2px solid #E5E7EB;">Total</td>
                                            <td style="padding: 12px 0 4px; text-align: right; font-size: 18px; font-weight: 700; color: #4F46E5; border-top: 2px solid #E5E7EB;">₹%s</td>
                                        </tr>
                                    </table>
                                </div>

                                <!-- Footer -->
                                <div style="background: #F9FAFB; padding: 20px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
                                    <p style="color: #9CA3AF; font-size: 12px; margin: 0;">Thank you for shopping with %s!</p>
                                    <p style="color: #9CA3AF; font-size: 11px; margin-top: 5px;">%s</p>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                store.getStoreName(),
                bill.getBillNumber(),
                dateStr,
                customer.getName(),
                itemRows.toString(),
                bill.getSubtotal().toPlainString(),
                totalDiscounts.toPlainString(),
                bill.getTaxRate().toPlainString(),
                bill.getTaxAmount().toPlainString(),
                bill.getTotalAmount().toPlainString(),
                store.getStoreName(),
                store.getGstNumber() != null ? "GSTIN: " + store.getGstNumber() : "");
    }

    private void sendOfferEmail(Customer customer, Offer offer, Store store) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(customer.getEmail());
        helper.setSubject("🎉 New Offer from " + store.getStoreName() + ": " + offer.getTitle());

        String html = buildOfferEmailHtml(customer, offer, store);
        helper.setText(html, true);

        mailSender.send(message);
        log.debug("Offer email sent to {}", customer.getEmail());
    }

    private String buildOfferEmailHtml(Customer customer, Offer offer, Store store) {
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">%s</h1>
                            <p style="color: rgba(255,255,255,0.85); margin-top: 5px;">Special offer just for you!</p>
                        </div>
                        <div style="padding: 30px;">
                            <p style="color: #374151; font-size: 16px;">Hi <strong>%s</strong>,</p>
                            <div style="background: #F3F4F6; border-radius: 10px; padding: 20px; margin: 20px 0;">
                                <h2 style="color: #4F46E5; margin: 0 0 10px;">%s</h2>
                                <p style="color: #6B7280; margin: 0 0 15px;">%s</p>
                                <div style="display: inline-block; background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 12px 24px; border-radius: 8px; font-size: 22px; font-weight: bold;">
                                    %s%% OFF
                                </div>
                                <p style="color: #9CA3AF; margin-top: 15px; font-size: 13px;">Valid until: %s</p>
                            </div>
                            <p style="color: #6B7280; font-size: 14px;">Visit us to avail this offer. We look forward to seeing you!</p>
                        </div>
                        <div style="background: #F9FAFB; padding: 15px; text-align: center; border-top: 1px solid #E5E7EB;">
                            <p style="color: #9CA3AF; font-size: 12px; margin: 0;">© %s. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        store.getStoreName(),
                        customer.getName(),
                        offer.getTitle(),
                        offer.getDescription() != null ? offer.getDescription() : "Check out our amazing new offer!",
                        offer.getDiscount().stripTrailingZeros().toPlainString(),
                        offer.getValidTill().toString(),
                        store.getStoreName());
    }
}
