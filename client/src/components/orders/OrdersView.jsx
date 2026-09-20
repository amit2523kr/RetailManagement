import React, { useState } from "react";
import { Plus, ShoppingCart, Store, FileText, PackageCheck, Printer, X } from "lucide-react";
import { getArray, money } from "../../utils/formatters.js";
import { SalesOrderModal } from "./SalesOrderModal.jsx";
import { PurchaseOrderModal } from "./PurchaseOrderModal.jsx";
import { ReceiptModal } from "./ReceiptModal.jsx";

export function OrdersView({ data, headers, showToast, refreshData }) {
  const [activeTab, setActiveTab] = useState("sales");
  const [isNewSoModalOpen, setIsNewSoModalOpen] = useState(false);
  const [isNewPoModalOpen, setIsNewPoModalOpen] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);

  const salesOrders = getArray(data.sales);
  const purchaseOrders = getArray(data.purchases);
  const products = getArray(data.products);
  const customers = getArray(data.customers);
  const suppliers = getArray(data.suppliers);
  const channels = getArray(data.channels);

  // Sales Order Form State
  const [soForm, setSoForm] = useState({
    customerId: customers[0]?.id || "",
    channelId: "chn_direct",
    items: [{ productId: products[0]?.id || "", quantity: 10, unitPrice: products[0]?.sellingPrice || 40, tax: 18 }],
    notes: ""
  });

  // Purchase Order Form State
  const [poForm, setPoForm] = useState({
    supplierId: suppliers[0]?.id || "",
    items: [{ productId: products[0]?.id || "", quantity: 50, unitPrice: products[0]?.purchasePrice || 25, tax: 18 }],
    notes: ""
  });

  const handleCreateSalesOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/sales-orders", {
        method: "POST",
        headers,
        body: JSON.stringify(soForm)
      });
      let result = {};
      try {
        result = await res.json();
      } catch (e) {
        result = {};
      }
      if (!res.ok) {
        throw new Error(result.message || result.error || `Server error (${res.status})`);
      }
      showToast(`Sales Order created & Invoice generated! Total: ${money(result.salesOrder?.total)}`, "success");
      setIsNewSoModalOpen(false);
      refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleCreatePurchaseOrder = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers,
        body: JSON.stringify(poForm)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.error || "Failed to create Purchase Order");
      }
      showToast(`Purchase Order issued to ${result.purchaseOrder?.supplierName || "supplier"}!`, "success");
      setIsNewPoModalOpen(false);
      refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleReceivePurchaseOrder = async (po) => {
    if (!window.confirm(`Receive stock inventory for Purchase Order '${po.id}'?`)) return;
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}/receive`, {
        method: "POST",
        headers
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to receive PO");
      }
      showToast(`Stock received and updated into inventory for PO '${po.id}'!`, "success");
      refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <div className="tab-bar">
        <button className={activeTab === "sales" ? "active" : ""} onClick={() => setActiveTab("sales")}>
          <ShoppingCart size={15} style={{ marginRight: 6 }} /> Sales Orders ({salesOrders.length})
        </button>
        <button className={activeTab === "purchases" ? "active" : ""} onClick={() => setActiveTab("purchases")}>
          <Store size={15} style={{ marginRight: 6 }} /> Supplier Purchase Orders ({purchaseOrders.length})
        </button>
      </div>

      <div className="action-bar" style={{ marginTop: 8 }}>
        {activeTab === "sales" ? (
          <button className="primary-btn" onClick={() => {
            if (customers.length > 0 && products.length > 0) {
              setSoForm({
                customerId: customers[0].id,
                channelId: "chn_direct",
                items: [{ productId: products[0].id, quantity: 5, unitPrice: products[0].sellingPrice, tax: products[0].tax || 18 }],
                notes: ""
              });
            }
            setIsNewSoModalOpen(true);
          }}>
            <Plus size={16} /> Create POS / Sales Order
          </button>
        ) : (
          <button className="primary-btn" onClick={() => {
            if (suppliers.length > 0 && products.length > 0) {
              setPoForm({
                supplierId: suppliers[0].id,
                items: [{ productId: products[0].id, quantity: 50, unitPrice: products[0].purchasePrice, tax: products[0].tax || 18 }],
                notes: ""
              });
            }
            setIsNewPoModalOpen(true);
          }}>
            <Plus size={16} /> Issue Supplier Purchase Order
          </button>
        )}
      </div>

      {activeTab === "sales" ? (
        <div className="table-wrap">
          <div className="table-title">
            <h2>Sales Orders Ledger</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Channel</th>
                <th>Date</th>
                <th>Status</th>
                <th>Grand Total</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salesOrders.map((so) => (
                <tr key={so.id}>
                  <td><code>{so.id}</code></td>
                  <td><strong>{so.customerName || so.customerId}</strong></td>
                  <td><span className="badge badge-blue">{so.channelId || "Direct"}</span></td>
                  <td>{so.orderedAt ? new Date(so.orderedAt).toLocaleDateString() : "-"}</td>
                  <td><span className="badge badge-green">{so.status || "COMPLETED"}</span></td>
                  <td><strong>{money(so.total)}</strong></td>
                  <td style={{ textAlign: "right" }}>
                    <button className="icon-btn" title="View GST Invoice" onClick={() => setInvoicePreview(so)}>
                      <FileText size={15} style={{ marginRight: 4 }} /> Invoice
                    </button>
                    <button className="icon-btn" title="Print Thermal POS Receipt" style={{ marginLeft: 6 }} onClick={() => setReceiptOrder(so)}>
                      <Printer size={15} style={{ marginRight: 4 }} /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-title">
            <h2>Supplier Purchase Orders Ledger</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>PO ID</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Items Count</th>
                <th>Total Value</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id}>
                  <td><code>{po.id}</code></td>
                  <td><strong>{po.supplierName || po.supplierId}</strong></td>
                  <td>
                    <span className={`badge ${po.status === "RECEIVED" ? "badge-green" : "badge-yellow"}`}>
                      {po.status || "ORDERED"}
                    </span>
                  </td>
                  <td>{po.orderedAt ? new Date(po.orderedAt).toLocaleDateString() : "-"}</td>
                  <td>{po.lines?.length || 1} lines</td>
                  <td><strong>{money(po.total)}</strong></td>
                  <td style={{ textAlign: "right" }}>
                    {po.status !== "RECEIVED" ? (
                      <button className="primary-btn" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => handleReceivePurchaseOrder(po)}>
                        <PackageCheck size={14} style={{ marginRight: 4 }} /> Receive Goods
                      </button>
                    ) : (
                      <span className="status-pill active">Stock Received</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SalesOrderModal
        isOpen={isNewSoModalOpen}
        onClose={() => setIsNewSoModalOpen(false)}
        soForm={soForm}
        setSoForm={setSoForm}
        customers={customers}
        products={products}
        onSubmit={handleCreateSalesOrder}
      />

      <PurchaseOrderModal
        isOpen={isNewPoModalOpen}
        onClose={() => setIsNewPoModalOpen(false)}
        poForm={poForm}
        setPoForm={setPoForm}
        suppliers={suppliers}
        products={products}
        onSubmit={handleCreatePurchaseOrder}
      />

      {/* PRINTABLE GST INVOICE MODAL */}
      {invoicePreview && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: 750 }}>
            <div className="modal-header">
              <h3>Tax Invoice: {invoicePreview.id}</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="primary-btn" onClick={() => window.print()}>
                  <Printer size={15} style={{ marginRight: 4 }} /> Print Invoice
                </button>
                <button className="icon-btn" onClick={() => setInvoicePreview(null)}><X size={18} /></button>
              </div>
            </div>
            <div className="modal-body" style={{ background: "white", padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid var(--line)", paddingBottom: 16, marginBottom: 20 }}>
                <div>
                  <h2 style={{ margin: 0, color: "var(--accent)" }}>RetailOps Distribution Ltd</h2>
                  <p style={{ margin: "4px 0", fontSize: 13, color: "var(--muted)" }}>GSTIN: 07AAAAA1234A1Z5 · DL No: DL-2026-991</p>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>Industrial Area, New Delhi - 110020</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h3 style={{ margin: 0 }}>TAX INVOICE</h3>
                  <p style={{ margin: "4px 0", fontSize: 13 }}><strong>Invoice #:</strong> {invoicePreview.id}</p>
                  <p style={{ margin: 0, fontSize: 13 }}><strong>Date:</strong> {invoicePreview.orderedAt ? new Date(invoicePreview.orderedAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div style={{ background: "var(--surface-hover)", padding: 14, borderRadius: 8, marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 13 }}><strong>Billed To:</strong> {invoicePreview.customerName || invoicePreview.customerId}</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>Payment Terms: Net 15 Days · Channel: {invoicePreview.channelId?.toUpperCase() || "STORE"}</p>
              </div>

              <table style={{ width: "100%", marginBottom: 20 }}>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Tax %</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoicePreview.lines || [{ productName: "Retail Line Item", quantity: 1, unitPrice: invoicePreview.total || 1000, tax: 18 }]).map((line, idx) => (
                    <tr key={idx}>
                      <td><strong>{line.productName || line.productId}</strong></td>
                      <td>{line.quantity}</td>
                      <td>{money(line.unitPrice)}</td>
                      <td>{line.tax || 18}%</td>
                      <td style={{ textAlign: "right" }}>{money(line.lineTotal || (line.quantity * line.unitPrice))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: 280, display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span>Subtotal:</span>
                    <strong>{money(invoicePreview.subtotal || invoicePreview.total * 0.82)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span>GST (Tax Total):</span>
                    <strong>{money(invoicePreview.tax || invoicePreview.total * 0.18)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, borderTop: "2px solid var(--line)", paddingTop: 8, color: "var(--accent)" }}>
                    <strong>Grand Total:</strong>
                    <strong>{money(invoicePreview.total)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReceiptModal
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
        order={receiptOrder}
      />
    </>
  );
}
