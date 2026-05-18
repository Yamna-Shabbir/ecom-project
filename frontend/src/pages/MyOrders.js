import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, apiPath, resolveImageUrl } from "../config/api";
import SeoHead from "../components/SeoHead";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [trackingMap, setTrackingMap] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      setLoading(false);
      return;
    }
    axios
      .get(apiPath("/api/orders/mine"), { params: { email } })
      .then((res) => setOrders(res.data))
      .catch(() => setError("Unable to load your orders right now."))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const updateDraft = (id, changes) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [id]: { rating: 5, comment: "", ...prev[id], ...changes },
    }));
  };

  const submitReview = async (orderId) => {
    const draft = reviewDrafts[orderId] || {};
    if (!draft.rating) {
      alert("Please select a rating.");
      return;
    }
    try {
      const res = await axios.put(apiPath(`/api/orders/${orderId}/review`), {
        reviewRating: draft.rating,
        reviewComment: draft.comment || "",
      });
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)));
    } catch (err) {
      alert("Failed to submit review.");
    }
  };

  const fetchTracking = async (orderId) => {
    try {
      const res = await axios.get(apiPath(`/api/orders/${orderId}/tracking`));
      setTrackingMap((prev) => ({ ...prev, [orderId]: res.data.timeline || [] }));
    } catch (err) {
      alert("Unable to fetch tracking timeline.");
    }
  };

  return (
    <div className="page">
      <SeoHead title="My Orders | Gulkaar" description="Track your order status and history." keywords="orders,tracking,history" />
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track your past purchases and their status.</p>
      </div>
      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Loading your orders…</h3>
        </div>
      ) : !orders.length ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Once you place an order, it will show up here.</p>
        </div>
      ) : (
        orders.map((o) => (
          <div className="admin-card" key={o._id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <h3>Order #{o._id.slice(-6)}</h3>
                {o.createdAt && (
                  <p style={{ color: "var(--taupe)", fontSize: "0.8rem", marginTop: 4 }}>
                    {formatDate(o.createdAt)}
                  </p>
                )}
                {o.buyerAddress && (
                  <p style={{ color: "var(--text-light)", fontSize: "0.83rem", marginTop: 4 }}>
                    <span style={{ fontWeight: 500 }}>Delivery:</span>{" "}
                    {o.buyerCity ? `${o.buyerCity}, ` : ""}{o.buyerAddress}
                  </p>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ marginBottom: 4 }}>
                  <span
                    className={`status-badge ${
                      o.paymentStatus === "Paid" ? "status-completed" : "status-pending"
                    }`}
                    style={{ marginRight: 6 }}
                  >
                    {o.paymentStatus === "Paid" ? "Paid" : "Awaiting Payment"}
                  </span>
                  <span className="status-badge" style={{ background: "#fffaf0", border: "1px solid #f0d9a6", color: "#8c6a24" }}>
                    {o.status || "Pending"}
                  </span>
                </div>
                <button className="btn-ghost" style={{ marginTop: 6 }} onClick={() => fetchTracking(o._id)}>
                  Track Order
                </button>
                <div
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "1.4rem",
                    color: "var(--rose)",
                    marginTop: 6,
                  }}
                >
                  ${o.totalPrice?.toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--blush)", paddingTop: 12 }}>
              {trackingMap[o._id]?.length > 0 && (
                <div style={{ marginBottom: 12, background: "#fff", border: "1px solid var(--blush)", padding: 10, borderRadius: 8 }}>
                  <p style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 6 }}>
                    Tracking Timeline
                  </p>
                  {trackingMap[o._id].map((t) => (
                    <div key={t.status} style={{ fontSize: "0.84rem", color: t.completed ? "#2e7d32" : "var(--text-light)", marginBottom: 3 }}>
                      {t.completed ? "✓" : "○"} {t.status}
                    </div>
                  ))}
                </div>
              )}
              <p
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-light)",
                  marginBottom: 10,
                }}
              >
                Items
              </p>
              {o.products.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.88rem",
                    color: "var(--text)",
                    marginBottom: 6,
                  }}
                >
                  <span>
                    {p.name}{" "}
                    <span style={{ color: "var(--taupe)" }}>× {p.quantity}</span>
                  </span>
                  <span style={{ color: "var(--rose)" }}>
                    ${(p.price * p.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              {o.status === "Delivered" && !o.reviewRating && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginBottom: 4 }}>
                    Share a quick review of this order:
                  </p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <select
                      value={(reviewDrafts[o._id]?.rating) || 5}
                      onChange={(e) => updateDraft(o._id, { rating: Number(e.target.value) })}
                      style={{ fontSize: "0.8rem" }}
                    >
                      <option value={5}>★★★★★</option>
                      <option value={4}>★★★★☆</option>
                      <option value={3}>★★★☆☆</option>
                      <option value={2}>★★☆☆☆</option>
                      <option value={1}>★☆☆☆☆</option>
                    </select>
                    <input
                      style={{ flex: 1, fontSize: "0.8rem", padding: "6px 8px" }}
                      placeholder="A few words about your experience…"
                      value={reviewDrafts[o._id]?.comment || ""}
                      onChange={(e) => updateDraft(o._id, { comment: e.target.value })}
                    />
                    <button
                      className="btn-ghost"
                      style={{ fontSize: "0.75rem", padding: "6px 10px" }}
                      onClick={() => submitReview(o._id)}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
              {o.reviewRating && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginBottom: 4 }}>
                    <strong>Your review:</strong>{" "}
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
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyOrders;

