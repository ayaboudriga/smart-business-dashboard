
import { useEffect, useState } from "react";
import axios from "axios";

import EmployeeSidebar from "../components/dashboard/EmployeeSidebar";
import EmployeeNavbar from "../components/dashboard/EmployeeNavbar";
import ManagerSidebar from "../components/dashboard/ManagerSidebar";
import ManagerNavbar from "../components/dashboard/ManagerNavbar";
import AdminSidebar from "../components/dashboard/AdminSidebar";

import "../styles/Sales.css";

// =========================================
// SVG ICONS
// =========================================

function SalesIcon({ type, size = 24 }) {
  const props = {
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
    sales: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h3" />
        <path d="M16 3v4" />
      </>
    ),

    revenue: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M16 8h-5a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H8" />
        <path d="M12 6v12" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
        <path d="m9 15 2 2 4-4" />
      </>
    ),

    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 3 5-7" />
        <path d="M16 6h4v4" />
      </>
    ),

    close: (
      <>
        <path d="m18 6-12 12M6 6l12 12" />
      </>
    ),

    empty: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
        <path d="M9 15h6" />
      </>
    ),
  };

  return <svg {...props}>{icons[type] || icons.sales}</svg>;
}

// =========================================
// SALES COMPONENT
// =========================================

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");

  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    customer: "",
  });

  const [loading, setLoading] = useState(true);

  // =========================================
  // GET LOGGED USER
  // =========================================

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error reading user:", error);
  }

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  // =========================================
  // GET SALES
  // =========================================

  const fetchSales = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/sales"
      );

      setSales(response.data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // GET PRODUCTS
  // =========================================

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/products"
      );

      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // =========================================
  // LOAD DATA
  // =========================================

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  // =========================================
  // STATISTICS
  // =========================================

  const totalSales = sales.length;

  const totalRevenue = sales.reduce(
    (total, sale) =>
      total + Number(sale.totalPrice || 0),
    0
  );

  const today = new Date();

  const todaySales = sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);

    return (
      saleDate.getDate() === today.getDate() &&
      saleDate.getMonth() === today.getMonth() &&
      saleDate.getFullYear() === today.getFullYear()
    );
  });

  const todayRevenue = todaySales.reduce(
    (total, sale) =>
      total + Number(sale.totalPrice || 0),
    0
  );

  // =========================================
  // FILTER SALES
  // =========================================

  const filteredSales = sales.filter((sale) => {
    const productName =
      sale.product?.name?.toLowerCase() || "";

    const customerName =
      sale.customer?.toLowerCase() || "";

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      productName.includes(search) ||
      customerName.includes(search);

    const saleDate = new Date(sale.createdAt);

    let matchesDate = true;

    if (dateFilter === "today") {
      matchesDate =
        saleDate.getDate() === today.getDate() &&
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear();
    }

    if (dateFilter === "week") {
      const weekAgo = new Date();

      weekAgo.setDate(today.getDate() - 7);

      matchesDate = saleDate >= weekAgo;
    }

    return matchesSearch && matchesDate;
  });

  // =========================================
  // HANDLE CHANGE
  // =========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================
  // CREATE SALE
  // =========================================

  const handleCreateSale = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/sales",
        {
          product: formData.product,
          quantity: Number(formData.quantity),
          customer: formData.customer,
        }
      );

      alert(response.data.message);

      setFormData({
        product: "",
        quantity: "",
        customer: "",
      });

      setShowForm(false);

      await fetchSales();
      await fetchProducts();
    } catch (error) {
      console.error("Error creating sale:", error);

      if (error.response) {
        alert(
          error.response.data.message ||
          "Error creating sale."
        );
      } else {
        alert("Unable to connect to the server.");
      }
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}

      {isAdmin ? (
        <AdminSidebar />
      ) : isManager ? (
        <ManagerSidebar />
      ) : (
        <EmployeeSidebar />
      )}

      <main className="dashboard-content">

        {/* NAVBAR */}

        {isAdmin ? (
          <ManagerNavbar />
        ) : isManager ? (
          <ManagerNavbar />
        ) : (
          <EmployeeNavbar />
        )}

        {/* HEADER */}

        <div className="sales-header">
          <div>
            <h1>Sales</h1>

            <p>
              Manage your sales and transactions
            </p>
          </div>

          <button
            type="button"
            className="add-sale-btn"
            onClick={() => setShowForm(true)}
          >
            + New Sale
          </button>
        </div>

        {/* SALES STATISTICS */}

        <div className="sales-stats">

          <div className="sales-stat-card">
            <div className="sales-stat-icon">
              <SalesIcon type="sales" />
            </div>

            <div>
              <p>Total Sales</p>
              <h2>{totalSales}</h2>
            </div>
          </div>

          <div className="sales-stat-card">
            <div className="sales-stat-icon">
              <SalesIcon type="revenue" />
            </div>

            <div>
              <p>Total Revenue</p>
              <h2>
                {totalRevenue.toLocaleString()} TND
              </h2>
            </div>
          </div>

          <div className="sales-stat-card">
            <div className="sales-stat-icon">
              <SalesIcon type="calendar" />
            </div>

            <div>
              <p>Today's Sales</p>
              <h2>{todaySales.length}</h2>
            </div>
          </div>

          <div className="sales-stat-card">
            <div className="sales-stat-icon">
              <SalesIcon type="chart" />
            </div>

            <div>
              <p>Today's Revenue</p>
              <h2>
                {todayRevenue.toLocaleString()} TND
              </h2>
            </div>
          </div>

        </div>

        {/* NEW SALE FORM */}

        {showForm && (
          <div className="sale-form-card">

            <div className="sale-form-header">
              <div>
                <h2>New Sale</h2>
                <p>
                  Enter the sale information below.
                </p>
              </div>

              <button
                type="button"
                className="close-sale-btn"
                onClick={() => setShowForm(false)}
                aria-label="Close sale form"
              >
                <SalesIcon type="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSale}>

              <div className="sale-form-grid">

                {/* PRODUCT */}

                <div className="sale-field">
                  <label htmlFor="sale-product">
                    Product
                  </label>

                  <select
                    id="sale-product"
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select product
                    </option>

                    {products.map((product) => (
                      <option
                        key={product._id}
                        value={product._id}
                        disabled={Number(product.quantity) <= 0}
                      >
                        {product.name} - Stock:{" "}
                        {product.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* QUANTITY */}

                <div className="sale-field">
                  <label htmlFor="sale-quantity">
                    Quantity
                  </label>

                  <input
                    id="sale-quantity"
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* CUSTOMER */}

                <div className="sale-field">
                  <label htmlFor="sale-customer">
                    Customer
                  </label>

                  <input
                    id="sale-customer"
                    type="text"
                    name="customer"
                    placeholder="Customer name"
                    value={formData.customer}
                    onChange={handleChange}
                  />
                </div>

              </div>

              {/* FORM BUTTONS */}

              <div className="sale-form-actions">

                <button
                  type="button"
                  className="cancel-sale-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-sale-btn"
                >
                  Create Sale
                </button>

              </div>

            </form>
          </div>
        )}

        {/* SALES TABLE */}

        <div className="sales-card">

          <div className="sales-card-header">
            <div>

              <div className="sales-filters">

                <input
                  type="text"
                  placeholder="Search product or customer..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="sales-search"
                  aria-label="Search product or customer"
                />

                <select
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(e.target.value)
                  }
                  className="sales-filter"
                  aria-label="Filter sales by date"
                >
                  <option value="all">
                    All Sales
                  </option>

                  <option value="today">
                    Today
                  </option>

                  <option value="week">
                    Last 7 Days
                  </option>
                </select>

              </div>

              <h2>Recent Sales</h2>

              <p>Your latest transactions</p>

            </div>
          </div>

          {/* LOADING */}

          {loading ? (

            <div className="sales-message">
              Loading sales...
            </div>

          ) : sales.length === 0 ? (

            /* NO SALES */

            <div className="sales-empty">

              <div className="sales-empty-icon">
                <SalesIcon type="empty" size={34} />
              </div>

              <h3>No sales yet</h3>

              <p>
                Start by creating your first sale.
              </p>

            </div>

          ) : (

            /* SALES TABLE */

            <div className="sales-table-container">

              <table className="sales-table">

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredSales.length === 0 ? (

                    <tr>
                      <td
                        colSpan="5"
                        className="sales-no-results"
                      >
                        No sales found.
                      </td>
                    </tr>

                  ) : (

                    filteredSales.map((sale) => (

                      <tr key={sale._id}>

                        <td>
                          {sale.product?.name || "Unknown"}
                        </td>

                        <td>
                          {sale.customer || "Walk-in Customer"}
                        </td>

                        <td>{sale.quantity}</td>

                        <td>
                          {sale.totalPrice} TND
                        </td>

                        <td>
                          {sale.createdAt
                            ? new Date(
                                sale.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>
    </div>
  );
}

export default Sales;
