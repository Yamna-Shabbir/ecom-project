import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { apiPath } from "../config/api";
import ProductImage from "../components/ProductImage";
import { formatPKR } from "../utils/currency";

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cardError, setCardError] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [couponCode, setCouponCode] = useState(localStorage.getItem("couponCode") || "");
  const [couponMsg, setCouponMsg] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const updateQuantity = (productId, qty) => {
    if (qty < 1) return;
    const updated = cart.map((p) =>
      p._id === productId ? { ...p, quantity: qty } : p
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (productId) => {
    const updated = cart.filter((p) => p._id !== productId);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const totalPrice = cart.reduce((a, c) => a + c.price * c.quantity, 0);
  const normalizedCoupon = (couponCode || "").trim().toUpperCase();
  const discount =
    normalizedCoupon === "SAVE10" ? totalPrice * 0.1 :
    normalizedCoupon === "SAVE20" ? totalPrice * 0.2 :
    0;
  const finalTotal = Math.max(totalPrice - discount, 0);

  const applyCoupon = () => {
    const code = (couponCode || "").trim().toUpperCase();
    if (!code) {
      setCouponMsg("Enter a coupon code.");
      return;
    }
    if (code === "SAVE10" || code === "SAVE20") {
      localStorage.setItem("couponCode", code);
      setCouponCode(code);
      setCouponMsg(code === "SAVE10" ? "Coupon applied: 10% off" : "Coupon applied: 20% off");
      return;
    }
    setCouponMsg("Invalid coupon. Try SAVE10 or SAVE20.");
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    if (!name || !email) {
      alert("Please log in before placing an order.");
      navigate("/login");
      return;
    }
    if (!phone || !city || !address) {
      alert("Please enter your phone, city, and delivery address.");
      return;
    }

    setLoading(true);
    setCardError("");

    try {
      if (paymentMethod === "CARD") {
        setCardError(
          "Sorry, we only accept cash on delivery. Please select Cash on Delivery to place your order."
        );
        setLoading(false);
        return;
      }

      await axios.post(apiPath("/api/orders"), {
        buyerName: name,
        buyerEmail: email,
        buyerPhone: phone,
        buyerCity: city,
        buyerAddress: address,
        products: cart.map((p) => ({
          productId: p._id,
          name: p.name,
          price: p.price,
          quantity: p.quantity,
        })),
        totalPrice: finalTotal,
        paymentMethod: "CASH",
      });

      localStorage.removeItem("cart");
      localStorage.removeItem("couponCode");
      setCart([]);
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setCouponCode("");
      alert(
        "Order placed! A confirmation email with your items and 2–3 week delivery timeline has been sent to your inbox."
      );
      navigate("/my-orders");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to place order. Please try again.";
      if (paymentMethod === "CARD") setCardError(msg);
      else alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">🧺</div>
          <h3>Your cart is empty</h3>
          <p>Browse our collection and find something you love.</p>
          <Link to="/shop">
            <button className="btn-primary">Shop Now</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Your Cart</h1>
        <p>{cart.length} item{cart.length !== 1 ? "s" : ""} waiting for you</p>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div>
          {cart.map((p) => (
            <div className="cart-item" key={p._id}>
              <ProductImage
                image={p.image}
                alt={p.name}
                className="cart-item-img"
                placeholderClassName="cart-item-placeholder"
              />
              <div className="cart-item-info">
                <h3>{p.name}</h3>
                <p>{formatPKR(p.price)} each</p>
                <div className="qty-control">
                  <button onClick={() => updateQuantity(p._id, p.quantity - 1)}>−</button>
                  <span>{p.quantity}</span>
                  <button onClick={() => updateQuantity(p._id, p.quantity + 1)}>+</button>
                </div>
              </div>
              <div className="cart-item-actions">
                <div className="cart-item-price">
                  {formatPKR(p.price * p.quantity)}
                </div>
                <button className="btn-danger" onClick={() => removeItem(p._id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h2>Order Summary</h2>
          {cart.map((p) => (
            <div className="cart-summary-row" key={p._id}>
              <span>{p.name} × {p.quantity}</span>
              <span>{formatPKR(p.price * p.quantity)}</span>
            </div>
          ))}
          <div className="cart-summary-total">
            <span>Total</span>
            <span>{formatPKR(finalTotal)}</span>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--blush)" }}>
            <div style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 8 }}>
              Coupons
            </div>
            <div className="coupon-row">
              <input
                placeholder="SAVE10 / SAVE20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button className="btn-ghost" type="button" onClick={applyCoupon}>
                Apply
              </button>
            </div>
            {discount > 0 && (
              <p style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--sage)" }}>
                Discount: -{formatPKR(discount)}
              </p>
            )}
            {couponMsg && (
              <p style={{ marginTop: 6, fontSize: "0.82rem", color: "var(--text-light)" }}>
                {couponMsg}
              </p>
            )}
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--blush)" }}>
            <div style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 8 }}>
              Help & FAQs
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-light)", lineHeight: 1.7 }}>
              <div><strong>Shipping:</strong> Dispatch 1–2 days. Delivery 3–7 working days.</div>
              <div><strong>Returns:</strong> Within 7 days for unused items (proof of purchase required).</div>
              <div><strong>Payments:</strong> Cash on delivery only (PKR).</div>
            </div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--blush)" }}>
            <div style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 8 }}>
              Abandoned Cart Reminder
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-light)", lineHeight: 1.7 }}>
              If you leave items in your cart, we’ll keep them saved here. Tip: you can also use the chatbot:
              <div style={{ marginTop: 8 }}>
                <strong>Examples:</strong> “show cart”, “add 1 flower to cart”, “remove flower”, “apply coupon SAVE10”.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 8 }}>
              Contact & Delivery
            </div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label>Phone number</label>
              <input
                placeholder="e.g. +92 300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label>City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Select city</option>
                <option value="Karachi">Karachi</option>
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
                <option value="Faisalabad">Faisalabad</option>
                <option value="Multan">Multan</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Quetta">Quetta</option>
                <option value="Sialkot">Sialkot</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Gujranwala">Gujranwala</option>
                <option value="Sargodha">Sargodha</option>
                <option value="Bahawalpur">Bahawalpur</option>
                <option value="Abbottabad">Abbottabad</option>
                <option value="Others">Other city</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 4 }}>
              <label>Delivery address</label>
              <textarea
                rows={3}
                placeholder="Street, area, any delivery notes…"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          <div style={{ marginTop: 18, marginBottom: 10 }}>
            <div style={{ fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: 8 }}>
              Payment Method
            </div>
            <div className="payment-method-row">
              <button
                type="button"
                className="btn-ghost"
                style={{
                  flex: 1,
                  ...(paymentMethod === "CASH"
                    ? { borderColor: "var(--rose)", color: "var(--rose)", background: "rgba(200,134,122,0.06)" }
                    : {}),
                }}
                onClick={() => setPaymentMethod("CASH")}
              >
                Cash on Delivery
              </button>
              <button
                type="button"
                className="btn-ghost"
                style={{
                  flex: 1,
                  ...(paymentMethod === "CARD"
                    ? { borderColor: "var(--rose)", color: "var(--rose)", background: "rgba(200,134,122,0.06)" }
                    : {}),
                }}
                onClick={() => setPaymentMethod("CARD")}
              >
                Card (online)
              </button>
            </div>
            {paymentMethod === "CARD" && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: "0.78rem", marginBottom: 6, color: "var(--text-light)" }}>
                  Sandbox card payment (test). Use card: <strong>4242 4242 4242 4242</strong>
                </div>
                <div className="card-element-wrapper" style={{ display: "grid", gap: 10 }}>
                  <input
                    placeholder="Card number (4242 4242 4242 4242)"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <input
                      placeholder="Expiry (MM/YY)"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                    <input
                      placeholder="CVC"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                    />
                  </div>
                </div>
                {cardError && (
                  <div style={{ color: "#c0392b", fontSize: "0.8rem", marginTop: 6 }}>
                    {cardError}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className="btn-primary"
            onClick={placeOrder}
            disabled={loading}
            style={{ width: "100%", marginTop: 8, padding: "14px" }}
          >
            {loading ? "Placing order…" : paymentMethod === "CASH" ? "Place Order (Cash)" : "Pay Now"}
          </button>
          <p style={{ fontSize: "0.78rem", color: "var(--text-light)", textAlign: "center", marginTop: 12 }}>
            Handmade with care, shipped with love 🌸
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cart;