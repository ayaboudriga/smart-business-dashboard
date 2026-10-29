import { useEffect, useState } from "react";
import axios from "axios";

import ManagerSidebar from "../components/dashboard/ManagerSidebar";
import ManagerNavbar from "../components/dashboard/ManagerNavbar";

import "../styles/ManagerDashboard.css";

function ManagerDashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================================
  // Fetch Products + Sales
  // ================================

  const fetchData = async () => {
    try {
      const [productsResponse, salesResponse] = await Promise.all([
        axios.get("http://localhost:5000/products"),
        axios.get("http://localhost:5000/sales"),
      ]);

      setProducts(productsResponse.data);
      setSales(salesResponse.data);
    } catch (error) {
      console.error(
        "Error loading manager dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================================
  // Statistics
  // ================================

  const totalProducts = products.length;

  const totalSales = sales.length;

  const totalRevenue = sales.reduce(
    (total, sale) =>
      total + Number(sale.totalPrice || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) => {
      const quantity = Number(product.quantity);

      return quantity > 0 && quantity <= 5;
    }
  );

  const outOfStockProducts = products.filter(
    (product) =>
      Number(product.quantity) === 0
  );

  // ================================
  // Top Selling Products
  // ================================

  const productSales = {};

  sales.forEach((sale) => {
    const productId = sale.product?._id;

    const productName =
      sale.product?.name || "Unknown";

    if (!productId) return;

    if (!productSales[productId]) {
      productSales[productId] = {
        name: productName,
        quantity: 0,
      };
    }

    productSales[productId].quantity +=
      Number(sale.quantity || 0);
  });

  const topProducts = Object.values(productSales)
    .sort(
      (a, b) =>
        b.quantity - a.quantity
    )
    .slice(0, 5);

  // ================================
  // Render
  // ================================

  return (
    <div className="dashboard-layout">

      <ManagerSidebar />

      <main className="dashboard-content">

        <ManagerNavbar />

        {/* HEADER */}

        <div className="manager-header">

          <div>
            <h1>
              Manager Dashboard
            </h1>

            <p>
              Overview of your business performance.
            </p>
          </div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="manager-loading">
            Loading dashboard...
          </div>

        ) : (

          <>

            {/* ================================
                KPI CARDS
            ================================= */}

            <div className="manager-stats">

              <div className="manager-stat-card">

                <div className="manager-stat-icon">
                  💰
                </div>

                <div>
                  <p>Total Revenue</p>

                  <h2>
                    {totalRevenue.toLocaleString()} TND
                  </h2>
                </div>

              </div>


              <div className="manager-stat-card">

                <div className="manager-stat-icon">
                  🛒
                </div>

                <div>
                  <p>Total Sales</p>

                  <h2>
                    {totalSales}
                  </h2>
                </div>

              </div>


              <div className="manager-stat-card">

                <div className="manager-stat-icon">
                  📦
                </div>

                <div>
                  <p>Total Products</p>

                  <h2>
                    {totalProducts}
                  </h2>
                </div>

              </div>


              <div className="manager-stat-card">

                <div className="manager-stat-icon">
                  ⚠️
                </div>

                <div>
                  <p>Low Stock</p>

                  <h2>
                    {lowStockProducts.length}
                  </h2>
                </div>

              </div>

            </div>


            {/* ================================
                BUSINESS OVERVIEW
            ================================= */}

            <div className="manager-grid">


              {/* TOP PRODUCTS */}

              <div className="manager-card">

                <div className="manager-card-header">

                  <div>

                    <h2>
                      Top Selling Products
                    </h2>

                    <p>
                      Best performing products
                    </p>

                  </div>

                </div>


                {topProducts.length === 0 ? (

                  <div className="manager-empty">
                    No sales data available.
                  </div>

                ) : (

                  <div className="top-products-list">

                    {topProducts.map(
                      (product, index) => (

                        <div
                          className="top-product-item"
                          key={index}
                        >

                          <div className="top-product-number">
                            {index + 1}
                          </div>

                          <div className="top-product-info">

                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              {product.quantity} units sold
                            </span>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* STOCK ALERTS */}

              <div className="manager-card">

                <div className="manager-card-header">

                  <div>

                    <h2>
                      Stock Alerts
                    </h2>

                    <p>
                      Products requiring attention
                    </p>

                  </div>

                </div>


                {lowStockProducts.length === 0 &&
                outOfStockProducts.length === 0 ? (

                  <div className="manager-empty">
                    ✅ Stock levels are healthy.
                  </div>

                ) : (

                  <div className="stock-alert-list">

                    {/* OUT OF STOCK */}

                    {outOfStockProducts
                      .slice(0, 3)
                      .map((product) => (

                        <div
                          className="stock-alert-item out"
                          key={product._id}
                        >

                          <span>
                            🔴
                          </span>

                          <div>

                            <strong>
                              {product.name}
                            </strong>

                            <p>
                              Out of stock
                            </p>

                          </div>

                        </div>

                      ))}


                    {/* LOW STOCK */}

                    {lowStockProducts
                      .slice(0, 3)
                      .map((product) => (

                        <div
                          className="stock-alert-item low"
                          key={product._id}
                        >

                          <span>
                            ⚠️
                          </span>

                          <div>

                            <strong>
                              {product.name}
                            </strong>

                            <p>
                              Only {product.quantity} left
                            </p>

                          </div>

                        </div>

                      ))}

                  </div>

                )}

              </div>

            </div>


            {/* ================================
                RECENT SALES
            ================================= */}

            <div className="manager-card">

              <div className="manager-card-header">

                <div>

                  <h2>
                    Recent Sales
                  </h2>

                  <p>
                    Latest business transactions
                  </p>

                </div>

              </div>


              {sales.length === 0 ? (

                <div className="manager-empty">
                  No sales available.
                </div>

              ) : (

                <div className="manager-table-container">

                  <table className="manager-table">

                    <thead>

                      <tr>

                        <th>Product</th>

                        <th>Customer</th>

                        <th>Quantity</th>

                        <th>Revenue</th>

                        <th>Date</th>

                      </tr>

                    </thead>


                    <tbody>

                      {sales
                        .slice(0, 5)
                        .map((sale) => (

                          <tr
                            key={sale._id}
                          >

                            <td>
                              {sale.product?.name ||
                                "Unknown"}
                            </td>

                            <td>
                              {sale.customer ||
                                "Walk-in Customer"}
                            </td>

                            <td>
                              {sale.quantity}
                            </td>

                            <td>
                              {sale.totalPrice} TND
                            </td>

                            <td>
                              {new Date(
                                sale.createdAt
                              ).toLocaleDateString()}
                            </td>

                          </tr>

                        ))}

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

export default ManagerDashboard;
