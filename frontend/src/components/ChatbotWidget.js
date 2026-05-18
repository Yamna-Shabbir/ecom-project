import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API_URL, apiPath, resolveImageUrl } from "../config/api";
import { useNavigate } from "react-router-dom";



function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function productImageUrl(image) {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  const path = image.startsWith("/") ? image : `/${image}`;
  return `${API_URL}${path}`;
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  localStorage.setItem("cartUpdatedAt", String(Date.now()));
}

function ChatbotWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [speakReplies, setSpeakReplies] = useState(() => localStorage.getItem("chatbotSpeakReplies") === "1");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hi! Ask about shipping, returns, or payments.\n\nFind products: “show me handmade products”, “products under 1000”, or “show me flowers above 500”.\n\nCart: “add 2 tote to cart”, “remove tote”, “apply coupon SAVE10”, “show cart”.",
    },
  ]);
  const scrollRef = useRef(null);

  const voiceInputSupported = Boolean(getSpeechRecognition());
  const voiceOutputSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const stopSpeaking = () => {
    if (!voiceOutputSupported) return;
    window.speechSynthesis.cancel();
  };

  const speak = (text) => {
    if (!voiceOutputSupported || !speakReplies) return;
    const clean = String(text || "").trim();
    if (!clean) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  };

  const pushBot = ({ text, products }) => {
    setMessages((prev) => [...prev, { sender: "bot", text, products }]);
    speak(text);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading, open]);

  useEffect(() => {
    localStorage.setItem("chatbotSpeakReplies", speakReplies ? "1" : "0");
    if (!speakReplies) stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakReplies]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (_) {}
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleListening = () => {
    if (!voiceInputSupported || loading) return;
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const rec = new Recognition();
    recognitionRef.current = rec;
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let finalText = "";
    let lastDraft = "";

    rec.onstart = () => setListening(true);
    rec.onerror = () => setListening(false);
    rec.onend = async () => {
      setListening(false);
      const t = String(lastDraft || finalText || "").trim();
      if (!t) return;
      setInput(t);
      await send(t);
    };

    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) finalText += transcript;
        else interim += transcript;
      }
      const draft = `${finalText}${interim}`.trim();
      if (draft) {
        lastDraft = draft;
        setInput(draft);
      }
    };

    rec.start();
  };

  const send = async (overrideText) => {
    const raw = overrideText != null ? String(overrideText) : input;
    if (!raw.trim() || loading) return;
    const text = raw.trim();
    const n = normalize(text);
    const email = localStorage.getItem("email") || "";
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");

    if (n.startsWith("show cart") || n === "cart") {
      const cart = getCart();
      const reply =
        cart.length === 0
          ? "Your cart is empty."
          : `Your cart:\n${cart.map((p) => `- ${p.name} × ${p.quantity}`).join("\n")}`;
      pushBot({ text: reply, products: [] });
      return;
    }

    if (n.startsWith("apply coupon")) {
      const code = text.split(" ").slice(2).join(" ").trim();
      if (!code) {
        pushBot({ text: "Tell me a coupon code, e.g. 'apply coupon SAVE10'.", products: [] });
        return;
      }
      const normalizedCode = code.toUpperCase();
      localStorage.setItem("couponCode", normalizedCode);
      const pct = normalizedCode === "SAVE10" ? "10%" : normalizedCode === "SAVE20" ? "20%" : null;
      pushBot({
        text: pct
          ? `Coupon applied: ${normalizedCode} (${pct} off). Open Cart to see the discounted total.`
          : `Coupon applied: ${normalizedCode}. If it's valid, you’ll see the discount in Cart.`,
        products: [],
      });
      return;
    }

    if (n.startsWith("remove ")) {
      const namePart = text.slice(7).trim();
      const cart = getCart();
      const idx = cart.findIndex((p) => normalize(p.name).includes(normalize(namePart)));
      if (idx === -1) {
        pushBot({ text: "I couldn't find that item in your cart.", products: [] });
        return;
      }
      const removed = cart[idx];
      cart.splice(idx, 1);
      setCart(cart);
      pushBot({ text: `Removed ${removed.name} from your cart.`, products: [] });
      return;
    }

    if (n.startsWith("add ")) {
      const qtyMatch = n.match(/^add\s+(\d+)\s+/);
      const qty = qtyMatch ? Number(qtyMatch[1]) : 1;
      let productPhrase = text
        .replace(/^add\s+\d+\s+/i, "")
        .replace(/^add\s+/i, "")
        .trim();

      // Speech-to-text often adds punctuation or extra words ("to the cart", "a/an/the")
      productPhrase = productPhrase.replace(/[?.!]+$/g, "").trim();
      productPhrase = productPhrase.replace(/\s+to\s+(?:the\s+)?cart\s*$/i, "").trim();
      productPhrase = productPhrase.replace(/^(?:a|an|the)\s+/i, "").trim();

      if (!productPhrase) {
        pushBot({ text: "Tell me a product name, e.g. 'add 1 tote to cart'.", products: [] });
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(apiPath("/api/products"), { params: { q: productPhrase } });
        const p = (res.data || [])[0];
        if (!p) {
          pushBot({ text: "I couldn't find a matching product.", products: [] });
          return;
        }
        const cart = getCart();
        const index = cart.findIndex((x) => x._id === p._id);
        if (index !== -1) cart[index].quantity += qty;
        else cart.push({ ...p, quantity: qty });
        setCart(cart);
        pushBot({ text: `Added ${qty} × ${p.name} to your cart.`, products: [] });
      } catch (err) {
        pushBot({ text: "Unable to add item right now.", products: [] });
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(apiPath("/api/chatbot/query"), {
        message: text,
        email,
      });
      const reply = res.data.reply || "Sorry, I could not process that.";
      const products = Array.isArray(res.data.products) ? res.data.products : [];
      pushBot({ text: reply, products });
    } catch (err) {
      pushBot({ text: "Server error. Please try again.", products: [] });
    } finally {
      setLoading(false);
    }
  };

  const openProduct = (id) => {
    navigate(`/products/${id}`);
    setOpen(false);
  };

  return (
    <div className="chatbot-wrap">
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header-title">Shop assistant</div>
            <div className="chatbot-header-actions">
              <label className={`chatbot-tts ${!voiceOutputSupported ? "chatbot-tts--disabled" : ""}`}>
                <input
                  type="checkbox"
                  checked={speakReplies}
                  onChange={(e) => setSpeakReplies(e.target.checked)}
                  disabled={!voiceOutputSupported}
                />
                Speak
              </label>
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={stopSpeaking}
                disabled={!voiceOutputSupported}
                title="Stop speaking"
              >
                ⏹
              </button>
            </div>
          </div>
          <div className="chatbot-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chatbot-msg-row ${m.sender === "user" ? "chatbot-msg-row--user" : ""}`}
              >
                {m.text ? <div className="chatbot-bubble">{m.text}</div> : null}
                {m.sender === "bot" && m.products?.length > 0 && (
                  <div className="chatbot-products">
                    {m.products.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        className="chatbot-product-chip"
                        onClick={() => openProduct(p._id)}
                      >
                        {productImageUrl(p.image) ? (
                          <img
                            className="chatbot-product-chip-img"
                            src={productImageUrl(p.image)}
                            alt=""
                          />
                        ) : (
                          <div className="chatbot-product-chip-ph" aria-hidden>
                            🧶
                          </div>
                        )}
                        <div className="chatbot-product-chip-info">
                          <div className="chatbot-product-chip-name">{p.name}</div>
                          <div className="chatbot-product-chip-price">${p.price}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chatbot-typing" aria-live="polite">
                <span>Looking</span>
                <span className="chatbot-typing-dots" aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
          </div>
          <div className="chatbot-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder='Try: show me handmade products under 1000'
              disabled={loading}
            />
            <button
              type="button"
              className={`chatbot-icon-btn ${listening ? "chatbot-icon-btn--active" : ""}`}
              onClick={toggleListening}
              disabled={!voiceInputSupported || loading}
              title={
                !voiceInputSupported
                  ? "Voice input not supported in this browser"
                  : listening
                    ? "Stop listening"
                    : "Voice input"
              }
            >
              {listening ? "🎙" : "🎤"}
            </button>
            <button className="btn-primary" type="button" onClick={send} disabled={loading} style={{ padding: "10px 16px" }}>
              {loading ? "…" : "Send"}
            </button>
          </div>
        </div>
      )}
      <button className="btn-primary chatbot-toggle" type="button" onClick={() => setOpen((v) => !v)}>
        {open ? "Close chat" : "Chat"}
      </button>
    </div>
  );
}

export default ChatbotWidget;
