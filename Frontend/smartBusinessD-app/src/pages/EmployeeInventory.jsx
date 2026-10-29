
import { useEffect, useState } from "react";
import axios from "axios";

import EmployeeSidebar from "../components/dashboard/EmployeeSidebar";
import EmployeeNavbar from "../components/dashboard/EmployeeNavbar";

import ManagerSidebar from "../components/dashboard/ManagerSidebar";
import ManagerNavbar from "../components/dashboard/ManagerNavbar";

import "../styles/EmployeeInventory.css";

function EmployeeInventory() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

 
  // GET LOGGED USER
  const storedUser = localStorage.getItem("user");
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error reading user:", error);
  }

  const isManager = user?.role === "manager";

  console.log("User:", user);
  console.log("Role:", user?.role);
  console.log("Is Manager:", isManager);
  
  // =========================================
  // GET PRODUCTS
  // =========================================

  const fetchInventory = async () => {

    try {

      const response = await axios.get(
        "http://localhost:5000/products"
      );

      setProducts(response.data);

    } catch (error) {

      console.error(
        "Error fetching inventory:",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================================
  // LOAD DATA
  // =========================================

  useEffect(() => {
    fetchInventory();
  }, []);

  // =========================================
  // STATISTICS
  // =========================================

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.quantity || 0),
    0
  );

  const lowStock = products.filter(
    (product) => {
      const quantity = Number(product.quantity || 0);

      return quantity > 0 && quantity <= 5;
    }
  );

  const outOfStock = products.filter(
    (product) =>
      Number(product.quantity || 0) === 0
  );

  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts = products.filter(
    (product) => {

      const quantity =
        Number(product.quantity || 0);

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
    }
  );

  // =========================================
  // RENDER
  // =========================================

  return (

    <div className="dashboard-layout">

      {/* ================================
          SIDEBAR
      ================================= */}

      {isManager ? (
        <ManagerSidebar />
      ) : (
        <EmployeeSidebar />
      )}

      <main className="dashboard-content">

        {/* ================================
            NAVBAR
        ================================= */}

        {isManager ? (
          <ManagerNavbar />
        ) : (
          <EmployeeNavbar />
        )}

        {/* ================================
            HEADER
        ================================= */}

        <div className="inventory-header">

          <div>

            <h1>
              Inventory
            </h1>

            <p>
              Monitor your stock and inventory levels.
            </p>

          </div>

        </div>

        {/* ================================
            LOADING
        ================================= */}

        {loading ? (

          <div className="inventory-loading">
            Loading inventory...
          </div>

        ) : (

          <>

            {/* ================================
                STAT CARDS
            ================================= */}

            <div className="inventory-stats">

              {/* TOTAL PRODUCTS */}

              <button
                type="button"
                className={`inventory-stat-card ${
                  filter === "all"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilter("all")
                }
              >

                <span className="inventory-stat-icon">
                  📦
                </span>

                <div>

                  <p>
                    Total Products
                  </p>

                  <h2>
                    {totalProducts}
                  </h2>

                </div>

              </button>


              {/* TOTAL STOCK */}

              <button
                type="button"
                className={`inventory-stat-card ${
                  filter === "totalStock"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilter("totalStock")
                }
              >

                <span className="inventory-stat-icon">
                  📊
                </span>

                <div>

                  <p>
                    Total Stock
                  </p>

                  <h2>
                    {totalStock}
                  </h2>

                </div>

              </button>


              {/* LOW STOCK */}

              <button
                type="button"
                className={`inventory-stat-card ${
                  filter === "low"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilter("low")
                }
              >

                <span className="inventory-stat-icon">
                  ⚠️
                </span>

                <div>

                  <p>
                    Low Stock
                  </p>

                  <h2>
                    {lowStock.length}
                  </h2>

                </div>

              </button>


              {/* OUT OF STOCK */}

              <button
                type="button"
                className={`inventory-stat-card ${
                  filter === "out"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilter("out")
                }
              >

                <span className="inventory-stat-icon">
                  🔴
                </span>

                <div>

                  <p>
                    Out of Stock
                  </p>

                  <h2>
                    {outOfStock.length}
                  </h2>

                </div>

              </button>

            </div>


            {/* ================================
                INVENTORY TABLE
            ================================= */}

            <div className="inventory-card">

              <div className="inventory-card-header">

                <div>

                  <h2>
                    Stock Overview
                  </h2>

                  <p>
                    Current stock levels of all products
                  </p>

                </div>

              </div>


              {filteredProducts.length === 0 ? (

                <div className="inventory-empty">

                  {filter === "low" &&
                    "No low stock products."}

                  {filter === "out" &&
                    "No out of stock products."}

                  {filter === "totalStock" &&
                    "No products currently in stock."}

                  {filter === "all" &&
                    "No products available."}

                </div>

              ) : (

                <div className="inventory-table-container">

                  <table className="inventory-table">

                    <thead>

                      <tr>

                        <th>
                          Product
                        </th>

                        <th>
                          Category
                        </th>

                        <th>
                          Brand
                        </th>

                        <th>
                          Stock
                        </th>

                        <th>
                          Status
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredProducts.map(
                        (product) => {

                          const quantity =
                            Number(
                              product.quantity || 0
                            );

                          let status =
                            "Available";

                          let statusClass =
                            "inventory-status-ok";


                          if (quantity === 0) {

                            status =
                              "Out of Stock";

                            statusClass =
                              "inventory-status-out";

                          } else if (
                            quantity <= 5
                          ) {

                            status =
                              "Low Stock";

                            statusClass =
                              "inventory-status-low";

                          }


                          return (

                            <tr
                              key={product._id}
                            >

                              <td>
                                {product.name}
                              </td>

                              <td>
                                {product.category}
                              </td>

                              <td>
                                {product.brand}
                              </td>

                              <td>

                                <strong>
                                  {quantity}
                                </strong>

                              </td>

                              <td>

                                <span
                                  className={
                                    statusClass
                                  }
                                >
                                  {status}
                                </span>

                              </td>

                            </tr>

                          );

                        }
                      )}

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

