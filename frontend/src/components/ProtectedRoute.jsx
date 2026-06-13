import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  // Redirect unauthenticated users to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;