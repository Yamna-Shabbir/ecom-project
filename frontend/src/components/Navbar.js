import { Link, useNavigate } from "react-router-dom";
import logo from "../logo.jpeg";

function Navbar() {
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <img src={logo} alt="Gülkaar" className="navbar-logo-img" />
        Gül<span>kaar</span>
      </Link>

      <ul className="navbar-links">
        {role === "buyer" && (
          <>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/my-orders">My Orders</Link></li>
            <li>
              <Link to="/cart" className="cart-link">
                <span>🧺</span> Cart
              </Link>
            </li>
          </>
        )}

        {role === "admin" && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/admin-analytics">Analytics</Link></li>
            <li><Link to="/manage-products">Products</Link></li>
            <li><Link to="/admin-orders">Orders</Link></li>
            <li><Link to="/admin-users">Users</Link></li>
            <li><Link to="/admin-faq">FAQ</Link></li>
          </>
        )}

        {name ? (
          <>
            <li style={{ color: "var(--taupe)", fontSize: "0.8rem" }}>
              {name}
            </li>
            <li>
              <button onClick={logout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;