import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, apiPath, resolveImageUrl } from "../config/api";
import { useParams } from "react-router-dom";
import SeoHead from "../components/SeoHead";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState("");

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
        <p>{product.category} · {product.brand}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        <div>
          {product.image ? <img src={product.image} alt={product.imageAlt || product.name} style={{ width: "100%", borderRadius: 8 }} /> : <div className="product-card-img-placeholder">🧶</div>}
        </div>
        <div>
          <p style={{ marginBottom: 10 }}>{product.description}</p>
          <p><strong>Price:</strong> ${product.price}</p>
          <p><strong>Rating:</strong> {product.rating || 0}/5</p>
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
                  <p>${p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
