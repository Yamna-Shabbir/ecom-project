import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, apiPath, resolveImageUrl } from "../config/api";
import { Link } from "react-router-dom";
import SeoHead from "../components/SeoHead";

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const email = localStorage.getItem("email");

  const fetchWishlist = async () => {
    if (!email) return setLoading(false);
    const res = await axios.get(apiPath("/api/wishlist"), { params: { email } });
    setItems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }
    axios
      .get(apiPath("/api/wishlist"), { params: { email } })
      .then((res) => setItems(res.data))
      .catch(() => setError("Unable to load wishlist right now."))
      .finally(() => setLoading(false));
  }, [email]);

  const remove = async (productId) => {
    await axios.delete(apiPath(`/api/wishlist/${productId}`), { params: { email } });
    fetchWishlist();
  };

  return (
    <div className="page">
      <SeoHead title="Wishlist | Gulkaar" description="Saved items in your wishlist." keywords="wishlist,saved products" />
      <div className="page-header">
        <h1>My Wishlist</h1>
        <p>Products you saved for later.</p>
      </div>
      {error && <div className="error-msg">{error}</div>}
      {loading ? (
        <div className="empty-state"><h3>Loading wishlist...</h3></div>
      ) : items.length === 0 ? (
        <div className="empty-state"><h3>No wishlist items yet</h3></div>
      ) : (
        <div className="product-grid">
          {items.map((w) => {
            const p = w.productId;
            return (
              <div className="product-card" key={w._id}>
                {p?.image ? <img className="product-card-img" src={p.image} alt={p.name} /> : <div className="product-card-img-placeholder">🧶</div>}
                <div className="product-card-body">
                  <h3>{p?.name}</h3>
                  <p>{p?.description}</p>
                </div>
                <div className="product-card-footer">
                  <span className="product-price">${p?.price}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link to={`/products/${p?._id}`}><button className="btn-ghost">View</button></Link>
                    <button className="btn-danger" onClick={() => remove(p?._id)}>Remove</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
