
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const storedUser = localStorage.getItem("user");

  console.log("=== PROTECTED ROUTE ===");
  console.log("Allowed role:", allowedRole);
  console.log("Stored user:", storedUser);

  if (!storedUser) {
    console.log("❌ No user found");
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    console.log("❌ Invalid user JSON");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  console.log("User role:", user.role);

  if (allowedRole && user.role !== allowedRole) {
    console.log(
      "❌ Role mismatch:",
      user.role,
      "!=",
      allowedRole
    );

    return <Navigate to="/login" replace />;
  }

  console.log("✅ Access granted");

  return children;
}

export default ProtectedRoute;
