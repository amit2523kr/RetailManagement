export function getArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (Array.isArray(val.data)) return val.data;
  if (Array.isArray(val.products)) return val.products;
  return [];
}

export function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

export function compact(value) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value || 0);
}

export function formatHeaderLabel(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

export function renderTableCell(value, columnName) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";

  const lower = columnName.toLowerCase();
  if (
    lower.includes("price") ||
    lower.includes("total") ||
    lower.includes("amount") ||
    lower.includes("paid")
  ) {
    return money(value);
  }

  return String(value);
}

export function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch (e) {
    return String(dateString);
  }
}
