import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, apiPath, resolveImageUrl } from "../config/api";
import SeoHead from "../components/SeoHead";

const CATEGORY_OPTIONS = ["Flowers", "Laptop Accessories", "Hair Accessories", "Scarfs"];

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
    brand: "",
    rating: 4.5,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    metaRobots: "index,follow",
    slug: "",
    imageAlt: "",
    ogTitle: "",
    ogDescription: "",
    socialShareText: "",
    pinterestDescription: "",
    backlinkKeywords: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingSeo, setGeneratingSeo] = useState(false);

  const fetchProducts = async () => {
    const res = await axios.get(apiPath("/api/products"));
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const uploadImageIfNeeded = async () => {
    if (!imageFile) {
      return form.image || "";
    }

    const data = new FormData();
    data.append("image", imageFile);
    const res = await axios.post(apiPath("/api/products/upload"), data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return resolveImageUrl(res.data.imageUrl);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) return alert("Name and price are required.");
    setLoading(true);
    try {
      const imageUrl = await uploadImageIfNeeded();
      const payload = {
        ...form,
        image: imageUrl,
        seoKeywords: (form.seoKeywords || "").split(",").map((s) => s.trim()).filter(Boolean),
        slug: (form.slug || "").trim() ? (form.slug || "").trim() : undefined,
        backlinkKeywords: (form.backlinkKeywords || "").split(",").map((s) => s.trim()).filter(Boolean),
      };

      if (editId) {
        await axios.put(apiPath(`/api/products/${editId}`), payload);
        setEditId(null);
      } else {
        await axios.post(apiPath("/api/products"), payload);
      }
      setForm({
        name: "",
        price: "",
        description: "",
        image: "",
        category: "",
        brand: "",
        rating: 4.5,
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
        metaRobots: "index,follow",
        slug: "",
        imageAlt: "",
        ogTitle: "",
        ogDescription: "",
        socialShareText: "",
        pinterestDescription: "",
        backlinkKeywords: "",
      });
      setImageFile(null);
      setPreviewUrl("");
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const applySeoToForm = (seo) => {
    setForm((prev) => ({
      ...prev,
      seoTitle: seo.seoTitle || "",
      seoDescription: seo.seoDescription || "",
      seoKeywords: (seo.seoKeywords || []).join(", "),
      metaRobots: seo.metaRobots || "index,follow",
      slug: seo.slug || "",
      imageAlt: seo.imageAlt || "",
      ogTitle: seo.ogTitle || "",
      ogDescription: seo.ogDescription || "",
      socialShareText: seo.socialShareText || "",
      pinterestDescription: seo.pinterestDescription || "",
      backlinkKeywords: (seo.backlinkKeywords || []).join(", "),
    }));
  };

  const handleGenerateSeo = async () => {
    if (!form.name.trim()) {
      alert("Enter a product name before generating SEO.");
      return;
    }
    setGeneratingSeo(true);
    try {
      const body = {
        name: form.name,
        price: form.price,
        description: form.description,
        category: form.category,
        brand: form.brand,
        rating: form.rating,
      };
      const url = editId
        ? apiPath(`/api/products/${editId}/generate-seo`)
        : apiPath("/api/products/generate-seo");
      const res = await axios.post(url, body);
      applySeoToForm(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Could not generate SEO. Check AI keys in backend/.env.");
    } finally {
      setGeneratingSeo(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      description: product.description || "",
      image: product.image || "",
      category: product.category || "",
      brand: product.brand || "",
      rating: product.rating || 4.5,
      seoTitle: product.seoTitle || "",
      seoDescription: product.seoDescription || "",
      seoKeywords: (product.seoKeywords || []).join(", "),
      metaRobots: product.metaRobots || "index,follow",
      slug: product.slug || "",
      imageAlt: product.imageAlt || "",
      ogTitle: product.ogTitle || "",
      ogDescription: product.ogDescription || "",
      socialShareText: product.socialShareText || "",
      pinterestDescription: product.pinterestDescription || "",
      backlinkKeywords: (product.backlinkKeywords || []).join(", "),
    });
    setImageFile(null);
    setPreviewUrl(product.image || "");
    setEditId(product._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await axios.delete(apiPath(`/api/products/${id}`));
    fetchProducts();
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({
      name: "",
      price: "",
      description: "",
      image: "",
      category: "",
      brand: "",
      rating: 4.5,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      metaRobots: "index,follow",
      slug: "",
      imageAlt: "",
      ogTitle: "",
      ogDescription: "",
      socialShareText: "",
      pinterestDescription: "",
      backlinkKeywords: "",
    });
    setImageFile(null);
    setPreviewUrl("");
  };

  return (
    <div className="page">
      <SeoHead title="Admin Product Management | Gulkaar" description="Manage products and SEO metadata." keywords="admin,dashboard,product crud,seo" />
      <div className="page-header">
        <h1>{editId ? "Edit Product" : "Manage Products"}</h1>
        <p>Add new items or update your existing collection.</p>
      </div>

      {/* Form */}
      <div className="admin-form">
        <h2>{editId ? "Update Item" : "Add New Item"}</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Product Name</label>
            <input
              placeholder="e.g. Chunky Knit Tote"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Price (USD)</label>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input
            placeholder="A short description of this piece…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Brand</label>
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Rating</label>
            <input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
          </div>
        </div>

        <div className="seo-section-header">
          <h3>SEO</h3>
          <button
            type="button"
            className="btn-outline"
            onClick={handleGenerateSeo}
            disabled={generatingSeo || !form.name.trim()}
          >
            {generatingSeo ? "Generating…" : "Generate SEO through AI"}
          </button>
        </div>
        <p className="seo-section-hint">
          {editId
            ? "Generates on-page and off-page SEO for this product using its current details."
            : "Enter product details above, then generate SEO before saving."}
        </p>

        <h4 className="seo-subheading">On-page SEO</h4>
        <div className="form-group">
          <label>SEO Title</label>
          <input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
        </div>
        <div className="form-group">
          <label>SEO Description</label>
          <input value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>SEO Keywords (comma separated)</label>
            <input value={form.seoKeywords} onChange={(e) => setForm({ ...form, seoKeywords: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Meta Robots</label>
            <input value={form.metaRobots} onChange={(e) => setForm({ ...form, metaRobots: e.target.value })} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Slug</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="chunky-knit-tote" />
          </div>
          <div className="form-group">
            <label>Image Alt Text</label>
            <input value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} />
          </div>
        </div>

        <h4 className="seo-subheading">Off-page SEO</h4>
        <div className="form-group">
          <label>Open Graph Title</label>
          <input value={form.ogTitle} onChange={(e) => setForm({ ...form, ogTitle: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Open Graph Description</label>
          <input value={form.ogDescription} onChange={(e) => setForm({ ...form, ogDescription: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Social Share Text</label>
          <textarea
            rows={2}
            value={form.socialShareText}
            onChange={(e) => setForm({ ...form, socialShareText: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Pinterest Description</label>
          <textarea
            rows={2}
            value={form.pinterestDescription}
            onChange={(e) => setForm({ ...form, pinterestDescription: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Backlink / Outreach Keywords (comma separated)</label>
          <input value={form.backlinkKeywords} onChange={(e) => setForm({ ...form, backlinkKeywords: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Product Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImageFile(file);
              setPreviewUrl(URL.createObjectURL(file));
            }}
          />
          <p style={{ fontSize: "0.78rem", color: "var(--text-light)", marginTop: 6 }}>
            You can also paste an image URL directly if you prefer.
          </p>
          <input
            style={{ marginTop: 8 }}
            placeholder="or paste image URL…"
            value={form.image}
            onChange={(e) => {
              setForm({ ...form, image: e.target.value });
              setPreviewUrl(e.target.value);
            }}
          />
          {previewUrl && (
            <div style={{ marginTop: 10 }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 4, border: "1px solid var(--blush)" }}
              />
            </div>
          )}
        </div>
        <div className="form-actions">
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : editId ? "Update Product" : "Add Product"}
          </button>
          {editId && (
            <button className="btn-ghost" onClick={handleCancel}>Cancel</button>
          )}
        </div>
      </div>

      {/* Table */}
      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧶</div>
          <h3>No products yet</h3>
          <p>Add your first handmade piece above.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="product-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    {p.image ? (
                      <img src={p.image} alt={p.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 3 }} />
                    ) : (
                      <div style={{ width: 56, height: 56, background: "var(--blush)", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>🧶</div>
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td style={{ color: "var(--rose)", fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem" }}>${p.price}</td>
                  <td style={{ color: "var(--text-light)", maxWidth: 220 }}>{p.description || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-ghost" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageProducts;