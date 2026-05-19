import { useState } from "react";
import axios from "axios";
import { apiPath } from "../config/api";
import { useNavigate, Link } from "react-router-dom";
import { validateEmail } from "../utils/validateEmail";
import logo from "../logo.jpeg";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔹 Register User
  const registerUser = async () => {
    setError("");
    setInfo("");

    if (!name.trim() || !email || !password) {
      return setError("Please fill in all fields.");
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) {
      return setError(emailCheck.message);
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);

    try {
      const res = await axios.post(
        apiPath("/api/auth/register"),
        { name: name.trim(), email: emailCheck.email, password }
      );

      // Auto-login after successful registration
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", emailCheck.email);
      localStorage.setItem("role", res.data.role);
      navigate(res.data.role === "admin" ? "/dashboard" : "/shop");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo-wrap">
          <span className="brand-logo-frame brand-logo-frame--md">
            <img src={logo} alt="Gülkaar" />
          </span>
          <span className="auth-logo">Gülkaar</span>
        </div>

        {/* Title */}
        <h2>Join us</h2>
        <p className="auth-sub">Create your account</p>

        {/* Messages */}
        {error && <div className="error-msg">{error}</div>}
        {info && !error && (
          <div
            className="error-msg"
            style={{
              background: "#f3f7ff",
              borderColor: "#c2d4ff",
              color: "#42507a",
            }}
          >
            {info}
          </div>
        )}

        {/* Register Form */}
        <>
            <div className="form-group">
              <label>Name</label>
              <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="form-hint">Use a real inbox you can access (Gmail, Outlook, Yahoo, etc.).</p>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && registerUser()}
              />
            </div>

            <button
              className="btn-primary"
              onClick={registerUser}
              disabled={loading}
              style={{ width: "100%", marginTop: "8px", padding: "14px" }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </>

        {/* Switch to login */}
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;