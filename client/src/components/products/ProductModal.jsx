import React from "react";
import { Modal } from "../common/Modal.jsx";

export function ProductModal({ modalMode, selectedProduct, formData, setFormData, onSave, onClose }) {
  if (!modalMode) return null;

  return (
    <Modal
      isOpen={!!modalMode}
      onClose={onClose}
      title={modalMode === "add" ? "Create New Product" : `Edit Product: ${selectedProduct?.name}`}
    >
      <form onSubmit={onSave}>
        <div className="form-grid">
          <div className="form-group">
            <label>SKU *</label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Barcode / EAN</label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </div>
          <div className="form-group span-2">
            <label>Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Coca-Cola 500ml Bottle"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Beverages">Beverages</option>
              <option value="Snacks">Snacks</option>
              <option value="Dairy">Dairy</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Household">Household</option>
            </select>
          </div>
          <div className="form-group">
            <label>Brand</label>
            <input
              type="text"
              placeholder="e.g. Coca-Cola, Nestle"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Purchase Cost (₹) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Selling Price (₹) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Tax Rate (%)</label>
            <input
              type="number"
              value={formData.tax}
              onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Min Reorder Threshold</label>
            <input
              type="number"
              value={formData.minimumStockLevel}
              onChange={(e) => setFormData({ ...formData, minimumStockLevel: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          {modalMode === "add" && (
            <div className="form-group">
              <label>Initial Opening Stock</label>
              <input
                type="number"
                min="0"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ marginTop: 20, marginMinusLeft: -24, marginMinusRight: -24 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn">
            {modalMode === "add" ? "Save & Create Product" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
