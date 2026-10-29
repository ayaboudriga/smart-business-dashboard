import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaBell, FaUserCircle } from "react-icons/fa";

function EmployeeNavbar() {
  const [user, setUser] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
    useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/products"
      );

      const lowStock = response.data.filter(
        (product) => Number(product.quantity) <= 5
      );

      setLowStockProducts(lowStock);

    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error
      );
    }
  };

  useEffect(() => {

    fetchNotifications();

    const interval = setInterval(
      fetchNotifications,
      10000
    );

    return () => clearInterval(interval);

  }, []);

  return (
    <header className="dashboard-navbar">

      {/* Search */}

      <div className="navbar-search">

        <FaSearch />

        <input
          type="text"
          placeholder="Search..."
        />

      </div>


      {/* Right */}

      <div className="navbar-right">

        {/* Notifications */}

        <div className="notification-wrapper">

          <button
            className="notification-btn"
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
          >

            <FaBell />

            {lowStockProducts.length > 0 && (
              <span className="notification-count">
                {lowStockProducts.length}
              </span>
            )}

          </button>


          {/* Notification Panel */}

          {showNotifications && (

            <div className="notification-panel">

              <div className="notification-header">

                <div>
                  <h3>Notifications</h3>

                  <p>
                    Stock alerts
                  </p>
                </div>

              </div>


              {lowStockProducts.length === 0 ? (

                <div className="no-notifications">

                  <span>✅</span>

                  <p>
                    No stock alerts.
                  </p>

                </div>

              ) : (

                <div className="notification-list">

                  {lowStockProducts.map(
                    (product) => {

                      const quantity =
                        Number(
                          product.quantity
                        );

                      return (

                        <div
                          className="notification-item"
                          key={product._id}
                        >

                          <div className="notification-icon">
                            {quantity === 0
                              ? "🔴"
                              : "⚠️"}
                          </div>


                          <div className="notification-info">

                            <strong>
                              {product.name}
                            </strong>

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

                    }
                  )}

                </div>

              )}

            </div>

          )}

        </div>


        {/* Profile */}

        <div className="navbar-profile">

          <FaUserCircle className="profile-icon" />

          <div className="profile-info">

            <strong>
                {user?.name || "Employee"}
            </strong>

            <span>
                Employee
            </span>

            </div>

        </div>

      </div>

    </header>
  );
}

export default EmployeeNavbar;