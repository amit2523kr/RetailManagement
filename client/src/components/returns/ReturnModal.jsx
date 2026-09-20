import React from "react";
import { Modal } from "../common/Modal.jsx";

export function ReturnModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSave,
  salesOrders = [],
  products = [],
  customers = []
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Process Customer Return & RMA"
    >
      <form onSubmit={onSave}>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Sales Order ID / Reference *</label>
            <input
              type="text"
              required
              placeholder="e.g. ord_101 or SO-9842"
              value={formData.salesOrderId}
              onChange={(e) => {
                const val = e.target.value;
                const foundOrder = salesOrders.find(s => s.id === val || s.orderNumber === val);
                if (foundOrder) {
                  setFormData({
                    ...formData,
                    salesOrderId: val,
                    customerId: foundOrder.customerId || formData.customerId,
                    productId: foundOrder.items?.[0]?.productId || formData.productId
                  });
                } else {
                  setFormData({ ...formData, salesOrderId: val });
                }
              }}
            />
          </div>

          <div className="form-group">
            <label>Customer *</label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            >
              <option value="">Select Customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.businessName ? `(${c.businessName})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Returned Product *</label>
            <select
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            >
              <option value="">Select Product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Return Quantity *</label>
            <input
              type="number"
              min="1"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
            />
          </div>

          <div className="form-group">
            <label>Refund Amount (₹) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.refundAmount}
              onChange={(e) => setFormData({ ...formData, refundAmount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <label>Return Reason *</label>
            <select
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            >
              <option value="DAMAGED_GOODS">Damaged / Defective Goods</option>
              <option value="WRONG_ITEM">Wrong Item Sent</option>
              <option value="EXPIRED">Near Expiry / Expired Item</option>
              <option value="CUSTOMER_CHANGE_OF_MIND">Customer Change of Mind</option>
              <option value="OTHER">Other / Special Exception</option>
            </select>
          </div>

          <div className="form-group">
            <label>Inventory Disposition Action *</label>
            <select
              required
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
            >
              <option value="RESTOCK">RESTOCK (+ Add Back to Active Stock)</option>
              <option value="SCRAP">SCRAP (- Write Off Damaged Stock)</option>
            </select>
          </div>

          <div className="form-group span-2">
            <label>RMA Inspection & Reason Notes</label>
            <textarea
              rows="2"
              placeholder="Detail defects, serial numbers, or packaging condition..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn">
            Process Return & Issue Credit
          </button>
        </div>
      </form>
    </Modal>
  );
}
