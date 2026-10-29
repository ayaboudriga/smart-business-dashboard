import { Link } from "react-router-dom";

function EmployeeSidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <h2>NovaTech</h2>
        <span>Solutions</span>
      </div>

      <nav className="sidebar-menu">

        <Link to="/employee-dashboard">
           Dashboard
        </Link>

        <Link to="/employee-products">
           Products
        </Link>

        <Link to="/employee-sales">
           Sales
        </Link>

        <Link to="/employee-inventory">
           Inventory
        </Link>

      </nav>

      <div className="sidebar-bottom">

        <button
            onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/login";
            }}
            className="logout-btn"
        >
            Logout
        </button>

        </div>

    </aside>
  );
}

export default EmployeeSidebar;