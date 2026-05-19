import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiPath } from "../config/api";
import { formatPKR } from "../utils/currency";
import { SUPPORT_EMAIL } from "../constants/contact";
import SeoHead from "../components/SeoHead";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const [timeline, setTimeline] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    if (!order?._id) {
      navigate("/shop", { replace: true });
      return;
    }
    setTrackingLoading(true);
    axios
      .get(apiPath(`/api/orders/${order._id}/tracking`))
      .then((res) => setTimeline(res.data.timeline || []))
      .catch(() => setTimeline([]))
      .finally(() => setTrackingLoading(false));
  }, [order, navigate]);

  if (!order) return null;

  const orderRef = String(order._id).slice(-6).toUpperCase();

  return (
    <div className="page">
      <SeoHead
        title="Order confirmed | Gulkaar"
        description="Your order was placed successfully."
        keywords="order confirmed,gulkaar"
      />
      <div className="order-success-card">
        <div className="order-success-icon" aria-hidden>
          ✓
        </div>
        <h1>Thank you, {order.buyerName}!</h1>
        <p className="order-success-lead">
          Your order <strong>#{orderRef}</strong> is confirmed. Handmade items take care and time — please
          allow <strong>2–3 weeks</strong> for delivery.
        </p>

        <div className="order-success-box">
          <h2>What you ordered</h2>
          <ul className="order-success-items">
            {(order.products || []).map((p, i) => (
              <li key={i}>
                <span>
                  {p.name} × {p.quantity}
                </span>
                <span>{formatPKR(p.price * p.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="order-success-total">
            <strong>Total (cash on delivery):</strong> {formatPKR(order.totalPrice)}
          </p>
          <p className="order-success-meta">
            <strong>Delivery:</strong> {order.buyerCity}, {order.buyerAddress}
            <br />
            <strong>Phone:</strong> {order.buyerPhone}
          </p>
        </div>

        <div className="order-success-box">
          <h2>Delivery timeline</h2>
          {trackingLoading ? (
            <p className="order-success-muted">Loading tracking…</p>
          ) : timeline.length > 0 ? (
            <ul className="order-success-timeline">
              {timeline.map((t) => (
                <li key={t.status} className={t.completed ? "is-done" : ""}>
                  {t.completed ? "✓" : "○"} {t.status}
                </li>
              ))}
            </ul>
          ) : (
            <p className="order-success-muted">
              Order confirmed → Packed (3–5 days) → Dispatched (~1 week) → Delivered (2–3 weeks total)
            </p>
          )}
          <p className="order-success-muted" style={{ marginTop: 12 }}>
            Track anytime under <strong>My Orders</strong> — tap &quot;Track Order&quot; on this order.
          </p>
        </div>

        <div className="order-success-box">
          <h2>Questions or delays?</h2>
          <p>
            If delivery takes longer than 2–3 weeks, or you need help, contact us on the phone you provided (
            <strong>{order.buyerPhone}</strong>) or by email:
          </p>
          <p className="order-success-email">
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
          <p className="order-success-muted">
            You can also use the <strong>Ask the team</strong> form on our FAQ page — we read every message.
          </p>
        </div>

        <div className="order-success-actions">
          <Link to="/my-orders">
            <button type="button" className="btn-primary">
              Track my orders
            </button>
          </Link>
          <Link to="/faq">
            <button type="button" className="btn-outline">
              FAQ &amp; ask a question
            </button>
          </Link>
          <Link to="/shop">
            <button type="button" className="btn-ghost">
              Continue shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
