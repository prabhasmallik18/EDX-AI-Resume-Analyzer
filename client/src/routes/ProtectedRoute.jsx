import { Navigate, Outlet } from "react-router-dom";

import { clearSession, getToken, isTokenValid } from "../utils/auth";

// Wrap pages that need login. No valid token -> go to the login page.
const ProtectedRoute = () => {
  const token = getToken();

  if (!isTokenValid(token)) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
