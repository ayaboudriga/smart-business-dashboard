
import { useEffect, useState } from "react";
import axios from "axios";

import AdminSidebar from "../components/dashboard/AdminSidebar";
import AdminNavbar from "../components/dashboard/AdminNavbar";
import "../styles/AdminDashboard.css";

function AdminIcon({ type, size = 24 }) {
  const icons = {
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    package: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 8 9 5 9-5" />
        <path d="M3 8v9l9 5 9-5V8" />
        <path d="M12 13v9" />
      </>
    ),
    cart: (
      <>
        <circle cx="9" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2 3h2l3 12a2 2 0 0 0 2 1.5h9.5a2 2 0 0 0 2-1.5L22 7H5" />
      </>
    ),
    revenue: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
        <path d="M12 3v3" />
      </>
    ),
    warning: (
      <>
        <path d="M12 3 22 20H2L12 3Z" />
        <path d="M12 9v5" />
        <path d="M12 17h.01" />
      </>
    ),
    success: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
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

  // KPIs
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
  );

  const lowStockCount = lowStockProducts.length;

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
            <div className="kpi-icon">
              <AdminIcon type="users" />
            </div>
            <div>
              <span>Total Users</span>
              <strong>{totalUsers}</strong>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon">
              <AdminIcon type="package" />
            </div>
            <div>
              <span>Total Products</span>
              <strong>{totalProducts}</strong>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon">
              <AdminIcon type="cart" />
            </div>
            <div>
              <span>Total Sales</span>
              <strong>{totalSales}</strong>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-icon">
              <AdminIcon type="revenue" />
            </div>
            <div>
              <span>Total Revenue</span>
              <strong>
                {totalRevenue.toLocaleString("en-US")} TND
              </strong>
            </div>
          </div>

          <div className="admin-kpi-card warning">
            <div className="kpi-icon">
              <AdminIcon type="warning" />
            </div>
            <div>
              <span>Low Stock</span>
              <strong>{lowStockCount}</strong>
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
                <p>Quick overview of your platform</p>
              </div>
            </div>

            <div className="overview-list">
              <div className="overview-item">
                <span>
                  <AdminIcon type="users" size={19} />
                  Users
                </span>
                <strong>{totalUsers}</strong>
              </div>

              <div className="overview-item">
                <span>
                  <AdminIcon type="package" size={19} />
                  Products
                </span>
                <strong>{totalProducts}</strong>
              </div>

              <div className="overview-item">
                <span>
                  <AdminIcon type="cart" size={19} />
                  Sales
                </span>
                <strong>{totalSales}</strong>
              </div>

              <div className="overview-item">
                <span>
                  <AdminIcon type="warning" size={19} />
                  Low Stock
                </span>
                <strong>{lowStockCount}</strong>
              </div>
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="admin-panel">
            <div className="panel-header">
              <div>
                <h2>Low Stock Products</h2>
                <p>Products that need attention</p>
              </div>
            </div>

            <div className="low-stock-list">
              {lowStockProducts.length === 0 ? (
                <div className="empty-state">
                  <AdminIcon type="success" size={20} />
                  <span>
                    All products have sufficient stock
                  </span>
                </div>
              ) : (
                lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    className="stock-item"
                    key={product._id}
                  >
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.category}</span>
                    </div>

                    <b>{product.quantity} left</b>
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
