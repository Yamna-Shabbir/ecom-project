import { useEffect, useState } from "react";
import axios from "axios";
import { apiPath } from "../config/api";
import SeoHead from "../components/SeoHead";
import { formatPKR } from "../utils/currency";
import { SUPPORT_EMAIL } from "../constants/contact";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productReviewDrafts, setProductReviewDrafts] = useState({});
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

  const updateProductDraft = (orderId, productId, changes) => {
    setProductReviewDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [productId]: { rating: 5, comment: "", ...prev[orderId]?.[productId], ...changes },
      },
    }));
  };

  const submitReview = async (order) => {
    const drafts = productReviewDrafts[order._id] || {};
    const productReviews = (order.products || [])
      .filter((p) => p.productId)
      .map((p) => ({
        productId: p.productId,
        rating: Number(drafts[p.productId]?.rating || 5),
        comment: drafts[p.productId]?.comment || "",
      }));

    if (!productReviews.length) {
      alert("No products to review.");
      return;
    }

    try {
      const res = await axios.put(apiPath(`/api/orders/${order._id}/review`), {
        buyerEmail: localStorage.getItem("email"),
        productReviews,
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? res.data.order || res.data : o))
      );
      alert("Thank you! Your ratings have been saved.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review.");
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
        <p>
          Track your orders below (delivery usually takes 2–3 weeks). Questions? Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or use{" "}
          <a href="/faq">FAQ &amp; ask the team</a>.
        </p>
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
                  {formatPKR(o.totalPrice)}
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--blush)", paddingTop: 12 }}>
              {trackingMap[o._id]?.length > 0 && (
                <div style={{ marginBottom: 12, background: "#fff", border: "1px solid var(--blush)", padding: 10, borderRadius: 8 }}>
                  <p style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 6 }}>
                    Delivery timeline (2–3 weeks)
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
                    {formatPKR(p.price * p.quantity)}
                  </span>
                </div>
              ))}
              {o.status === "Delivered" && !o.reviewRating && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-light)", marginBottom: 8 }}>
                    Rate each product (saved automatically to the shop):
                  </p>
                  {(o.products || []).filter((p) => p.productId).map((p) => (
                    <div key={p.productId} className="product-review-row">
                      <span className="product-review-name">{p.name}</span>
                      <select
                        value={(productReviewDrafts[o._id]?.[p.productId]?.rating) || 5}
                        onChange={(e) =>
                          updateProductDraft(o._id, p.productId, { rating: Number(e.target.value) })
                        }
                      >
                        <option value={5}>★★★★★</option>
                        <option value={4}>★★★★☆</option>
                        <option value={3}>★★★☆☆</option>
                        <option value={2}>★★☆☆☆</option>
                        <option value={1}>★☆☆☆☆</option>
                      </select>
                      <input
                        placeholder="Optional comment…"
                        value={productReviewDrafts[o._id]?.[p.productId]?.comment || ""}
                        onChange={(e) =>
                          updateProductDraft(o._id, p.productId, { comment: e.target.value })
                        }
                      />
                    </div>
                  ))}
                  <button
                    className="btn-primary"
                    style={{ marginTop: 10, padding: "10px 18px" }}
                    onClick={() => submitReview(o)}
                  >
                    Submit ratings
                  </button>
                </div>
              )}
              {o.reviewRating && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>
                    <strong>Your ratings were submitted.</strong> Thank you for your feedback!
                  </p>
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
