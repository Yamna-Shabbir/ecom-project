import { useEffect, useState } from "react";
import axios from "axios";
import { apiPath } from "../config/api";
import { Link } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import ProductImage from "../components/ProductImage";
import { PRODUCT_CATEGORIES } from "../constants/categories";
import { formatPKR } from "../utils/currency";

function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className="toast">{msg}</div>;
}

function Shop() {
  const [products, setProducts] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [debouncedMin, setDebouncedMin] = useState("");
  const [debouncedMax, setDebouncedMax] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedMin(minPrice.trim());
      setDebouncedMax(maxPrice.trim());
    }, 380);
    return () => clearTimeout(t);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .get(apiPath("/api/products"), {
        params: {
          category: category || undefined,
          minPrice: debouncedMin || undefined,
          maxPrice: debouncedMax || undefined,
        },
      })
      .then((res) => setProducts(res.data))
      .catch(() => setError("Unable to load products right now."))
      .finally(() => setLoading(false));
  }, [category, debouncedMin, debouncedMax]);

  useEffect(() => {
    axios
      .get(apiPath("/api/products/frequently-bought"))
      .then((res) => setFrequentlyBought(res.data || []))
      .catch(() => setFrequentlyBought([]));
  }, []);

  const getSessionId = () => {
    const key = "sessionId";
    let id = localStorage.getItem(key);
    if (!id) {
      id = `sess_${Math.random().toString(16).slice(2)}_${Date.now()}`;
      localStorage.setItem(key, id);
    }
    return id;
  };

  const track = async (productId, type) => {
    try {
      await axios.post(apiPath(`/api/products/${productId}/event`), {
        type,
        userEmail: localStorage.getItem("email") || null,
        sessionId: getSessionId(),
      });
    } catch (err) {}
  };

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const index = cart.findIndex((p) => p._id === product._id);
    if (index !== -1) cart[index].quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cartUpdatedAt", String(Date.now()));
    setToast(`${product.name} added to cart 🧺`);
  };

  const addToWishlist = async (product) => {
    const email = localStorage.getItem("email");
    if (!email) return;
    try {
      await axios.post(apiPath("/api/wishlist"), { email, productId: product._id });
      setToast(`${product.name} added to wishlist`);
    } catch (err) {
      setToast("Wishlist is unavailable right now.");
    }
  };

  return (
    <div className="page">
      <SeoHead
        title="Shop Products | Gulkaar"
        description="Browse handcrafted crochet by category and price in PKR."
        keywords="shop,handmade,crochet,pakistan,PKR"
      />
      <div className="page-header">
        <h1>The Collection</h1>
        <p>All pieces are handmade to order — thank you for your patience & love.</p>
        <div style={{ marginTop: 16 }}>
          <Link to="/cart">
            <button className="btn-outline">View Cart 🧺</button>
          </Link>
        </div>
        <div className="shop-filter-strip">
          <div className="shop-filter-field">
            <label htmlFor="shop-category" className="shop-filter-label">
              Category
            </label>
            <select
              id="shop-category"
              className="shop-filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="shop-filter-field">
            <label htmlFor="shop-min-price" className="shop-filter-label">
              Min price (PKR)
            </label>
            <input
              id="shop-min-price"
              className="shop-filter-input"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 10"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="shop-filter-field">
            <label htmlFor="shop-max-price" className="shop-filter-label">
              Max price (PKR)
            </label>
            <input
              id="shop-max-price"
              className="shop-filter-input"
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
      </div>
      {error && <div className="error-msg">{error}</div>}

      {frequentlyBought.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 18 }}>
          <h3>Frequently Bought</h3>
          <p style={{ color: "var(--text-light)" }}>Top products by purchase history.</p>
          <div className="product-grid" style={{ marginTop: 14 }}>
            {frequentlyBought.map((p) => (
              <article className="product-card product-card--listing" key={p._id}>
                <ProductImage image={p.image} alt={p.name} className="product-card-img" />
                <div className="product-card-body">
                  <h3 className="product-card-title">{p.name}</h3>
                  {p.description ? <p className="product-card-desc">{p.description}</p> : null}
                </div>
                <div className="product-card-price-row">
                  <span className="product-price product-price--lg">{formatPKR(p.price)}</span>
                </div>
                <div className="product-card-actions">
                  <Link to={`/products/${p._id}`}>
                    <button type="button" className="btn-ghost" onClick={() => track(p._id, "click")}>
                      View
                    </button>
                  </Link>
                  <button type="button" className="btn-primary" onClick={() => addToCart(p)}>
                    Add to Cart
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => addToWishlist(p)}>
                    Wishlist
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <div className="empty-icon">🧶</div>
          <h3>Loading collection…</h3>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧶</div>
          <h3>Coming soon</h3>
          <p>New pieces are being crafted. Check back soon!</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p, i) => (
            <article
              className="product-card product-card--listing"
              key={p._id}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <ProductImage image={p.image} alt={p.name} className="product-card-img" />
              <div className="product-card-body">
                <h3 className="product-card-title">{p.name}</h3>
                {p.description ? <p className="product-card-desc">{p.description}</p> : null}
              </div>
              <div className="product-card-price-row">
                <span className="product-price product-price--lg">{formatPKR(p.price)}</span>
              </div>
              <div className="product-card-actions">
                <Link to={`/products/${p._id}`}>
                  <button type="button" className="btn-ghost" onClick={() => track(p._id, "click")}>
                    View
                  </button>
                </Link>
                <button type="button" className="btn-primary" onClick={() => addToCart(p)}>
                  Add to Cart
                </button>
                <button type="button" className="btn-ghost" onClick={() => addToWishlist(p)}>
                  Wishlist
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}

export default Shop;