
import { NavLink, useNavigate } from "react-router-dom";
import "../../styles/ManagerSidebar.css";

function ManagerSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>NovaTech</h2>
        <span>Manager Panel</span>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/manager-dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/manager-products">
          Products
        </NavLink>

        

        <NavLink to="/manager-sales">
          Sales
        </NavLink>

        <NavLink to="/manager-reports">
          Reports
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default ManagerSidebar;