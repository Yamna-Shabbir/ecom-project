import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SeoHead from "../components/SeoHead";

const CHART_COLORS = ["#8B5E4B", "#C9A88A", "#E8C4B8", "#6B4423", "#D4A574", "#A67B5B", "#F0D9CE", "#4b2e20"];

function formatMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function formatShortDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonth(ym) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

function ChartCard({ title, subtitle, children, wide }) {
  return (
    <div className={`analytics-chart-card${wide ? " analytics-chart-card--wide" : ""}`}>
      <div className="analytics-chart-head">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="analytics-chart-body">{children}</div>
    </div>
  );
}

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    axios
      .get(`${API_URL}/api/orders/analytics`, { params: { days } })
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load analytics. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, [days]);

  const summary = data?.summary || {};
  const revenueTimeline = (data?.revenueTimeline || []).map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }));
  const topProducts = (data?.topProducts || []).map((p) => ({
    name: p.name?.length > 18 ? `${p.name.slice(0, 16)}…` : p.name,
    fullName: p.name,
    sold: p.soldQuantity,
    revenue: p.revenue,
  }));
  const statusData = data?.ordersByStatus || [];
  const paymentData = (data?.paymentBreakdown || []).map((p) => ({
    name: p.method,
    value: p.count,
    revenue: p.revenue,
  }));
  const categoryData = (data?.revenueByCategory || []).map((c) => ({
    name: c.category?.length > 14 ? `${c.category.slice(0, 12)}…` : c.category,
    fullName: c.category,
    revenue: c.revenue,
    units: c.units,
  }));
  const viewedData = (data?.topViewed || []).map((v) => ({
    name: v.name?.length > 16 ? `${v.name.slice(0, 14)}…` : v.name,
    fullName: v.name,
    views: v.views,
    clicks: v.clicks,
  }));
  const monthlyData = (data?.monthlyRevenue || []).map((m) => ({
    ...m,
    label: formatMonth(m.month),
  }));

  return (
    <div className="page analytics-page">
      <SeoHead
        title="Store Analytics | Gulkaar Admin"
        description="Revenue, best sellers, engagement, and order insights."
        keywords="admin,analytics,dashboard,charts"
      />

      <div className="analytics-hero">
        <div>
          <p className="analytics-eyebrow">Admin · Insights</p>
          <h1>Store Analytics</h1>
          <p className="analytics-hero-sub">
            Revenue trends, best sellers, shopper engagement, and order health — all in one place.
          </p>
        </div>
        <div className="analytics-hero-actions">
          <label className="analytics-range-label">
            Range
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="analytics-select">
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </label>
          <Link to="/dashboard" className="btn-outline analytics-back">
            ← Dashboard
          </Link>
        </div>
      </div>

      {loading && <p className="analytics-loading">Loading analytics…</p>}
      {error && <p className="analytics-error">{error}</p>}

      {!loading && !error && data && (
        <>
          <div className="analytics-kpi-grid">
            <div className="analytics-kpi">
              <span className="analytics-kpi-icon">💰</span>
              <p className="analytics-kpi-label">Total revenue</p>
              <p className="analytics-kpi-value">{formatMoney(summary.totalRevenue)}</p>
            </div>
            <div className="analytics-kpi">
              <span className="analytics-kpi-icon">📦</span>
              <p className="analytics-kpi-label">Orders</p>
              <p className="analytics-kpi-value">{summary.ordersCount}</p>
            </div>
            <div className="analytics-kpi">
              <span className="analytics-kpi-icon">🧾</span>
              <p className="analytics-kpi-label">Avg order value</p>
              <p className="analytics-kpi-value">{formatMoney(summary.avgOrderValue)}</p>
            </div>
            <div className="analytics-kpi">
              <span className="analytics-kpi-icon">👥</span>
              <p className="analytics-kpi-label">Unique customers</p>
              <p className="analytics-kpi-value">{summary.uniqueCustomers}</p>
            </div>
            <div className="analytics-kpi">
              <span className="analytics-kpi-icon">🧶</span>
              <p className="analytics-kpi-label">Products listed</p>
              <p className="analytics-kpi-value">{summary.productsCount}</p>
            </div>
            <div className="analytics-kpi">
              <span className="analytics-kpi-icon">⭐</span>
              <p className="analytics-kpi-label">Avg review</p>
              <p className="analytics-kpi-value">
                {summary.reviewCount ? `${summary.avgReview.toFixed(1)} / 5` : "—"}
              </p>
              {summary.reviewCount > 0 && (
                <p className="analytics-kpi-hint">{summary.reviewCount} reviews</p>
              )}
            </div>
          </div>

          <div className="analytics-grid">
            <ChartCard title="Revenue over time" subtitle={`Daily revenue & orders · last ${days} days`} wide>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueTimeline}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5E4B" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#E8C4B8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 94, 75, 0.15)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8B7355" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#8B7355" }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E8C4B8",
                      background: "#FFFBF7",
                    }}
                    formatter={(value, name) =>
                      name === "revenue" ? [formatMoney(value), "Revenue"] : [value, "Orders"]
                    }
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.date ? formatShortDate(payload[0].payload.date) : ""
                    }
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#8B5E4B"
                    fill="url(#revGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Best sellers" subtitle="Top products by units sold (all time)">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topProducts} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 94, 75, 0.12)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#8B7355" }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: "#6B4423" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #E8C4B8", background: "#FFFBF7" }}
                    formatter={(v, name) => (name === "sold" ? [v, "Units sold"] : [formatMoney(v), "Revenue"])}
                    labelFormatter={(_, p) => p?.[0]?.payload?.fullName || ""}
                  />
                  <Bar dataKey="sold" name="Units sold" radius={[0, 6, 6, 0]}>
                    {topProducts.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Order status" subtitle="Fulfillment pipeline">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    label={({ status, count }) => `${status} (${count})`}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E8C4B8" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Payment methods" subtitle="Orders by checkout type">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={88}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {paymentData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, _, item) => [
                      `${v} orders · ${formatMoney(item.payload.revenue)}`,
                      item.payload.name,
                    ]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E8C4B8" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Revenue by category" subtitle="Where your money comes from">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 94, 75, 0.12)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8B7355" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#8B7355" }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    labelFormatter={(_, p) => p?.[0]?.payload?.fullName || ""}
                    formatter={(v) => [formatMoney(v), "Revenue"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E8C4B8" }}
                  />
                  <Bar dataKey="revenue" fill="#8B5E4B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Most viewed products" subtitle={`Shopper interest · last ${days} days`}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={viewedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 94, 75, 0.12)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#8B7355" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#8B7355" }} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(_, p) => p?.[0]?.payload?.fullName || ""}
                    contentStyle={{ borderRadius: 8, border: "1px solid #E8C4B8" }}
                  />
                  <Legend />
                  <Bar dataKey="views" name="Views" fill="#C9A88A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" name="Clicks" fill="#8B5E4B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {monthlyData.length > 0 && (
              <ChartCard title="Monthly revenue" subtitle="Last 6 months" wide>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 94, 75, 0.12)" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8B7355" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#8B7355" }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(v, name) =>
                        name === "revenue" ? [formatMoney(v), "Revenue"] : [v, "Orders"]
                      }
                      contentStyle={{ borderRadius: 8, border: "1px solid #E8C4B8" }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="#8B5E4B" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="orders" name="Orders" fill="#E8C4B8" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>

          <div className="analytics-bottom">
            <div className="admin-card analytics-table-card">
              <h3>Top products — full breakdown</h3>
              <p className="analytics-table-sub">Ranked by units sold across all orders</p>
              {topProducts.length === 0 ? (
                <p className="analytics-empty">No sales data yet. Orders will populate this table.</p>
              ) : (
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Units sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.topProducts || []).map((p, i) => (
                      <tr key={p._id || i}>
                        <td>{i + 1}</td>
                        <td>{p.name}</td>
                        <td>{p.soldQuantity}</td>
                        <td>{formatMoney(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="admin-card analytics-recent-card">
              <h3>Recent orders</h3>
              <ul className="analytics-recent-list">
                {(data.recentOrders || []).map((o) => (
                  <li key={o._id} className="analytics-recent-item">
                    <div>
                      <strong>{o.buyerName}</strong>
                      <span className="analytics-recent-meta">
                        {o.paymentMethod} · {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="analytics-recent-right">
                      <span className="status-badge" style={{ background: "#fffaf0", border: "1px solid #f0d9a6", color: "#8c6a24" }}>
                        {o.status || "Pending"}
                      </span>
                      <strong>{formatMoney(o.totalPrice)}</strong>
                    </span>
                  </li>
                ))}
                {!data.recentOrders?.length && (
                  <p className="analytics-empty">No orders yet.</p>
                )}
              </ul>
              <Link to="/admin-orders" className="btn-primary analytics-orders-link">
                Manage all orders →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminAnalytics;
