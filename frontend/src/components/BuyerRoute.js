import { Navigate } from "react-router-dom";

function BuyerRoute({ children }) {
  const role = localStorage.getItem("role");
  if (role === "buyer") return children;
  if (role === "admin") return <Navigate to="/dashboard" />;
  return <Navigate to="/login" />;
}

export default BuyerRoute;