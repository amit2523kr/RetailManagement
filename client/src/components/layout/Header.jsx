import React from "react";
import { Search, RefreshCw, Menu } from "lucide-react";

export function Header({
  activeView,
  range,
  setRange,
  refreshData,
  onOpenCommandPalette,
  onToggleMobileSidebar
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1>{activeView.label}</h1>
          <p className="topbar-subtitle">{activeView.subtitle}</p>
        </div>
      </div>

      <div className="topbar-center">
        <button
          className="spotlight-btn"
          onClick={onOpenCommandPalette}
          title="Press ⌘K or Ctrl+K to search"
        >
          <div className="spotlight-text">
            <Search size={14} />
            <span>Search products, orders, partners...</span>
          </div>
          <kbd className="spotlight-kbd">⌘K</kbd>
        </button>
      </div>

      <div className="filters">
        <select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Select date range">
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7">Last 7 days</option>
          <option value="last30">Last 30 days</option>
          <option value="thisMonth">This month</option>
          <option value="lastMonth">Last month</option>
          <option value="thisQuarter">This quarter</option>
          <option value="thisYear">This year</option>
        </select>
        <button onClick={refreshData} className="refresh-btn">
          <RefreshCw size={14} /> <span className="btn-label">Refresh</span>
        </button>
      </div>
    </header>
  );
}
