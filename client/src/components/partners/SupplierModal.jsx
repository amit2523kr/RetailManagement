import React from "react";
import { Modal } from "../common/Modal.jsx";

export function SupplierModal({
  isOpen,
  onClose,
  modalMode,
  selectedSupplier,
  formData,
  setFormData,
  onSave
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalMode === "add" ? "Add New Supplier Master" : `Edit Supplier: ${selectedSupplier?.name}`}
    >
      <form onSubmit={onSave}>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Supplier / Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Amul Dairy Federation, PepsiCo India"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Primary Contact Person</label>
            <input
              type="text"
              placeholder="e.g. Vikram Malhotra"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. orders@amuldairy.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>GSTIN (15 characters)</label>
            <input
              type="text"
              placeholder="e.g. 24AAAAA1234A1Z5"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="form-group">
            <label>Default Payment Terms</label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            >
              <option value="Net 7">Net 7 Days</option>
              <option value="Net 15">Net 15 Days</option>
              <option value="Net 30">Net 30 Days</option>
              <option value="Net 60">Net 60 Days</option>
              <option value="COD">Cash on Delivery (COD)</option>
            </select>
          </div>

          <div className="form-group span-2">
            <label>Office / Warehouse Address</label>
            <input
              type="text"
              placeholder="Full dispatch address..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn">
            {modalMode === "add" ? "Create Supplier Master" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
