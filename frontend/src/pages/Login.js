import { useState } from "react";
import axios from "axios";
import { apiPath } from "../config/api";
import { useNavigate, Link } from "react-router-dom";
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
    setLoading(true);
    try {
      const res = await axios.post(apiPath("/api/auth/login"), { email, password });
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
          "Cannot reach the server. Wait 30s if the API just woke up, then try again. " +
            "(Check Netlify env REACT_APP_API_URL and redeploy.)"
        );
      } else {
        setError(err.response?.data?.message || "Something went wrong.");
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