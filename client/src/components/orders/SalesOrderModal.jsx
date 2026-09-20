import React from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "../common/Modal.jsx";
import { UpiQrCode } from "../common/UpiQrCode.jsx";
import { money } from "../../utils/formatters.js";

export function SalesOrderModal({
  isOpen,
  onClose,
  soForm,
  setSoForm,
  customers,
  products,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Sales Order">
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Customer *</label>
            <select
              value={soForm.customerId}
              onChange={(e) => setSoForm({ ...soForm, customerId: e.target.value })}
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} (Outstanding: {money(c.outstanding)})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Sales Channel *</label>
            <select
              value={soForm.channelId}
              onChange={(e) => setSoForm({ ...soForm, channelId: e.target.value })}
            >
              <option value="chn_direct">Physical Store (Direct)</option>
              <option value="chn_b2b">B2B Wholesale</option>
              <option value="chn_market">Zepto / Marketplace</option>
            </select>
          </div>

          <div className="form-group span-2">
            <label>Order Line Items</label>
            {soForm.items.map((line, idx) => {
              const selectedP = products.find((p) => p.id === line.productId) || products[0];
              const stockAvail = selectedP?.currentStock || 0;
              const isOverselling = line.quantity > stockAvail;

              return (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 8, alignItems: "center", marginBottom: 8, padding: 8, background: "#f8fafc", borderRadius: 8 }}>
                  <div>
                    <select
                      value={line.productId}
                      onChange={(e) => {
                        const p = products.find((x) => x.id === e.target.value);
                        const next = [...soForm.items];
                        next[idx] = { ...next[idx], productId: p.id, unitPrice: p.sellingPrice, tax: p.tax || 18 };
                        setSoForm({ ...soForm, items: next });
                      }}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
                      ))}
                    </select>
                    {isOverselling && <small style={{ color: "var(--accent-2)", display: "block" }}>⚠️ Exceeds stock ({stockAvail} available)</small>}
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={line.quantity}
                      onChange={(e) => {
                        const next = [...soForm.items];
                        next[idx].quantity = parseInt(e.target.value, 10) || 1;
                        setSoForm({ ...soForm, items: next });
                      }}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Price"
                      value={line.unitPrice}
                      onChange={(e) => {
                        const next = [...soForm.items];
                        next[idx].unitPrice = parseFloat(e.target.value) || 0;
                        setSoForm({ ...soForm, items: next });
                      }}
                    />
                  </div>
                  <div>
                    <strong>{money(line.quantity * line.unitPrice * (1 + (line.tax || 18) / 100))}</strong>
                  </div>
                  {soForm.items.length > 1 && (
                    <button type="button" className="icon-btn delete" onClick={() => {
                      setSoForm({ ...soForm, items: soForm.items.filter((_, i) => i !== idx) });
                    }}><Trash2 size={14} /></button>
                  )}
                </div>
              );
            })}
            <button type="button" className="btn-ghost" style={{ width: "100%", marginTop: 6 }} onClick={() => {
              if (products.length > 0) {
                setSoForm({ ...soForm, items: [...soForm.items, { productId: products[0].id, quantity: 1, unitPrice: products[0].sellingPrice, tax: products[0].tax || 18 }] });
              }
            }}>+ Add Another Product</button>
          </div>

          <div className="form-group span-2">
            <label>Payment Method & Checkout Mode</label>
            <select
              value={soForm.paymentMethod || "CASH"}
              onChange={(e) => setSoForm({ ...soForm, paymentMethod: e.target.value })}
            >
              <option value="CASH">Cash Payment</option>
              <option value="UPI">Instant UPI Payment QR (Scan & Pay)</option>
              <option value="CREDIT_CARD">Credit / Debit Card POS Terminal</option>
              <option value="CREDIT_ACCOUNT">Store Credit / Pay Later</option>
            </select>
          </div>

          {soForm.paymentMethod === "UPI" && (
            <div className="form-group span-2" style={{ textAlign: "center", background: "#f8fafc", padding: 12, borderRadius: 8 }}>
              <UpiQrCode
                upiString={`upi://pay?pa=retailops@upi&pn=RetailOpsStore&am=${soForm.items.reduce((acc, i) => acc + (i.quantity * i.unitPrice * (1 + (i.tax || 18) / 100)), 0)}&cu=INR&tn=POS-Checkout`}
                size={140}
                title="Customer Scans to Complete POS Payment"
              />
            </div>
          )}

          <div className="form-group span-2">
            <label>Order Notes / Reference</label>
            <input
              type="text"
              placeholder="e.g. Counter pickup, Delivery instruction..."
              value={soForm.notes}
              onChange={(e) => setSoForm({ ...soForm, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn">Confirm Sale & Auto-Invoice</button>
        </div>
      </form>
    </Modal>
  );
}
