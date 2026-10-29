
import { useEffect, useState } from "react";
import axios from "axios";

import EmployeeSidebar from "../components/dashboard/EmployeeSidebar";
import EmployeeNavbar from "../components/dashboard/EmployeeNavbar";
import ManagerSidebar from "../components/dashboard/ManagerSidebar";
import ManagerNavbar from "../components/dashboard/ManagerNavbar";

import "../styles/EmployeeInventory.css";

function InventoryIcon({ type, size = 24 }) {
  const icons = {
    package: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 8 9 5 9-5" />
        <path d="M3 8v9l9 5 9-5V8" />
        <path d="M12 13v9" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <rect x="6" y="12" width="3.5" height="6" rx="1" />
        <rect x="11" y="8" width="3.5" height="10" rx="1" />
        <rect x="16" y="4" width="3.5" height="14" rx="1" />
      </>
    ),
    warning: (
      <>
        <path d="M12 3 22 20H2L12 3Z" />
        <path d="M12 9v5" />
        <path d="M12 17h.01" />
      </>
    ),
    out: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 8l8 8M16 8l-8 8" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[type]}
    </svg>
  );
}

function EmployeeInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Logged-in user
  const storedUser = localStorage.getItem("user");
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error reading user:", error);
  }

  const isManager = user?.role === "manager";

  // Get products
  const fetchInventory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/products"
      );

      setProducts(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Statistics
  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.quantity || 0),
    0
  );

  const lowStock = products.filter((product) => {
    const quantity = Number(product.quantity || 0);
    return quantity > 0 && quantity <= 5;
  });

  const outOfStock = products.filter(
    (product) => Number(product.quantity || 0) === 0
  );

  // Filter products
  const filteredProducts = products.filter((product) => {
    const quantity = Number(product.quantity || 0);

    if (filter === "low") {
      return quantity > 0 && quantity <= 5;
    }

    if (filter === "out") {
      return quantity === 0;
    }

    if (filter === "totalStock") {
      return quantity > 0;
    }

    return true;
  });

  const emptyMessages = {
    all: "No products available.",
    low: "No low stock products.",
    out: "No out of stock products.",
    totalStock: "No products currently in stock.",
  };

  return (
    <div className="dashboard-layout">
      {isManager ? <ManagerSidebar /> : <EmployeeSidebar />}

      <main className="dashboard-content">
        {isManager ? <ManagerNavbar /> : <EmployeeNavbar />}

        {/* Header */}
        <div className="inventory-header">
          <div>
            <h1>Inventory</h1>
            <p>Monitor your stock and inventory levels.</p>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="inventory-loading">
            Loading inventory...
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="inventory-stats">
              <button
                type="button"
                className={`inventory-stat-card ${
                  filter === "all" ? "active" : ""
                }`}
                onClick={() => setFilter("all")}
              >
                <span className="inventory-stat-icon">
                  <InventoryIcon type="package" />
                </span>

                <div>
                  <p>Total Products</p>
                  <h2>{totalProducts}</h2>
                </div>
              </button>

              <button
                type="button"
                className={`inventory-stat-card ${
                  filter === "totalStock" ? "active" : ""
                }`}
                onClick={() => setFilter("totalStock")}
              >
                <span className="inventory-stat-icon">
                  <InventoryIcon type="chart" />
                </span>

                <div>
                  <p>Total Stock</p>
                  <h2>{totalStock}</h2>
                </div>
              </button>

              <button
                type="button"
                className={`inventory-stat-card ${
                  filter === "low" ? "active" : ""
                }`}
                onClick={() => setFilter("low")}
              >
                <span className="inventory-stat-icon">
                  <InventoryIcon type="warning" />
                </span>

                <div>
                  <p>Low Stock</p>
                  <h2>{lowStock.length}</h2>
                </div>
              </button>

              <button
                type="button"
                className={`inventory-stat-card ${
                  filter === "out" ? "active" : ""
                }`}
                onClick={() => setFilter("out")}
              >
                <span className="inventory-stat-icon">
                  <InventoryIcon type="out" />
                </span>

                <div>
                  <p>Out of Stock</p>
                  <h2>{outOfStock.length}</h2>
                </div>
              </button>
            </div>

            {/* Inventory table */}
            <div className="inventory-card">
              <div className="inventory-card-header">
                <div>
                  <h2>Stock Overview</h2>
                  <p>Current stock levels of all products</p>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="inventory-empty">
                  {emptyMessages[filter]}
                </div>
              ) : (
                <div className="inventory-table-container">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredProducts.map((product) => {
                        const quantity = Number(
                          product.quantity || 0
                        );

                        let status = "Available";
                        let statusClass = "inventory-status-ok";

                        if (quantity === 0) {
                          status = "Out of Stock";
                          statusClass = "inventory-status-out";
                        } else if (quantity <= 5) {
                          status = "Low Stock";
                          statusClass = "inventory-status-low";
                        }

                        return (
                          <tr key={product._id}>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>{product.brand}</td>
                            <td>
                              <strong>{quantity}</strong>
                            </td>
                            <td>
                              <span className={statusClass}>
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default EmployeeInventory;
