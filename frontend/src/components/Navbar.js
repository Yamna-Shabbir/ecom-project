import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../logo.jpeg";

function Navbar() {
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`navbar${menuOpen ? " navbar--open" : ""}`}>
      <div className="navbar-top">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="Gülkaar" className="navbar-logo-img" />
          Gül<span>kaar</span>
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <ul className="navbar-links">
        {role === "buyer" && (
          <>
            <li><Link to="/shop" onClick={closeMenu}>Shop</Link></li>
            <li><Link to="/faq" onClick={closeMenu}>FAQ</Link></li>
            <li><Link to="/wishlist" onClick={closeMenu}>Wishlist</Link></li>
            <li><Link to="/my-orders" onClick={closeMenu}>My Orders</Link></li>
            <li>
              <Link to="/cart" className="cart-link" onClick={closeMenu}>
                <span>🧺</span> Cart
              </Link>
            </li>
          </>
        )}

        {role === "admin" && (
          <>
            <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
            <li><Link to="/admin-analytics" onClick={closeMenu}>Analytics</Link></li>
            <li><Link to="/manage-products" onClick={closeMenu}>Products</Link></li>
            <li><Link to="/admin-orders" onClick={closeMenu}>Orders</Link></li>
            <li><Link to="/admin-users" onClick={closeMenu}>Users</Link></li>
            <li><Link to="/admin-faq" onClick={closeMenu}>FAQ</Link></li>
          </>
        )}

        {name ? (
          <>
            <li className="navbar-user">{name}</li>
            <li>
              <button type="button" onClick={logout}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" onClick={closeMenu}>Login</Link></li>
            <li><Link to="/register" onClick={closeMenu}>Register</Link></li>
          </>
        )}
      </ul>

      {menuOpen && (
        <button
          type="button"
          className="navbar-backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}
    </nav>
  );
}

export default Navbar;
