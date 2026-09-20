import React from "react";
import { Modal } from "../common/Modal.jsx";
import { money } from "../../utils/formatters.js";

export function PaymentModal({
  isOpen,
  onClose,
  paymentForm,
  setPaymentForm,
  customers,
  suppliers,
  invoices,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment Transaction">
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Transaction Type *</label>
            <select
              value={paymentForm.type}
              onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value })}
            >
              <option value="CUSTOMER_RECEIPT">Customer Payment Receipt (Inflow +)</option>
              <option value="SUPPLIER_PAYMENT">Supplier Disbursement Payment (Outflow -)</option>
            </select>
          </div>

          {paymentForm.type === "CUSTOMER_RECEIPT" ? (
            <>
              <div className="form-group">
                <label>Select Customer *</label>
                <select
                  value={paymentForm.customerId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, customerId: e.target.value })}
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} (Outstanding: {money(c.outstanding)})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Link Invoice (Optional)</label>
                <select
                  value={paymentForm.invoiceId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, invoiceId: e.target.value })}
                >
                  <option value="">-- No Specific Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>{inv.id} — Total: {money(inv.total)} ({inv.status})</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="form-group span-2">
              <label>Select Supplier *</label>
              <select
                value={paymentForm.supplierId}
                onChange={(e) => setPaymentForm({ ...paymentForm, supplierId: e.target.value })}
                required
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (Payable: {money(s.outstanding)})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Payment Amount (₹) *</label>
            <input
              type="number"
              min="1"
              required
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <label>Payment Method *</label>
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
            >
              <option value="UPI">UPI / QR Payment</option>
              <option value="BANK">Bank Transfer / NEFT</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          <div className="form-group span-2">
            <label>Notes / Reference No</label>
            <input
              type="text"
              placeholder="e.g. UTR / Transaction ID..."
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn">Record & Reconcile Balance</button>
        </div>
      </form>
    </Modal>
  );
}
