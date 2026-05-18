import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import SeoHead from "../components/SeoHead";

function Faq() {
  const [top, setTop] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const email = localStorage.getItem("email") || "";

  const loadTop = () => {
    axios
      .get(`${API_URL}/api/support/faq/top`)
      .then((res) => setTop(res.data || []))
      .catch(() => setTop([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTop();
  }, []);

  const submitQuestion = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 4 || submitting) return;
    setSubmitting(true);
    setFeedback("");
    try {
      const res = await axios.post(`${API_URL}/api/support/questions`, { question: q, email });
      setFeedback(res.data?.message || "Thanks!");
      setQuestion("");
      loadTop();
    } catch (err) {
      setFeedback(err.response?.data?.message || "Could not send your question. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <SeoHead
        title="FAQ | Gulkaar"
        description="Popular answers and ask our team a question."
        keywords="faq,help,support,questions"
      />
      <div className="page-header">
        <h1>FAQ &amp; help</h1>
        <p>Top questions from the community, and a direct line to our team.</p>
      </div>

      <section className="faq-section">
        <h2 className="faq-section-title">Most asked</h2>
        <p className="faq-section-sub">The three questions shoppers ask us most — answered here.</p>
        {loading ? (
          <div className="faq-loading">Loading…</div>
        ) : top.length === 0 ? (
          <div className="faq-empty">
            Popular answers will appear here once the team has replied to questions.
          </div>
        ) : (
          <ul className="faq-top-list">
            {top.map((item, i) => (
              <li key={item._id} className="faq-top-card">
                <span className="faq-top-rank">{i + 1}</span>
                <h3 className="faq-top-q">{item.questionText}</h3>
                <p className="faq-top-a">{item.answer}</p>
                <span className="faq-top-meta">Asked {item.askCount}×</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="faq-section faq-ask-section">
        <h2 className="faq-section-title">Ask the team</h2>
        <p className="faq-section-sub">
          Can’t find what you need? Send a question — we read every message. If others ask the same thing, it
          counts toward the “most asked” list above once we publish an answer.
        </p>
        <form className="faq-ask-form" onSubmit={submitQuestion}>
          <label htmlFor="faq-question" className="faq-sr-only">
            Your question
          </label>
          <textarea
            id="faq-question"
            className="faq-textarea"
            rows={5}
            placeholder="Write your question for the Gülkaar team…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={submitting}
          />
          <button className="btn-primary faq-submit" type="submit" disabled={submitting || question.trim().length < 4}>
            {submitting ? "Sending…" : "Send question"}
          </button>
          {feedback ? <p className="faq-feedback">{feedback}</p> : null}
        </form>
      </section>
    </div>
  );
}

export default Faq;
