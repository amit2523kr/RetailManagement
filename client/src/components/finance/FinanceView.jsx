import React, { useState } from "react";
import { CreditCard, Plus, FileText, Printer, X } from "lucide-react";
import { getArray, money } from "../../utils/formatters.js";
import { Metric } from "../dashboard/KpiCards.jsx";
import { PaymentModal } from "./PaymentModal.jsx";
import { ExpenseModal } from "./ExpenseModal.jsx";

export function FinanceView({ data, headers, showToast, refreshData }) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState(null);

  const invoices = getArray(data.invoices);
  const payments = getArray(data.payments);
  const expenses = getArray(data.expenses);
  const customers = getArray(data.customers);
  const suppliers = getArray(data.suppliers);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    type: "CUSTOMER_RECEIPT",
    customerId: customers[0]?.id || "",
    supplierId: suppliers[0]?.id || "",
    invoiceId: "",
    amount: 5000,
    method: "UPI",
    notes: ""
  });

  // Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    category: "Delivery",
    amount: 1500,
    method: "UPI",
    notes: ""
  });

  const totalInvoiced = invoices.reduce((acc, inv) => acc + (inv.total || inv.grandTotal || 0), 0);
  const totalPaid = payments.filter((p) => p.type === "CUSTOMER_RECEIPT").reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netCashFlow = totalPaid - totalExpenses;

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers,
        body: JSON.stringify(paymentForm)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || "Failed to record payment");
      }
      if (showToast) showToast(`Payment of ${money(paymentForm.amount)} recorded successfully!`, "success");
      setIsPaymentModalOpen(false);
      if (refreshData) refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleLogExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers,
        body: JSON.stringify(expenseForm)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || "Failed to log expense");
      }
      if (showToast) showToast(`Operating Expense '${expenseForm.category}' of ${money(expenseForm.amount)} logged!`, "success");
      setIsExpenseModalOpen(false);
      if (refreshData) refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <section className="kpi-grid">
        <Metric label="Total Invoiced Value" value={money(totalInvoiced)} caption="Total sales billing" />
        <Metric label="Customer Payments Received" value={money(totalPaid)} caption="Actual collections" />
        <Metric label="Operating Expenses" value={money(totalExpenses)} caption="Overhead & logistics costs" />
        <Metric label="Net Operating Cashflow" value={money(netCashFlow)} caption="Inflow less expenses" />
      </section>

      <div className="action-bar" style={{ marginTop: 8 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="primary-btn" onClick={() => setIsPaymentModalOpen(true)}>
            <CreditCard size={16} /> Record Payment Transaction
          </button>
          <button className="btn-ghost" onClick={() => setIsExpenseModalOpen(true)}>
            <Plus size={16} style={{ marginRight: 4 }} /> Add Operating Expense
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-title">
          <h2>Sales Invoices & Billing Summary</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Grand Total</th>
              <th>Paid Amount</th>
              <th>Status</th>
              <th>Billing Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const isPaid = inv.status === "PAID";
              return (
                <tr key={inv.id}>
                  <td><code>{inv.id}</code></td>
                  <td><strong>{inv.customerName || inv.customerId}</strong></td>
                  <td><strong>{money(inv.total || inv.grandTotal)}</strong></td>
                  <td>{money(inv.paid || 0)}</td>
                  <td>
                    <span className={`badge ${isPaid ? "badge-green" : "badge-yellow"}`}>
                      {inv.status || "UNPAID"}
                    </span>
                  </td>
                  <td>{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "-"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="icon-btn" title="View Statement" onClick={() => setInvoicePreview(inv)}>
                      <FileText size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="grid-2">
        <div className="table-wrap">
          <div className="table-title">
            <h2>Recent Payments Reconciliation</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Party / Counterpart</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className={`badge ${p.type === "CUSTOMER_RECEIPT" ? "badge-green" : "badge-blue"}`}>
                      {p.type === "CUSTOMER_RECEIPT" ? "Receipt" : "Payment"}
                    </span>
                  </td>
                  <td>{p.customerName || p.supplierName || p.partyName || "-"}</td>
                  <td><strong>{money(p.amount)}</strong></td>
                  <td><code>{p.method}</code></td>
                  <td>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-wrap">
          <div className="table-title">
            <h2>Operating Expenses Breakdown</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Notes</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td><span className="badge badge-yellow">{e.category}</span></td>
                  <td><strong>{money(e.amount)}</strong></td>
                  <td><code>{e.method || "UPI"}</code></td>
                  <td>{e.notes || "-"}</td>
                  <td>{e.spentAt ? new Date(e.spentAt).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        customers={customers}
        suppliers={suppliers}
        invoices={invoices}
        onSubmit={handleRecordPayment}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        onSubmit={handleLogExpense}
      />

      {/* VIEW INVOICE PREVIEW MODAL */}
      {invoicePreview && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3>Invoice: {invoicePreview.id}</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="primary-btn" onClick={() => window.print()}>
                  <Printer size={15} style={{ marginRight: 4 }} /> Print
                </button>
                <button className="icon-btn" onClick={() => setInvoicePreview(null)}><X size={18} /></button>
              </div>
            </div>
            <div className="modal-body" style={{ background: "white", padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid var(--line)", paddingBottom: 12, marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, color: "var(--accent)" }}>RetailOps Distribution Ltd</h3>
                  <p style={{ margin: "2px 0", fontSize: 12, color: "var(--muted)" }}>GSTIN: 07AAAAA1234A1Z5</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h4 style={{ margin: 0 }}>INVOICE #{invoicePreview.id}</h4>
                  <p style={{ margin: "2px 0", fontSize: 12 }}>Status: <strong>{invoicePreview.status || "UNPAID"}</strong></p>
                </div>
              </div>

              <p style={{ fontSize: 13, margin: "0 0 12px" }}>
                <strong>Customer:</strong> {invoicePreview.customerName || invoicePreview.customerId}
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", background: "var(--surface-hover)", padding: 12, borderRadius: 8, marginTop: 16 }}>
                <span>Grand Total: <strong>{money(invoicePreview.total)}</strong></span>
                <span>Amount Paid: <strong style={{ color: "var(--accent)" }}>{money(invoicePreview.paid || 0)}</strong></span>
                <span>Balance Due: <strong style={{ color: "var(--accent-2)" }}>{money((invoicePreview.total || 0) - (invoicePreview.paid || 0))}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
