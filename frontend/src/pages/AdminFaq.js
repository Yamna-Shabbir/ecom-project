import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, apiPath, resolveImageUrl } from "../config/api";
import SeoHead from "../components/SeoHead";

// API_URL from config/api

function AdminFaq() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    setError("");
    axios
      .get(`${API_URL}/api/support/admin/questions`)
      .then((res) => {
        const rows = res.data || [];
        setItems(rows);
        const fromServer = {};
        rows.forEach((q) => {
          fromServer[q._id] = q.answer || "";
        });
        setDrafts(fromServer);
      })
      .catch(() => setError("Could not load questions."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const setDraft = (id, val) => {
    setDrafts((d) => ({ ...d, [id]: val }));
  };

  const saveAnswer = async (id) => {
    const answer = (drafts[id] || "").trim();
    if (answer.length < 2) return;
    setSavingId(id);
    setError("");
    try {
      await axios.patch(`${API_URL}/api/support/admin/questions/${id}`, { answer });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save answer.");
    } finally {
      setSavingId(null);
    }
  };

  const updateAnswer = async (id) => {
    const answer = (drafts[id] || "").trim();
    if (answer.length < 2) return;
    setSavingId(id);
    setError("");
    try {
      await axios.put(`${API_URL}/api/support/admin/questions/${id}`, { answer });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update answer.");
    } finally {
      setSavingId(null);
    }
  };

  const pending = items.filter((q) => q.status === "pending");
  const answered = items.filter((q) => q.status === "answered");

  return (
    <div className="page">
      <SeoHead title="Customer questions | Admin | Gulkaar" description="Answer buyer questions for the FAQ." />
      <div className="page-header">
        <h1>Customer questions</h1>
        <p>Answer pending questions — top answers by popularity appear on the buyer FAQ page.</p>
      </div>
      {error && <div className="error-msg">{error}</div>}

      {loading ? (
        <div className="empty-state">
          <h3>Loading…</h3>
        </div>
      ) : (
        <>
          <section className="faq-section admin-faq-block">
            <h2 className="faq-section-title">Pending ({pending.length})</h2>
            {pending.length === 0 ? (
              <p className="faq-section-sub">No open questions right now.</p>
            ) : (
              <ul className="admin-faq-list">
                {pending.map((q) => (
                  <li key={q._id} className="admin-faq-card">
                    <div className="admin-faq-qhead">
                      <p className="admin-faq-question">{q.questionText}</p>
                      <span className="admin-faq-badge">Asked {q.askCount}×</span>
                    </div>
                    {q.askedByEmail ? (
                      <p className="admin-faq-email">From: {q.askedByEmail}</p>
                    ) : null}
                    <textarea
                      className="faq-textarea admin-faq-textarea"
                      rows={4}
                      placeholder="Write a clear answer for customers…"
                      value={drafts[q._id] ?? ""}
                      onChange={(e) => setDraft(q._id, e.target.value)}
                      disabled={savingId === q._id}
                    />
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={savingId === q._id || (drafts[q._id] || "").trim().length < 2}
                      onClick={() => saveAnswer(q._id)}
                    >
                      {savingId === q._id ? "Saving…" : "Publish answer"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="faq-section admin-faq-block" style={{ marginTop: 36 }}>
            <h2 className="faq-section-title">Answered ({answered.length})</h2>
            <p className="faq-section-sub">Edit answers anytime; the FAQ “top 3” uses highest ask count among answered items.</p>
            {answered.length === 0 ? (
              <p className="faq-section-sub">No published answers yet.</p>
            ) : (
              <ul className="admin-faq-list">
                {answered.map((q) => (
                  <li key={q._id} className="admin-faq-card admin-faq-card--answered">
                    <div className="admin-faq-qhead">
                      <p className="admin-faq-question">{q.questionText}</p>
                      <span className="admin-faq-badge admin-faq-badge--ok">Asked {q.askCount}×</span>
                    </div>
                    <textarea
                      className="faq-textarea admin-faq-textarea"
                      rows={3}
                      value={drafts[q._id] ?? q.answer}
                      onChange={(e) => setDraft(q._id, e.target.value)}
                      disabled={savingId === q._id}
                    />
                    <button
                      type="button"
                      className="btn-outline"
                      disabled={savingId === q._id}
                      onClick={() => updateAnswer(q._id)}
                    >
                      {savingId === q._id ? "Saving…" : "Update answer"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default AdminFaq;
