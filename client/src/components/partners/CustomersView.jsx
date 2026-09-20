import React, { useState } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { getArray, money } from "../../utils/formatters.js";
import { Metric } from "../dashboard/KpiCards.jsx";
import { CustomerModal } from "./CustomerModal.jsx";

export function CustomersView({ data, headers, showToast, refreshData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    gstin: "",
    creditLimit: 50000,
    address: ""
  });

  const customers = getArray(data.customers);

  const filtered = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.businessName && c.businessName.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.gstin && c.gstin.toLowerCase().includes(q))
    );
  });

  const totalOutstanding = customers.reduce((acc, c) => acc + (c.outstanding || 0), 0);
  const highRiskCustomers = customers.filter((c) => (c.outstanding || 0) > (c.creditLimit || 50000) * 0.8).length;

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      businessName: "",
      email: "",
      phone: "",
      gstin: "",
      creditLimit: 50000,
      address: ""
    });
    setModalMode("add");
  };

  const handleOpenEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || "",
      businessName: customer.businessName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      gstin: customer.gstin || "",
      creditLimit: customer.creditLimit !== undefined ? customer.creditLimit : 50000,
      address: customer.address || ""
    });
    setModalMode("edit");
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      const url = modalMode === "add" ? "/api/customers" : `/api/customers/${selectedCustomer.id || selectedCustomer._id}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.message || result.error || `Failed to ${modalMode} customer`);
      }

      showToast(`Customer '${formData.name}' ${modalMode === "add" ? "created" : "updated"} successfully!`, "success");
      setModalMode(null);
      refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete customer '${customer.name}'?`)) return;

    try {
      const res = await fetch(`/api/customers/${customer.id || customer._id}`, {
        method: "DELETE",
        headers
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.message || result.error || "Failed to delete customer");
      }

      showToast(`Customer '${customer.name}' deleted.`, "success");
      refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <section className="kpi-grid">
        <Metric label="Total Customers" value={customers.length.toString()} caption="Registered trade accounts" />
        <Metric label="Total Receivables" value={money(totalOutstanding)} caption="Customer balance outstanding" />
        <Metric label="High Utilization Risk" value={highRiskCustomers.toString()} caption=">80% credit limit used" />
      </section>

      <div className="action-bar" style={{ marginTop: 8 }}>
        <div className="search-box">
          <Search size={16} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search customers, store names, phones, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={handleOpenAdd}>
          <Plus size={16} /> Add New Customer
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-title">
          <h2>Customer Directory & Receivables Master ({filtered.length})</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Business / Store</th>
              <th>Contact Details</th>
              <th>GSTIN</th>
              <th>Approved Credit Limit</th>
              <th>Current Outstanding</th>
              <th>Credit Risk</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const outstanding = c.outstanding || 0;
              const limit = c.creditLimit || 50000;
              const pctUsed = Math.round((outstanding / limit) * 100);
              const isHigh = pctUsed > 80;

              return (
                <tr key={c.id || c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.businessName || "-"}</td>
                  <td>
                    <span>{c.phone || "-"}</span>
                    {c.email && <small style={{ display: "block", color: "var(--muted)" }}>{c.email}</small>}
                  </td>
                  <td><code>{c.gstin || "-"}</code></td>
                  <td>{money(limit)}</td>
                  <td><strong style={{ color: outstanding > 0 ? "var(--accent-2)" : "var(--ink)" }}>{money(outstanding)}</strong></td>
                  <td>
                    <span className={`badge ${isHigh ? "badge-red" : outstanding > 0 ? "badge-yellow" : "badge-green"}`}>
                      {pctUsed}% Limit Used
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row-actions">
                      <button className="icon-btn" title="Edit Customer" onClick={() => handleOpenEdit(c)}>
                        <Edit2 size={15} />
                      </button>
                      <button className="icon-btn delete" title="Delete Customer" onClick={() => handleDeleteCustomer(c)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <CustomerModal
        isOpen={!!modalMode}
        onClose={() => setModalMode(null)}
        modalMode={modalMode}
        selectedCustomer={selectedCustomer}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveCustomer}
      />
    </>
  );
}
