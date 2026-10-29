import { NavLink, useNavigate } from "react-router-dom";
import { FaBox } from "react-icons/fa";
import "../../styles/AdminSidebar.css";
function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="admin-sidebar">

  <div className="admin-logo">
    <h2>NovaTech</h2>
    <span>Admin Panel</span>
  </div>

  <nav className="admin-nav">

    <NavLink to="/admin-dashboard">
      <span className="admin-nav-icon"></span>
      Dashboard
    </NavLink>

    <NavLink to="/admin-users">
      <span className="admin-nav-icon"></span>
      Users
    </NavLink>

    <NavLink to="/admin-products">
  <FaBox />
  <span>Products</span>
</NavLink>

    <NavLink to="/admin-products">
      <span className="admin-nav-icon"></span>
      Sales
    </NavLink>

    <NavLink to="/admin-reports">
      <span className="admin-nav-icon"></span>
      Reports
    </NavLink>

  </nav>

  <div className="admin-logout-container">
    <button
  className="admin-logout"
  onClick={handleLogout}
>
  <span className="admin-nav-icon"></span>
  Logout
</button>

    <div className="admin-role">
      <small>Connected as</small>
      <strong>Administrator</strong>
    </div>
  </div>

</aside>
  );
}

export default AdminSidebar;