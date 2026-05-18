import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, apiPath, resolveImageUrl } from "../config/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(apiPath("/api/orders"))
      .then((res) => setOrders(res.data))
      .catch(() => setError("Unable to load orders right now."))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const res = await axios.put(apiPath(`/api/orders/${id}/status`), { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? res.data : o)));
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>All Orders</h1>
        <p>{orders.length} order{orders.length !== 1 ? "s" : ""} received</p>
      </div>
      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Loading orders…</h3>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>When customers place orders, they'll appear here.</p>
        </div>
      ) : (
        orders.map((o) => (
          <div className="admin-card" key={o._id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <h3>{o.buyerName}</h3>
                <p style={{ color: "var(--text-light)", fontSize: "0.83rem" }}>{o.buyerEmail}</p>
                {o.buyerPhone && (
                  <p style={{ color: "var(--text-light)", fontSize: "0.83rem" }}>{o.buyerPhone}</p>
                )}
                {o.createdAt && (
                  <p style={{ color: "var(--taupe)", fontSize: "0.78rem", marginTop: 3 }}>
                    {formatDate(o.createdAt)}
                  </p>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ marginBottom: 6 }}>
                  <span
                    className={`status-badge ${
                      o.paymentStatus === "Paid" ? "status-completed" : "status-pending"
                    }`}
                    style={{ marginRight: 6 }}
                  >
                    {o.paymentStatus === "Paid" && o.paymentMethod === "CARD" ? "Pre-paid" : o.paymentStatus === "Paid" ? "Paid" : "Awaiting Payment"}
                  </span>
                  <span
                    className="status-badge"
                    style={{
                      background: "#f0f4ff",
                      border: "1px solid #c0c8ff",
                      color: "#4050a0",
                      marginRight: 6,
                    }}
                  >
                    {o.paymentMethod === "CARD" ? "Card" : "Cash"}
                  </span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <span className="status-badge" style={{ background: "#fffaf0", border: "1px solid #f0d9a6", color: "#8c6a24" }}>
                    {o.status || "Pending"}
                  </span>
                  <select
                    value={o.status || "Pending"}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    style={{ marginLeft: 8, fontSize: "0.78rem", padding: "4px 6px" }}
                    disabled={updatingId === o._id}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Packed">Packed</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", color: "var(--rose)", marginTop: 4 }}>
                  ${o.totalPrice?.toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--blush)", paddingTop: 14 }}>
              {o.buyerAddress && (
                <p style={{ fontSize: "0.85rem", color: "var(--text)", marginBottom: 10 }}>
                  <span style={{ fontWeight: 500 }}>Ship to:</span>{" "}
                  <span style={{ color: "var(--text-light)" }}>
                    {o.buyerCity ? `${o.buyerCity}, ` : ""}{o.buyerAddress}
                  </span>
                </p>
              )}
              {o.reviewRating && (
                <div style={{ marginBottom: 10 }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginBottom: 4 }}>
                    <strong>Review:</strong>{" "}
                    {"★".repeat(o.reviewRating)}{" "}
                    {"☆".repeat(5 - o.reviewRating)}
                  </p>
                  {o.reviewComment && (
                    <p style={{ fontSize: "0.85rem", color: "var(--text)" }}>
                      “{o.reviewComment}”
                    </p>
                  )}
                </div>
              )}
              <p style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 10 }}>Items</p>
              {o.products.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--text)", marginBottom: 6 }}>
                  <span>{p.name} <span style={{ color: "var(--taupe)" }}>× {p.quantity}</span></span>
                  <span style={{ color: "var(--rose)" }}>${(p.price * p.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminOrders;