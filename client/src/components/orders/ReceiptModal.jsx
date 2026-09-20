import React from "react";
import { Modal } from "../common/Modal.jsx";
import { UpiQrCode } from "../common/UpiQrCode.jsx";
import { money, formatDate } from "../../utils/formatters.js";
import { Printer, CheckCircle } from "lucide-react";

export function ReceiptModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const items = order.items || [];
  const subtotal = order.totalAmount ? order.totalAmount * 0.8475 : 0; // ~18% GST included calculation
  const totalGst = order.totalAmount ? order.totalAmount - subtotal : 0;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  const upiPayload = `upi://pay?pa=retailops@upi&pn=RetailOpsStore&am=${order.totalAmount || 0}&cu=INR&tn=${order.orderNumber || order.id}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Thermal ESC/POS Receipt: #${order.orderNumber || order.id}`}
      maxWidth="500px"
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-print-container, .receipt-print-container * {
            visibility: visible;
          }
          .receipt-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 10px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            color: #000000;
          }
          .modal-header, .modal-footer, .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="receipt-print-container" style={{
        background: "#fafafa",
        padding: "20px",
        borderRadius: 8,
        border: "1px dashed #cbd5e1",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "13px"
      }}>
        {/* Store Header */}
        <div style={{ textAlign: "center", borderBottom: "1px dashed #94a3b8", pb: 12, marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px 0", letterSpacing: 1 }}>RETAIL OPS SUPERSTORE</h2>
          <p style={{ margin: "2px 0", fontSize: 11, color: "#475569" }}>123 Commercial Belt, Connaught Place</p>
          <p style={{ margin: "2px 0", fontSize: 11, color: "#475569" }}>New Delhi - 110001 | GSTIN: 07AAAAA1234A1Z5</p>
          <p style={{ margin: "2px 0", fontSize: 11, color: "#475569" }}>Ph: +91 11 4982 9000</p>
        </div>

        {/* Invoice Info */}
        <div style={{ borderBottom: "1px dashed #94a3b8", paddingBottom: 8, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Invoice #: <strong>{order.orderNumber || order.id}</strong></span>
            <span>Date: {formatDate(order.createdAt || new Date())}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span>Customer: <strong>{order.customerName || "Walk-in Customer"}</strong></span>
            <span>Pay: <strong>{order.paymentMethod || "UPI/CASH"}</strong></span>
          </div>
        </div>

        {/* Itemized Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12, fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <th style={{ textAlign: "left", paddingBottom: 4 }}>ITEM</th>
              <th style={{ textAlign: "center", paddingBottom: 4 }}>QTY</th>
              <th style={{ textAlign: "right", paddingBottom: 4 }}>PRICE</th>
              <th style={{ textAlign: "right", paddingBottom: 4 }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px dashed #e2e8f0" }}>
                <td style={{ padding: "4px 0" }}>{item.productName || item.name || `Item #${idx + 1}`}</td>
                <td style={{ textAlign: "center", padding: "4px 0" }}>{item.quantity}</td>
                <td style={{ textAlign: "right", padding: "4px 0" }}>{money(item.unitPrice || item.price || 0)}</td>
                <td style={{ textAlign: "right", padding: "4px 0", fontWeight: 600 }}>
                  {money((item.quantity || 1) * (item.unitPrice || item.price || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Financial Summary */}
        <div style={{ borderTop: "1px dashed #94a3b8", paddingTop: 8, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
            <span>Subtotal (Excl. Tax):</span>
            <span>{money(subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0", fontSize: 11, color: "#475569" }}>
            <span>CGST @ 9%:</span>
            <span>{money(cgst)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0", fontSize: 11, color: "#475569" }}>
            <span>SGST @ 9%:</span>
            <span>{money(sgst)}</span>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", margin: "8px 0 0 0",
            fontSize: 16, fontWeight: 800, borderTop: "1px solid #000", paddingTop: 6
          }}>
            <span>GRAND TOTAL:</span>
            <span>{money(order.totalAmount || 0)}</span>
          </div>
        </div>

        {/* UPI QR & Barcode Section */}
        <div style={{ textAlign: "center", borderTop: "1px dashed #94a3b8", paddingTop: 12, marginTop: 12 }}>
          <p style={{ margin: "0 0 8px 0", fontSize: 11, fontWeight: 700 }}>INSTANT UPI PAYMENT QR</p>
          <UpiQrCode upiString={upiPayload} size={140} title="" />
          <div style={{ marginTop: 12, fontFamily: "'Libre Barcode 39', monospace", fontSize: 24, letterSpacing: 4 }}>
            ||| | |||| ||| || |||| |||
          </div>
          <p style={{ margin: "6px 0 0 0", fontSize: 11, fontWeight: 700 }}>*** THANK YOU FOR SHOPPING WITH US! ***</p>
          <p style={{ margin: "2px 0 0 0", fontSize: 10, color: "#64748b" }}>Goods once sold can be returned within 7 days with invoice.</p>
        </div>
      </div>

      <div className="modal-footer no-print" style={{ marginTop: 20 }}>
        <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
        <button type="button" className="primary-btn" onClick={handlePrint}>
          <Printer size={16} /> Print ESC/POS 80mm Receipt
        </button>
      </div>
    </Modal>
  );
}
