import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import AdminSidebar from "../components/dashboard/AdminSidebar";
import AdminNavbar from "../components/dashboard/AdminNavbar";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import "../styles/AdminReports.css";

function AdminReports() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportPeriod, setReportPeriod] = useState("all");

  // ===============================
  // FETCH DATA
  // ===============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, salesResponse] = await Promise.all([
          axios.get("http://localhost:5000/products"),
          axios.get("http://localhost:5000/sales"),
        ]);

        const productsData = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data.products || [];

        const salesData = Array.isArray(salesResponse.data)
          ? salesResponse.data
          : salesResponse.data.sales || [];

        setProducts(productsData);
        setSales(salesData);
      } catch (err) {
        console.error("Error fetching reports data:", err);
        setError("Unable to load reports data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ===============================
  // FILTER SALES BY PERIOD
  // ===============================
  const filteredSales = useMemo(() => {
    if (reportPeriod === "all") {
      return sales;
    }

    const now = new Date();
    const days = Number(reportPeriod);

    const startDate = new Date();
    startDate.setDate(now.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    return sales.filter((sale) => {
      const saleDateValue = sale.createdAt || sale.date;

      if (!saleDateValue) {
        return false;
      }

      const saleDate = new Date(saleDateValue);

      return saleDate >= startDate && saleDate <= now;
    });
  }, [sales, reportPeriod]);

  // ===============================
  // KPIs
  // ===============================
  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => Number(product.quantity || 0) <= 5
  ).length;

  const totalStockValue = products.reduce((total, product) => {
    return (
      total +
      Number(product.price || 0) * Number(product.quantity || 0)
    );
  }, 0);

  const getSaleAmount = (sale) => {
    return Number(
      sale.totalAmount ??
        sale.totalPrice ??
        sale.amount ??
        sale.total ??
        0
    );
  };

  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((total, sale) => {
      return total + getSaleAmount(sale);
    }, 0);
  }, [filteredSales]);

  // ===============================
  // REVENUE BY DATE
  // ===============================
  const revenueByDate = useMemo(() => {
    const revenueMap = {};

    filteredSales.forEach((sale) => {
      const saleDateValue = sale.createdAt || sale.date;

      if (!saleDateValue) return;

      const date = new Date(saleDateValue).toLocaleDateString("en-GB");

      if (!revenueMap[date]) {
        revenueMap[date] = 0;
      }

      revenueMap[date] += getSaleAmount(sale);
    });

    return Object.entries(revenueMap)
      .map(([date, revenue]) => ({
        date,
        revenue: Number(revenue.toFixed(2)),
      }))
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split("/");
        const [dayB, monthB, yearB] = b.date.split("/");

        return (
          new Date(`${yearA}-${monthA}-${dayA}`) -
          new Date(`${yearB}-${monthB}-${dayB}`)
        );
      });
  }, [filteredSales]);

  // ===============================
  // TOP PRODUCTS
  // ===============================
  const topProductsData = useMemo(() => {
    const productMap = {};

    filteredSales.forEach((sale) => {
      const productName =
        sale.product?.name ||
        sale.productName ||
        sale.name ||
        "Unknown product";

      const amount = getSaleAmount(sale);

      if (!productMap[productName]) {
        productMap[productName] = 0;
      }

      productMap[productName] += amount;
    });

    return Object.entries(productMap)
      .map(([name, revenue]) => ({
        name,
        revenue: Number(revenue.toFixed(2)),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales]);

  // ===============================
  // SALES BY CATEGORY
  // ===============================
  const salesByCategory = useMemo(() => {
    const categoryMap = {};

    filteredSales.forEach((sale) => {
      const category =
        sale.product?.category ||
        sale.category ||
        "Other";

      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }

      categoryMap[category] += getSaleAmount(sale);
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));
  }, [filteredSales]);

  const formatCurrency = (value) => {
    return `${Number(value || 0).toFixed(2)} TND`;
  };

  // ===============================
  // EXPORT EXCEL
  // ===============================
  const exportToExcel = () => {
    const productsSheet = products.map((product) => ({
      Product: product.name || "—",
      Category: product.category || "—",
      Brand: product.brand || "—",
      Price: Number(product.price || 0),
      Quantity: Number(product.quantity || 0),
      Supplier: product.supplier || "—",
      StockStatus:
        Number(product.quantity || 0) <= 5
          ? "Low stock"
          : "Available",
    }));

    const salesSheet = filteredSales.map((sale) => ({
      Product:
        sale.product?.name ||
        sale.productName ||
        sale.name ||
        "—",
      Customer: sale.customer?.name || sale.customerName || "—",
      Quantity: Number(sale.quantity || 0),
      TotalPrice: getSaleAmount(sale),
      Date: sale.createdAt || sale.date || "—",
    }));

    const workbook = XLSX.utils.book_new();

    const productsWorksheet = XLSX.utils.json_to_sheet(productsSheet);
    const salesWorksheet = XLSX.utils.json_to_sheet(salesSheet);

    XLSX.utils.book_append_sheet(
      workbook,
      productsWorksheet,
      "Products"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      salesWorksheet,
      "Sales"
    );

    XLSX.writeFile(workbook, "Admin_Business_Report.xlsx");
  };

  // ===============================
  // EXPORT PDF
  // ===============================
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Admin Business Report", 14, 20);

    doc.setFontSize(11);
    doc.text(
      `Report period: ${
        reportPeriod === "all" ? "All dates" : `Last ${reportPeriod} days`
      }`,
      14,
      30
    );

    doc.text(`Total products: ${totalProducts}`, 14, 42);
    doc.text(`Low stock products: ${lowStockProducts}`, 14, 50);
    doc.text(
      `Total stock value: ${formatCurrency(totalStockValue)}`,
      14,
      58
    );
    doc.text(
      `Total revenue: ${formatCurrency(totalRevenue)}`,
      14,
      66
    );
    doc.text(
      `Total transactions: ${filteredSales.length}`,
      14,
      74
    );

    const productsTable = products.map((product) => [
      product.name || "—",
      product.category || "—",
      formatCurrency(product.price),
      product.quantity || 0,
      Number(product.quantity || 0) <= 5
        ? "Low stock"
        : "Available",
    ]);

    autoTable(doc, {
      startY: 84,
      head: [
        ["Product", "Category", "Price", "Quantity", "Status"],
      ],
      body: productsTable,
      theme: "grid",
      styles: {
        fontSize: 9,
      },
    });

    doc.save("Admin_Business_Report.pdf");
  };

  // ===============================
  // LOADING / ERROR
  // ===============================
  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-main">
          <AdminNavbar />

          <div className="admin-reports-page">
            <div className="admin-report-state">
              Loading reports...
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <AdminSidebar />

        <main className="admin-main">
          <AdminNavbar />

          <div className="admin-reports-page">
            <div className="admin-report-error">
              {error}
            </div>
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

        <div className="admin-reports-page">
          {/* ================= HEADER ================= */}
          <div className="admin-reports-header">
            <div>
              <span className="admin-reports-label">
                BUSINESS INTELLIGENCE
              </span>

              <h1>Reports & Analytics</h1>

              <p>
                Analyse your business performance and monitor your
                activity.
              </p>
            </div>

            <div className="admin-report-actions">
              <div className="admin-report-filters">
                <label htmlFor="report-period">
                  Report period
                </label>

                <select
                  id="report-period"
                  value={reportPeriod}
                  onChange={(e) =>
                    setReportPeriod(e.target.value)
                  }
                >
                  <option value="all">All dates</option>
                  <option value="1">Today</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                </select>
              </div>

              <button
                className="admin-report-excel-btn"
                onClick={exportToExcel}
              >
                Export Excel
              </button>

              <button
                className="admin-report-pdf-btn"
                onClick={exportToPDF}
              >
                Export PDF
              </button>

              <button
                className="admin-report-refresh-btn"
                onClick={() => window.location.reload()}
              >
                Refresh data
              </button>
            </div>
          </div>

          {/* ================= KPI CARDS ================= */}
          <div className="admin-report-kpi-grid">
            <div className="admin-report-kpi-card">
              <span className="kpi-title">Total products</span>
              <h2>{totalProducts}</h2>
              <p>Products in inventory</p>
            </div>

            <div className="admin-report-kpi-card">
              <span className="kpi-title">Low stock</span>
              <h2>{lowStockProducts}</h2>
              <p>Products need attention</p>
            </div>

            <div className="admin-report-kpi-card">
              <span className="kpi-title">Stock value</span>
              <h2>{formatCurrency(totalStockValue)}</h2>
              <p>Current inventory value</p>
            </div>

            <div className="admin-report-kpi-card">
              <span className="kpi-title">Total revenue</span>
              <h2>{formatCurrency(totalRevenue)}</h2>
              <p>{filteredSales.length} transactions</p>
            </div>
          </div>

          {/* ================= CHARTS ================= */}
          <div className="admin-report-charts-grid">
            <div className="admin-report-chart-card admin-report-large-chart">
              <div className="admin-report-card-header">
                <div>
                  <h3>Revenue trend</h3>
                  <p>Revenue evolution over time</p>
                </div>
              </div>

              {revenueByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={revenueByDate}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="date" />

                    <YAxis />

                    <Tooltip
                      formatter={(value) =>
                        `${Number(value).toFixed(2)} TND`
                      }
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#7161ef"
                      fill="#7161ef"
                      fillOpacity={0.18}
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="admin-report-empty">
                  No revenue data available.
                </div>
              )}
            </div>

            <div className="admin-report-chart-card">
              <div className="admin-report-card-header">
                <div>
                  <h3>Top products</h3>
                  <p>Products generating the most revenue</p>
                </div>
              </div>

              {topProductsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={topProductsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis type="number" />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                    />

                    <Tooltip
                      formatter={(value) =>
                        `${Number(value).toFixed(2)} TND`
                      }
                    />

                    <Bar
                      dataKey="revenue"
                      fill="#8b5cf6"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="admin-report-empty">
                  No product sales data available.
                </div>
              )}
            </div>

            <div className="admin-report-chart-card">
              <div className="admin-report-card-header">
                <div>
                  <h3>Sales by category</h3>
                  <p>Revenue distribution by category</p>
                </div>
              </div>

              {salesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={salesByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      label
                    >
                      {salesByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={[
                            "#7161ef",
                            "#8b5cf6",
                            "#a78bfa",
                            "#c4b5fd",
                            "#ddd6fe",
                          ][index % 5]}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        `${Number(value).toFixed(2)} TND`
                      }
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="admin-report-empty">
                  No category data available.
                </div>
              )}
            </div>
          </div>

          {/* ================= PRODUCTS TABLE ================= */}
          <div className="admin-report-table-card">
            <div className="admin-report-card-header">
              <div>
                <h3>Inventory overview</h3>
                <p>Current stock status of your products</p>
              </div>
            </div>

            <div className="admin-report-table-wrapper">
              <table className="admin-report-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => {
                      const quantity = Number(product.quantity || 0);
                      const isLowStock = quantity <= 5;

                      return (
                        <tr key={product._id}>
                          <td>{product.name || "—"}</td>
                          <td>{product.category || "—"}</td>
                          <td>{formatCurrency(product.price)}</td>
                          <td>{quantity}</td>
                          <td>
                            <span
                              className={
                                isLowStock
                                  ? "stock-badge low"
                                  : "stock-badge available"
                              }
                            >
                              {isLowStock
                                ? "Low stock"
                                : "Available"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="admin-report-empty">
                        No products available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminReports;