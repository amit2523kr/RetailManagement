import React from "react";
import { Modal } from "../common/Modal.jsx";

export function CustomerModal({
  isOpen,
  onClose,
  modalMode,
  selectedCustomer,
  formData,
  setFormData,
  onSave
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalMode === "add" ? "Add New Customer Master" : `Edit Customer: ${selectedCustomer?.name}`}
    >
      <form onSubmit={onSave}>
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Full Customer / Contact Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Business / Store Name</label>
            <input
              type="text"
              placeholder="e.g. Metro Hypermarket, QuickBasket"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="e.g. +91 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="e.g. billing@metrohyper.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>GSTIN (15 characters)</label>
            <input
              type="text"
              placeholder="e.g. 07AAAAA1234A1Z5"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="form-group span-2">
            <label>Approved Credit Limit (₹) *</label>
            <input
              type="number"
              min="0"
              required
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group span-2">
            <label>Billing & Shipping Address</label>
            <input
              type="text"
              placeholder="Full street address, city, pin code..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn">
            {modalMode === "add" ? "Create Customer Master" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
