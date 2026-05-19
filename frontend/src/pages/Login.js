import { useState } from "react";
import axios from "axios";
import { apiPath } from "../config/api";
import { useNavigate, Link } from "react-router-dom";
import { validateEmail } from "../utils/validateEmail";
import logo from "../logo.jpeg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginUser = async () => {
    setError("");
    if (!email || !password) return setError("Please fill in all fields.");

    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) return setError(emailCheck.message);

    setLoading(true);
    try {
      const res = await axios.post(apiPath("/api/auth/login"), {
        email: emailCheck.email,
        password,
      });
      if (res.data.message) {
        setError(res.data.message);
      } else {
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("email", res.data.email);
        localStorage.setItem("role", res.data.role);
        navigate(res.data.role === "admin" ? "/dashboard" : "/shop");
      }
    } catch (err) {
      if (!err.response) {
        setError(
          "Cannot reach the API. Wait 30s (Render free tier wakes slowly), then try again."
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response.status === 404) {
        setError("API not found (404). Set REACT_APP_API_URL to your Render URL and redeploy Netlify.");
      } else {
        setError(`Login failed (${err.response.status}). Check Render is live and redeploy Netlify.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo-wrap">
          <img src={logo} alt="Gülkaar logo" className="auth-logo-img" />
          <span className="auth-logo">Gülkaar</span>
        </div>
        <h2>Welcome back</h2>
        <p className="auth-sub">Sign in to your account</p>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loginUser()}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loginUser()}
          />
        </div>

        <button
          className="btn-primary"
          onClick={loginUser}
          disabled={loading}
          style={{ width: "100%", marginTop: "8px", padding: "14px" }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <p className="auth-switch">
          New to Gülkaar? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;