import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, apiPath, resolveImageUrl } from "../config/api";
import SeoHead from "../components/SeoHead";

function Dashboard() {
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const [stats, setStats] = useState({ totalRevenue: 0, ordersCount: 0, topProducts: [] });

  useEffect(() => {
    if (role !== "admin") return;
    axios
      .get(apiPath("/api/orders/stats"))
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, [role]);

  return (
    <div className="page">
      <SeoHead title="Admin Dashboard | Gulkaar" description="Manage products, orders, and store analytics." keywords="admin,dashboard,orders,products" />
      <div className="page-header">
        <h1>Hello, {name} 🌸</h1>
        <p>
          {role === "admin"
            ? "Welcome to your admin dashboard — overview of your shop at a glance."
            : "Welcome back to Gülkaar."}
        </p>
      </div>

      {role === "admin" && (
        <>
          <div className="dashboard-metrics">
            <div className="metric-card">
              <p className="metric-label">Total Revenue</p>
              <p className="metric-value">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Total Orders</p>
              <p className="metric-value">{stats.ordersCount}</p>
            </div>
          </div>

          <div className="dashboard-grid" style={{ marginTop: 32 }}>
            <Link to="/admin-analytics" className="dashboard-tile dashboard-tile--featured">
              <div className="dashboard-tile-icon">📊</div>
              <h3>Store Analytics</h3>
              <p>Charts, best sellers, revenue & engagement</p>
            </Link>
            <Link to="/manage-products" className="dashboard-tile">
              <div className="dashboard-tile-icon">🧶</div>
              <h3>Manage Products</h3>
              <p>Add, edit, or remove items</p>
            </Link>
            <Link to="/admin-orders" className="dashboard-tile">
              <div className="dashboard-tile-icon">📦</div>
              <h3>View Orders</h3>
              <p>See all customer orders</p>
            </Link>
            <Link to="/admin-users" className="dashboard-tile">
              <div className="dashboard-tile-icon">👥</div>
              <h3>User Management</h3>
              <p>View registered users and roles</p>
            </Link>
            <Link to="/admin-faq" className="dashboard-tile">
              <div className="dashboard-tile-icon">💬</div>
              <h3>Customer questions</h3>
              <p>Answer FAQs and publish to shoppers</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;