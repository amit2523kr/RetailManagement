import React, { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { getArray, compact } from "../../utils/formatters.js";
import { Metric } from "../dashboard/KpiCards.jsx";
import { Table } from "../common/DataTable.jsx";
import { AdjustmentModal } from "./AdjustmentModal.jsx";

export function InventoryView({ data, headers, showToast, refreshData }) {
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustQty, setAdjustQty] = useState(10);
  const [adjustType, setAdjustType] = useState("MANUAL_ADJUSTMENT");

  const products = getArray(data.products);
  const movements = getArray(data.movements);

  const totalStockCount = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
  const lowStockCount = products.filter((p) => (p.currentStock || 0) <= (p.minimumStockLevel || p.minStockLevel || 10)).length;

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustProductId) {
      alert("Please select a product");
      return;
    }
    try {
      const res = await fetch("/api/inventory/adjustments", {
        method: "POST",
        headers,
        body: JSON.stringify({
          productId: adjustProductId,
          quantity: parseInt(adjustQty, 10),
          type: adjustType
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Adjustment failed");
      }
      showToast("Stock adjustment logged in inventory ledger!", "success");
      setIsAdjustModalOpen(false);
      refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <section className="kpi-grid">
        <Metric label="Total Stock Units" value={compact(totalStockCount)} caption="Active catalog inventory" />
        <Metric label="Catalog SKUs" value={products.length.toString()} caption="Unique SKUs tracked" />
        <Metric label="Low Stock Items" value={lowStockCount.toString()} caption="Requires reordering" />
        <Metric label="Movements Logged" value={movements.length.toString()} caption="Audit ledger entries" />
      </section>

      <div className="action-bar" style={{ marginTop: 8 }}>
        <button
          className="primary-btn"
          onClick={() => {
            if (products.length > 0) setAdjustProductId(products[0].id);
            setIsAdjustModalOpen(true);
          }}
        >
          <ArrowUpDown size={16} /> Record Stock Adjustment
        </button>
      </div>

      <section className="grid-2">
        <Table
          title="Stock Position & Reorder Thresholds"
          rows={products}
          columns={["name", "currentStock", "minimumStockLevel", "purchasePrice"]}
        />
        <Table
          title="Double-Entry Inventory Ledger"
          rows={movements}
          columns={["type", "productId", "quantity", "createdAt"]}
        />
      </section>

      <AdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        products={products}
        adjustProductId={adjustProductId}
        setAdjustProductId={setAdjustProductId}
        adjustType={adjustType}
        setAdjustType={setAdjustType}
        adjustQty={adjustQty}
        setAdjustQty={setAdjustQty}
        onSubmit={handleStockAdjustment}
      />
    </>
  );
}
