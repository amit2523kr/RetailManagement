import React, { useState } from "react";
import { Search, Plus, RotateCcw } from "lucide-react";
import { getArray, money, formatDate } from "../../utils/formatters.js";
import { Metric } from "../dashboard/KpiCards.jsx";
import { ReturnModal } from "./ReturnModal.jsx";

export function ReturnsView({ data, headers, showToast, refreshData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    salesOrderId: "",
    customerId: "",
    productId: "",
    quantity: 1,
    reason: "DAMAGED_GOODS",
    action: "RESTOCK",
    refundAmount: 0,
    notes: ""
  });

  const returns = getArray(data.returns);
  const salesOrders = getArray(data.sales);
  const products = getArray(data.products);
  const customers = getArray(data.customers);

  const filtered = returns.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      (r.id && r.id.toLowerCase().includes(q)) ||
      (r.salesOrderId && r.salesOrderId.toLowerCase().includes(q)) ||
      (r.customerName && r.customerName.toLowerCase().includes(q)) ||
      (r.productName && r.productName.toLowerCase().includes(q)) ||
      (r.reason && r.reason.toLowerCase().includes(q))
    );
  });

  const totalRefunds = returns.reduce((acc, r) => acc + (r.refundAmount || 0), 0);
  const restockedCount = returns.filter((r) => r.action === "RESTOCK").length;
  const scrappedCount = returns.filter((r) => r.action === "SCRAP").length;

  const handleOpenModal = () => {
    setFormData({
      salesOrderId: salesOrders[0]?.id || "",
      customerId: customers[0]?.id || "",
      productId: products[0]?.id || "",
      quantity: 1,
      reason: "DAMAGED_GOODS",
      action: "RESTOCK",
      refundAmount: 0,
      notes: ""
    });
    setIsModalOpen(true);
  };

  const handleSaveReturn = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers,
        body: JSON.stringify(formData)
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.message || result.error || "Failed to process customer return");
      }

      showToast(`Return '${result.id || "processed"}' completed successfully!`, "success");
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <section className="kpi-grid">
        <Metric label="Total RMA Returns" value={returns.length.toString()} caption="Completed return orders" />
        <Metric label="Total Credit Refunded" value={money(totalRefunds)} caption="Adjusted from customer balances" />
        <Metric label="Restocked vs Scrapped" value={`${restockedCount} / ${scrappedCount}`} caption="Restocked to stock vs Written off" />
      </section>

      <div className="action-bar" style={{ marginTop: 8 }}>
        <div className="search-box">
          <Search size={16} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search return ID, order, customer, product, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={handleOpenModal}>
          <RotateCcw size={16} /> Process Customer Return (RMA)
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-title">
          <h2>Customer Returns & Restock Ledger ({filtered.length})</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Return ID</th>
              <th>Sales Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty Returned</th>
              <th>Reason</th>
              <th>Disposition</th>
              <th>Refund Amount</th>
              <th>Processed Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", color: "var(--muted)", padding: "24px" }}>
                  No customer returns recorded yet. Click "Process Customer Return (RMA)" to process a return.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id || r._id}>
                  <td><code>{r.id}</code></td>
                  <td><code>{r.salesOrderId}</code></td>
                  <td><strong>{r.customerName}</strong></td>
                  <td>{r.productName}</td>
                  <td><strong>{r.quantity}</strong></td>
                  <td>
                    <span className="badge badge-gray" style={{ textTransform: "capitalize" }}>
                      {(r.reason || "OTHER").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${r.action === "RESTOCK" ? "badge-green" : "badge-red"}`}>
                      {r.action === "RESTOCK" ? "RESTOCKED (+ STOCK)" : "SCRAPPED (- LOSS)"}
                    </span>
                  </td>
                  <td><strong style={{ color: "var(--accent-2)" }}>{money(r.refundAmount || 0)}</strong></td>
                  <td>{formatDate(r.returnedAt || r.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ReturnModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveReturn}
        salesOrders={salesOrders}
        products={products}
        customers={customers}
      />
    </>
  );
}
