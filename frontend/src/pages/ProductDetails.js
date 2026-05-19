import { useEffect, useState } from "react";
import axios from "axios";
import { apiPath } from "../config/api";
import { Link, useParams } from "react-router-dom";
import SeoHead from "../components/SeoHead";
import ProductImage from "../components/ProductImage";
import { formatPKR } from "../utils/currency";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const getSessionId = () => {
    const key = "sessionId";
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = `sess_${Math.random().toString(16).slice(2)}_${Date.now()}`;
      localStorage.setItem(key, sid);
    }
    return sid;
  };

  useEffect(() => {
    axios
      .get(apiPath(`/api/products/${id}`))
      .then(async (res) => {
        setProduct(res.data);
        try {
          await axios.post(apiPath(`/api/products/${id}/event`), {
            type: "view",
            userEmail: localStorage.getItem("email") || null,
            sessionId: getSessionId(),
          });
        } catch (err) {}
      })
      .catch(() => setError("Product not found."));
    axios
      .get(apiPath("/api/products/recommendations"), {
        params: {
          productId: id,
          email: localStorage.getItem("email") || "",
          sessionId: getSessionId(),
        },
      })
      .then((res) => setRecs(res.data))
      .catch(() => setRecs([]));
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const addToCart = async () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const index = cart.findIndex((p) => p._id === product._id);
    if (index !== -1) cart[index].quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cartUpdatedAt", String(Date.now()));
    setToast(`${product.name} added to cart 🧺`);
    try {
      await axios.post(apiPath(`/api/products/${product._id}/event`), {
        type: "click",
        userEmail: localStorage.getItem("email") || null,
        sessionId: getSessionId(),
      });
    } catch (err) {}
  };

  if (error) return <div className="page"><div className="error-msg">{error}</div></div>;
  if (!product) return <div className="page"><h3>Loading product...</h3></div>;

  return (
    <div className="page">
      <SeoHead
        title={product.seoTitle || `${product.name} | Gulkaar`}
        description={product.seoDescription || product.description || "Product details"}
        keywords={(product.seoKeywords || []).join(",") || `${product.name},handmade`}
        robots={product.metaRobots || "index,follow"}
        ogTitle={product.ogTitle}
        ogDescription={product.ogDescription}
        ogImage={product.image}
      />
      <div className="page-header">
        <h1>{product.name}</h1>
        <p>{product.category}</p>
      </div>
      <div className="product-detail-layout">
        <div>
          <ProductImage
            image={product.image}
            alt={product.imageAlt || product.name}
            className="product-detail-image"
          />
        </div>
        <div className="product-detail-info">
          <p>{product.description}</p>
          <p><strong>Price:</strong> {formatPKR(product.price)}</p>
          <p>
            <strong>Rating:</strong>{" "}
            {product.reviewCount > 0
              ? `${product.rating}/5 (${product.reviewCount} review${product.reviewCount !== 1 ? "s" : ""})`
              : "No reviews yet"}
          </p>
          <div className="product-detail-actions">
            <button type="button" className="btn-primary" onClick={addToCart}>
              Add to Cart
            </button>
            <Link to="/cart">
              <button type="button" className="btn-outline">
                View Cart 🧺
              </button>
            </Link>
          </div>
        </div>
      </div>
      {recs.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3>You may also like</h3>
          <div className="product-grid" style={{ marginTop: 14 }}>
            {recs.map((p) => (
              <div className="product-card" key={p._id}>
                <div className="product-card-body">
                  <h3>{p.name}</h3>
                  <p>{formatPKR(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default ProductDetails;
