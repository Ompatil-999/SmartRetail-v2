import { useRef } from 'react';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function InvoiceView({ bill, onClose }) {
    const printRef = useRef();

    const handlePrint = () => {
        const content = printRef.current;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Invoice ${bill.billNumber}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; background: #fff; line-height: 1.5; }
                    .invoice { max-width: 400px; margin: 0 auto; }
                    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px dashed #e2e8f0; margin-bottom: 20px; }
                    .store-name { font-size: 24px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; }
                    .store-detail { font-size: 12px; color: #64748b; margin-top: 4px; }
                    .invoice-meta { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 16px; font-weight: 500; }
                    .customer-box { background: #f8fafc; padding: 16px; border-radius: 12px; font-size: 13px; margin-bottom: 20px; border: 1px solid #f1f5f9; }
                    .customer-box strong { color: #0f172a; font-size: 14px; display: block; margin-bottom: 4px; }
                    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
                    th { text-align: left; padding: 8px 4px; border-bottom: 2px solid #e2e8f0; color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
                    th:last-child, td:last-child { text-align: right; }
                    th:nth-child(2), td:nth-child(2) { text-align: center; }
                    th:nth-child(3), td:nth-child(3) { text-align: right; }
                    td { padding: 8px 4px; border-bottom: 1px solid #f1f5f9; color: #334155; }
                    .totals { padding-top: 12px; }
                    .total-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; color: #64748b; font-weight: 500; }
                    .total-row.grand { font-size: 18px; font-weight: 800; color: #0f172a; padding-top: 12px; border-top: 2px solid #e2e8f0; margin-top: 8px; }
                    .total-row.discount { color: #10b981; }
                    .qr-section { text-align: center; margin-top: 24px; padding-top: 20px; border-top: 2px dashed #e2e8f0; }
                    .qr-section img { width: 140px; height: 140px; margin: 0 auto; border-radius: 8px; }
                    .qr-label { font-size: 11px; color: #94a3b8; margin-top: 8px; font-weight: 500; }
                    .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 2px dashed #e2e8f0; font-size: 12px; color: #94a3b8; font-weight: 500; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>${content.innerHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const totalDiscounts = (parseFloat(bill.itemDiscount) || 0) + (parseFloat(bill.billDiscount) || 0);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-[var(--color-surface-200)]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-[var(--color-border-color)] w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col custom-scrollbar">
                {/* Action Bar */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-[var(--color-border-color)] px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="font-bold text-[var(--color-text-primary)] text-lg">Invoice Details</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-50)] text-[var(--color-text-primary)] rounded-xl border border-[var(--color-border-color)] hover:bg-gray-100 transition-colors text-sm font-bold shadow-sm">
                            <PrinterIcon className="w-4 h-4" /> Print
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Content */}
                <div ref={printRef} className="p-8 bg-white">
                    <div className="invoice">
                        {/* Header */}
                        <div className="header" style={{ textAlign: 'center', padding: '30px 20px', backgroundColor: '#f8fafc', borderRadius: '16px', marginBottom: 24, border: '1px solid #e2e8f0' }}>
                            <div className="store-name" style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: 4 }}>
                                {bill.storeName || 'SmartRetail'}
                            </div>
                            {bill.storeAddress && <div className="store-detail" style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{bill.storeAddress}</div>}
                            {bill.storePhone && <div className="store-detail" style={{ fontSize: 13, color: '#64748b' }}>Tel: {bill.storePhone}</div>}
                            {bill.storeGstNumber && <div className="store-detail" style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 600 }}>GSTIN: {bill.storeGstNumber}</div>}
                        </div>

                        {/* Invoice Meta */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 8, fontSize: 13, color: '#64748b', marginBottom: 20, fontWeight: 600 }}>
                            <span style={{ backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '8px', color: '#1e293b' }}>{bill.billNumber}</span>
                            <span>{formatDate(bill.createdAt)}</span>
                        </div>

                        {/* Customer */}
                        {bill.customerName && (
                            <div style={{ background: '#fff', padding: 16, borderRadius: 12, fontSize: 13, marginBottom: 24, border: '1px solid #e2e8f0' }}>
                                <div style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', marginBottom: 8 }}>Billed To</div>
                                <strong style={{ color: '#0f172a', fontSize: 15, display: 'block', marginBottom: 4 }}>{bill.customerName}</strong>
                                {bill.customerEmail && <div style={{ color: '#64748b' }}>{bill.customerEmail}</div>}
                                {bill.customerPhone && <div style={{ color: '#64748b' }}>{bill.customerPhone}</div>}
                            </div>
                        )}

                        {/* Items Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 24 }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '12px 8px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Item</th>
                                    <th style={{ textAlign: 'center', padding: '12px 8px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Qty</th>
                                    <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Rate</th>
                                    <th style={{ textAlign: 'right', padding: '12px 8px', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Amt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.items?.map((item, idx) => (
                                    <tr key={idx}>
                                        <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontWeight: 600 }}>{item.productName}</td>
                                        <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', color: '#334155', fontWeight: 500 }}>{item.quantity}</td>
                                        <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#334155', fontWeight: 500 }}>₹{parseFloat(item.unitPrice).toFixed(2)}</td>
                                        <td style={{ padding: '12px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#0f172a', fontWeight: 700 }}>₹{parseFloat(item.lineTotal).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: '#64748b', fontWeight: 500 }}>
                                <span>Subtotal</span>
                                <span style={{ color: '#334155', fontWeight: 600 }}>₹{parseFloat(bill.subtotal).toFixed(2)}</span>
                            </div>
                            {totalDiscounts > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: '#10b981', fontWeight: 600 }}>
                                    <span>Discounts {bill.billDiscountPercentage > 0 ? `(${bill.billDiscountPercentage}%)` : ''}</span>
                                    <span>-₹{totalDiscounts.toFixed(2)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: '#64748b', fontWeight: 500 }}>
                                <span>GST ({bill.taxRate}%)</span>
                                <span style={{ color: '#334155', fontWeight: 600 }}>₹{parseFloat(bill.taxAmount).toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 900, color: '#0f172a', paddingTop: 12, borderTop: '2px solid #e2e8f0', marginTop: 12 }}>
                                <span>Total</span>
                                <span>₹{parseFloat(bill.totalAmount).toFixed(2)}</span>
                            </div>
                        </div>

                        {/* QR Code */}
                        {bill.qrCodeBase64 && (
                            <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 24 }}>
                                <div style={{ display: 'inline-block', padding: 12, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                                    <img src={bill.qrCodeBase64} alt="Invoice QR" style={{ width: 120, height: 120, display: 'block' }} />
                                </div>
                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Verify Transaction</div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="footer" style={{ textAlign: 'center', marginTop: 32, padding: '24px', backgroundColor: '#0f172a', borderRadius: '16px', color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>
                            <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Thank you for your business!</p>
                            <p>For any queries, please contact our support team.</p>
                            <p style={{ marginTop: 12, fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Powered by SmartRetail</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
