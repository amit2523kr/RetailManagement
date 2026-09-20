import React from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "../common/Modal.jsx";
import { money } from "../../utils/formatters.js";

export function PurchaseOrderModal({
  isOpen,
  onClose,
  poForm,
  setPoForm,
  suppliers,
  products,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue New Purchase Order">
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Select Supplier *</label>
            <select
              value={poForm.supplierId}
              onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
              required
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name} (Contact: {s.contact || "-"})</option>
              ))}
            </select>
          </div>

          <div className="form-group span-2">
            <label>Purchase Order Line Items</label>
            {poForm.items.map((line, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", gap: 8, alignItems: "center", marginBottom: 8, padding: 8, background: "#f8fafc", borderRadius: 8 }}>
                <select
                  value={line.productId}
                  onChange={(e) => {
                    const p = products.find((x) => x.id === e.target.value);
                    const next = [...poForm.items];
                    next[idx] = { ...next[idx], productId: p.id, unitPrice: p.purchasePrice, tax: p.tax || 18 };
                    setPoForm({ ...poForm, items: next });
                  }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={line.quantity}
                  onChange={(e) => {
                    const next = [...poForm.items];
                    next[idx].quantity = parseInt(e.target.value, 10) || 1;
                    setPoForm({ ...poForm, items: next });
                  }}
                />
                <input
                  type="number"
                  placeholder="Cost"
                  value={line.unitPrice}
                  onChange={(e) => {
                    const next = [...poForm.items];
                    next[idx].unitPrice = parseFloat(e.target.value) || 0;
                    setPoForm({ ...poForm, items: next });
                  }}
                />
                <div><strong>{money(line.quantity * line.unitPrice * (1 + (line.tax || 18) / 100))}</strong></div>
                {poForm.items.length > 1 && (
                  <button type="button" className="icon-btn delete" onClick={() => {
                    setPoForm({ ...poForm, items: poForm.items.filter((_, i) => i !== idx) });
                  }}><Trash2 size={14} /></button>
                )}
              </div>
            ))}
            <button type="button" className="btn-ghost" style={{ width: "100%", marginTop: 6 }} onClick={() => {
              if (products.length > 0) {
                setPoForm({ ...poForm, items: [...poForm.items, { productId: products[0].id, quantity: 20, unitPrice: products[0].purchasePrice, tax: products[0].tax || 18 }] });
              }
            }}>+ Add Line Item</button>
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn">Issue Purchase Order</button>
        </div>
      </form>
    </Modal>
  );
}
