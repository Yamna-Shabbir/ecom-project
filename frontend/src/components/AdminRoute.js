import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const role = localStorage.getItem("role");
  if (role === "admin") return children;
  if (role === "buyer") return <Navigate to="/shop" />;
  return <Navigate to="/login" />;
}

export default AdminRoute;