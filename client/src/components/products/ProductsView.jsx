import React, { useState } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { getArray, money } from "../../utils/formatters.js";
import { ProductModal } from "./ProductModal.jsx";

export function ProductsView({ data, headers, showToast, refreshData }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    name: "",
    category: "Beverages",
    brand: "",
    unit: "PCS",
    purchasePrice: 20,
    sellingPrice: 30,
    tax: 18,
    minimumStockLevel: 20,
    currentStock: 50,
    description: ""
  });

  const products = getArray(data.products);

  const filtered = products.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setFormData({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      name: "",
      category: "Beverages",
      brand: "",
      unit: "PCS",
      purchasePrice: 25,
      sellingPrice: 35,
      tax: 18,
      minimumStockLevel: 20,
      currentStock: 100,
      description: ""
    });
    setModalMode("add");
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      sku: product.sku || "",
      barcode: product.barcode || "",
      name: product.name || "",
      category: product.category || "Beverages",
      brand: product.brand || "",
      unit: product.unit || "PCS",
      purchasePrice: product.purchasePrice || 0,
      sellingPrice: product.sellingPrice || 0,
      tax: product.tax || 18,
      minimumStockLevel: product.minimumStockLevel || 10,
      currentStock: product.currentStock || 0,
      description: product.description || ""
    });
    setModalMode("edit");
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = modalMode === "add" ? "/api/products" : `/api/products/${selectedProduct.id || selectedProduct._id}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to ${modalMode} product`);
      }

      showToast(`Product '${formData.name}' ${modalMode === "add" ? "created" : "updated"} successfully!`, "success");
      setModalMode(null);
      refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete product '${product.name}' (${product.sku})?`)) return;

    try {
      const res = await fetch(`/api/products/${product.id || product._id}`, {
        method: "DELETE",
        headers
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete product");
      }

      showToast(`Product '${product.name}' deleted.`, "success");
      refreshData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
      <div className="action-bar">
        <div className="search-box">
          <Search size={16} color="var(--muted)" />
          <input
            type="text"
            placeholder="Search SKUs, names, brands, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="primary-btn" onClick={handleOpenAdd}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Products Catalog ({filtered.length})</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Purchase</th>
              <th>Selling</th>
              <th>Margin</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((prod) => {
              const margin = prod.sellingPrice > 0 ? Math.round(((prod.sellingPrice - prod.purchasePrice) / prod.sellingPrice) * 100) : 0;
              const isLow = (prod.currentStock || 0) <= (prod.minimumStockLevel || 10);
              const isOut = (prod.currentStock || 0) === 0;

              return (
                <tr key={prod.id || prod.sku}>
                  <td><code>{prod.sku}</code></td>
                  <td>
                    <strong>{prod.name}</strong>
                    {prod.barcode && <small style={{ display: "block", color: "var(--muted)" }}>UPC: {prod.barcode}</small>}
                  </td>
                  <td>{prod.category}</td>
                  <td>{prod.brand || "-"}</td>
                  <td>{money(prod.purchasePrice)}</td>
                  <td><strong>{money(prod.sellingPrice)}</strong></td>
                  <td><span className="badge badge-blue">{margin}%</span></td>
                  <td>
                    <span className={`badge ${isOut ? "badge-red" : isLow ? "badge-yellow" : "badge-green"}`}>
                      {prod.currentStock} {prod.unit || "PCS"}
                    </span>
                  </td>
                  <td><span className="status-pill active">{prod.status || "ACTIVE"}</span></td>
                  <td style={{ textAlign: "right" }}>
                    <div className="row-actions">
                      <button className="icon-btn" title="Edit Product" onClick={() => handleOpenEdit(prod)}>
                        <Edit2 size={15} />
                      </button>
                      <button className="icon-btn delete" title="Delete Product" onClick={() => handleDeleteProduct(prod)}>
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

      <ProductModal
        modalMode={modalMode}
        selectedProduct={selectedProduct}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveProduct}
        onClose={() => setModalMode(null)}
      />
    </>
  );
}
