import React from "react";
import { Modal } from "../common/Modal.jsx";

export function ExpenseModal({
  isOpen,
  onClose,
  expenseForm,
  setExpenseForm,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Operating Expense">
      <form onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Expense Category *</label>
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            >
              <option value="Delivery">Delivery & Logistics</option>
              <option value="Utilities">Electricity & Utilities</option>
              <option value="Rent">Warehouse / Store Rent</option>
              <option value="Salary">Staff Salaries</option>
              <option value="Packaging">Packaging Materials</option>
              <option value="Marketing">Marketing & Ads</option>
              <option value="Maintenance">Maintenance & Repairs</option>
              <option value="Other">Other Operating Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount (₹) *</label>
            <input
              type="number"
              min="1"
              required
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              value={expenseForm.method}
              onChange={(e) => setExpenseForm({ ...expenseForm, method: e.target.value })}
            >
              <option value="UPI">UPI</option>
              <option value="BANK">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description / Notes</label>
            <input
              type="text"
              placeholder="e.g. Monthly electricity bill..."
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: 20 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-btn">Commit Expense</button>
        </div>
      </form>
    </Modal>
  );
}
