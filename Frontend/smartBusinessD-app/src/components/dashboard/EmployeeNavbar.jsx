
import { useEffect, useState } from "react";
import axios from "axios";

function NavbarIcon({ type, size = 20 }) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    success: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    warning: (
      <>
        <path d="M12 3 22 20H2L12 3Z" />
        <path d="M12 9v5" />
        <path d="M12 17h.01" />
      </>
    ),
    outOfStock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5" />
        <path d="M12 16h.01" />
      </>
    ),
  };

  return <svg {...commonProps}>{icons[type]}</svg>;
}

function EmployeeNavbar() {
  const [user, setUser] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error reading user:", error);
      }
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/products"
      );

      const products = Array.isArray(response.data)
        ? response.data
        : [];

      const lowStock = products.filter(
        (product) => Number(product.quantity) <= 5
      );

      setLowStockProducts(lowStock);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="dashboard-navbar">
      {/* Search */}
      <div className="navbar-search">
        <NavbarIcon type="search" size={19} />

        <input
          type="text"
          placeholder="Search..."
          aria-label="Search"
        />
      </div>

      {/* Right */}
      <div className="navbar-right">
        {/* Notifications */}
        <div className="notification-wrapper">
          <button
            type="button"
            className="notification-btn"
            onClick={() =>
              setShowNotifications((previous) => !previous)
            }
            aria-label="Show notifications"
            aria-expanded={showNotifications}
          >
            <NavbarIcon type="bell" size={21} />

            {lowStockProducts.length > 0 && (
              <span className="notification-count">
                {lowStockProducts.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-header">
                <div>
                  <h3>Notifications</h3>
                  <p>Stock alerts</p>
                </div>
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="no-notifications">
                  <span className="notification-status-icon success-icon">
                    <NavbarIcon type="success" size={24} />
                  </span>

                  <p>No stock alerts.</p>
                </div>
              ) : (
                <div className="notification-list">
                  {lowStockProducts.map((product) => {
                    const quantity = Number(product.quantity);

                    return (
                      <div
                        className="notification-item"
                        key={product._id}
                      >
                        <div
                          className={`notification-icon ${
                            quantity === 0
                              ? "stock-out-icon"
                              : "stock-low-icon"
                          }`}
                        >
                          <NavbarIcon
                            type={
                              quantity === 0
                                ? "outOfStock"
                                : "warning"
                            }
                            size={21}
                          />
                        </div>

                        <div className="notification-info">
                          <strong>{product.name}</strong>

                          {quantity === 0 ? (
                            <span className="notification-danger">
                              Out of stock
                            </span>
                          ) : (
                            <span>
                              Only {quantity} left in stock
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="navbar-profile">
          <span className="profile-icon">
            <NavbarIcon type="user" size={25} />
          </span>

          <div className="profile-info">
            <strong>{user?.name || "Employee"}</strong>
            <span>{user?.role || "Employee"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default EmployeeNavbar;
