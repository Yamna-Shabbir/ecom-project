import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import OrderSuccess from "./pages/OrderSuccess";
import ManageProducts from "./pages/ManageProducts";
import AdminOrders from "./pages/AdminOrders";
import Dashboard from "./pages/Dashboard";
import Wishlist from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails";
import AdminUsers from "./pages/AdminUsers";
import Faq from "./pages/Faq";
import AdminFaq from "./pages/AdminFaq";
import AdminAnalytics from "./pages/AdminAnalytics";
import BuyerRoute from "./components/BuyerRoute";
import AdminRoute from "./components/AdminRoute";
import ChatbotWidget from "./components/ChatbotWidget";
import "./index.css";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_test_replace_me");

function RootRedirect() {
  const role = localStorage.getItem("role");
  if (role === "admin") return <Navigate to="/dashboard" replace />;
  if (role === "buyer") return <Navigate to="/shop" replace />;
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Elements stripe={stripePromise}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Buyer */}
          <Route path="/home" element={<BuyerRoute><Home /></BuyerRoute>} />
          <Route path="/shop" element={<BuyerRoute><Shop /></BuyerRoute>} />
          <Route path="/cart" element={<BuyerRoute><Cart /></BuyerRoute>} />
          <Route path="/my-orders" element={<BuyerRoute><MyOrders /></BuyerRoute>} />
          <Route path="/order-success" element={<BuyerRoute><OrderSuccess /></BuyerRoute>} />
          <Route path="/wishlist" element={<BuyerRoute><Wishlist /></BuyerRoute>} />
          <Route path="/faq" element={<BuyerRoute><Faq /></BuyerRoute>} />
          <Route path="/products/:id" element={<BuyerRoute><ProductDetails /></BuyerRoute>} />

          {/* Admin */}
          <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/manage-products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
          <Route path="/admin-orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin-users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin-faq" element={<AdminRoute><AdminFaq /></AdminRoute>} />
          <Route path="/admin-analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </Elements>
      <ChatbotWidget />
    </BrowserRouter>
  );
}

export default App;