import { useEffect, useState } from "react";
import axios from "axios";


import AdminSidebar from "../components/dashboard/AdminSidebar";
import AdminNavbar from "../components/dashboard/AdminNavbar";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersResponse, productsResponse, salesResponse] =
          await Promise.all([
            axios.get("http://localhost:5000/user"),
            axios.get("http://localhost:5000/products"),
            axios.get("http://localhost:5000/sales"),
          ]);

        setUsers(
          Array.isArray(usersResponse.data)
            ? usersResponse.data
            : usersResponse.data.users || []
        );

        setProducts(
          Array.isArray(productsResponse.data)
            ? productsResponse.data
            : productsResponse.data.products || []
        );

        setSales(
          Array.isArray(salesResponse.data)
            ? salesResponse.data
            : salesResponse.data.sales || []
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =========================
  // KPIs
  // =========================

  const totalUsers = users.length;

  const totalProducts = products.length;

  const totalSales = sales.length;

  const totalRevenue = sales.reduce((total, sale) => {
    const amount =
      Number(sale.total) ||
      Number(sale.totalAmount) ||
      Number(sale.amount) ||
      0;

    return total + amount;
  }, 0);

  const lowStockProducts = products.filter(
    (product) => Number(product.quantity) <= 5
  ).length;

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        
        <main className="admin-main">
          <div className="admin-loading">
            Loading dashboard...
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // Dashboard
  // =========================

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminNavbar />
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>
              Overview of your business and system performance
            </p>
          </div>

          <div className="admin-date">
            {new Date().toLocaleDateString("en-GB")}
          </div>
        </div>

        {/* KPI Cards */}
        <section className="admin-kpis">

          <div className="admin-kpi-card">
            <div className="kpi-icon">👥</div>

            <div>
              <span>Total Users</span>
              <strong>{totalUsers}</strong>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon">📦</div>

            <div>
              <span>Total Products</span>
              <strong>{totalProducts}</strong>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon">🛒</div>

            <div>
              <span>Total Sales</span>
              <strong>{totalSales}</strong>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon">💰</div>

            <div>
              <span>Total Revenue</span>

              <strong>
                {totalRevenue.toLocaleString("en-US")} TND
              </strong>
            </div>
          </div>

          <div className="admin-kpi-card warning">
            <div className="kpi-icon">⚠️</div>

            <div>
              <span>Low Stock</span>
              <strong>{lowStockProducts}</strong>
            </div>
          </div>

        </section>

        {/* Dashboard Content */}
        <section className="admin-content-grid">

          {/* System Overview */}
          <div className="admin-panel">

            <div className="panel-header">
              <div>
                <h2>System Overview</h2>

                <p>
                  Quick overview of your platform
                </p>
              </div>
            </div>

            <div className="overview-list">

              <div className="overview-item">
                <span>👥 Users</span>
                <strong>{totalUsers}</strong>
              </div>

              <div className="overview-item">
                <span>📦 Products</span>
                <strong>{totalProducts}</strong>
              </div>

              <div className="overview-item">
                <span>🛒 Sales</span>
                <strong>{totalSales}</strong>
              </div>

              <div className="overview-item">
                <span>⚠️ Low Stock</span>
                <strong>{lowStockProducts}</strong>
              </div>

            </div>
          </div>

          {/* Low Stock Products */}
          <div className="admin-panel">

            <div className="panel-header">
              <div>
                <h2>Low Stock Products</h2>

                <p>
                  Products that need attention
                </p>
              </div>
            </div>

            <div className="low-stock-list">

              {products.filter(
                (product) => Number(product.quantity) <= 5
              ).length === 0 ? (

                <div className="empty-state">
                  ✅ All products have sufficient stock
                </div>

              ) : (

                products
                  .filter(
                    (product) => Number(product.quantity) <= 5
                  )
                  .slice(0, 5)
                  .map((product) => (

                    <div
                      className="stock-item"
                      key={product._id}
                    >

                      <div>
                        <strong>{product.name}</strong>

                        <span>
                          {product.category}
                        </span>
                      </div>

                      <b>
                        {product.quantity} left
                      </b>

                    </div>

                  ))
              )}

            </div>
          </div>

        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;