import React, { useState } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { getArray, money } from "../../utils/formatters.js";
import { Metric } from "../dashboard/KpiCards.jsx";
import { SupplierModal } from "./SupplierModal.jsx";

export function SuppliersView({ data, headers, showToast, refreshData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    contact: "",
    email: "",
    gstin: "",
    paymentTerms: "Net 30",
    address: ""
  });

  const suppliers = getArray(data.suppliers);

  const filtered = suppliers.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.companyName && s.companyName.toLowerCase().includes(q)) ||
      (s.contact && s.contact.toLowerCase().includes(q)) ||
      (s.gstin && s.gstin.toLowerCase().includes(q))
    );
  });

  const totalPayables = suppliers.reduce((acc, s) => acc + (s.outstanding || 0), 0);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      companyName: "",
      contact: "",
      email: "",
      gstin: "",
      paymentTerms: "Net 30",
      address: ""
    });
    setModalMode("add");
  };

  const handleOpenEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name || "",
      companyName: supplier.companyName || "",
      contact: supplier.contact || "",
      email: supplier.email || "",
      gstin: supplier.gstin || "",
      paymentTerms: supplier.paymentTerms || "Net 30",
      address: supplier.address || ""
    });
    setModalMode("edit");
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    try {
      const url = modalMode === "add" ? "/api/suppliers" : `/api/suppliers/${selectedSupplier.id || selectedSupplier._id}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.message || result.error || `Failed to ${modalMode} supplier`);
      }

      showToast(`Supplier '${formData.name}' ${modalMode === "add" ? "created" : "updated"} successfully!`, "success");
      setModalMode(null);
      refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteSupplier = async (supplier) => {
    if (!window.confirm(`Are you sure you want to delete supplier '${supplier.name}'?`)) return;

    try {
      const res = await fetch(`/api/suppliers/${supplier.id || supplier._id}`, {
        method: "DELETE",
        headers
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(result.message || result.error || "Failed to delete supplier");
      }

      showToast(`Supplier '${supplier.name}' deleted.`, "success");
      refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <section className="kpi-grid">
        <Metric label="Total Suppliers" value={suppliers.length.toString()} caption="Active vendor vendors" />
        <Metric label="Total Payables" value={money(totalPayables)} caption="Outstanding vendor balance" />
        <Metric label="Payment Terms" value="Net 30 Avg" caption="Standard procurement terms" />
      </section>

      <div className="action-bar" style={{ marginTop: 8 }}>
        <div className="search-box">
          <Search size={16} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search suppliers, contacts, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={handleOpenAdd}>
          <Plus size={16} /> Add New Supplier
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-title">
          <h2>Supplier Directory & Payables Master ({filtered.length})</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>GSTIN</th>
              <th>Payment Terms</th>
              <th>Outstanding Payable</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const outstanding = s.outstanding || 0;
              return (
                <tr key={s.id || s._id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.contact || "-"}</td>
                  <td>{s.email || "-"}</td>
                  <td><code>{s.gstin || "-"}</code></td>
                  <td><span className="badge badge-blue">{s.paymentTerms || "Net 30"}</span></td>
                  <td><strong style={{ color: outstanding > 0 ? "var(--accent-2)" : "var(--ink)" }}>{money(outstanding)}</strong></td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row-actions">
                      <button className="icon-btn" title="Edit Supplier" onClick={() => handleOpenEdit(s)}>
                        <Edit2 size={15} />
                      </button>
                      <button className="icon-btn delete" title="Delete Supplier" onClick={() => handleDeleteSupplier(s)}>
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

      <SupplierModal
        isOpen={!!modalMode}
        onClose={() => setModalMode(null)}
        modalMode={modalMode}
        selectedSupplier={selectedSupplier}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveSupplier}
      />
    </>
  );
}
