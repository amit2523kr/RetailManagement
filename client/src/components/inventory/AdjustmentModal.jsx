import React from "react";
import { Modal } from "../common/Modal.jsx";

export function AdjustmentModal({
  isOpen,
  onClose,
  products,
  adjustProductId,
  setAdjustProductId,
  adjustType,
  setAdjustType,
  adjustQty,
  setAdjustQty,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Stock Adjustment">
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Select Product *</label>
            <select
              value={adjustProductId}
              onChange={(e) => setAdjustProductId(e.target.value)}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Available: {p.currentStock}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Adjustment Type *</label>
            <select value={adjustType} onChange={(e) => setAdjustType(e.target.value)}>
              <option value="MANUAL_ADJUSTMENT">Manual Stock Count Adjustment</option>
              <option value="PURCHASE_RECEIPT">Purchase Receipt Inflow (+)</option>
              <option value="DAMAGE">Damaged / Broken Goods (-)</option>
              <option value="EXPIRED">Expired / Waste (-)</option>
              <option value="RETURN">Customer Return (+)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity Change (+/-) *</label>
            <input
              type="number"
              required
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn">Commit to Ledger</button>
        </div>
      </form>
    </Modal>
  );
}
