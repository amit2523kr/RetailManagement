import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { VIEWS, DEMO_TOKENS } from "../../utils/constants.js";

export function Sidebar({ token, setToken, view, setView, me, isOpen, onClose }) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleSelectView = (id) => {
    setView(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="mark">R</span>
            <div>
              <strong>RetailOps</strong>
              <small>Distribution Command</small>
            </div>
          </div>
          <button className="mobile-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav>
          {VIEWS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={view === item.id ? "active" : ""}
                onClick={() => handleSelectView(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="actor-card" onClick={() => setShowRoleMenu(!showRoleMenu)}>
          <div className="actor-info">
            <div className="actor-avatar">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                alt="Avatar"
              />
            </div>
            <div className="actor-details">
              <strong>{me?.user?.name || "Asha Rao"}</strong>
              <small>{(me?.user?.role || "SUPER_ADMIN").replaceAll("_", " ")}</small>
            </div>
          </div>
          <ChevronDown size={14} style={{ color: "var(--muted)" }} />

          {showRoleMenu && (
            <div
              style={{
                position: "absolute",
                bottom: "110%",
                left: 0,
                right: 0,
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                padding: 6,
                zIndex: 100
              }}
            >
              {DEMO_TOKENS.map((r) => (
                <div
                  key={r.token}
                  style={{
                    padding: "6px 10px",
                    fontSize: 12,
                    borderRadius: 6,
                    cursor: "pointer",
                    background: token === r.token ? "#e0f2fe" : "transparent"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setToken(r.token);
                    setShowRoleMenu(false);
                    if (onClose) onClose();
                  }}
                >
                  {r.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
