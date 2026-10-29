
import { useCallback, useEffect, useMemo, useState } from "react";
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

// ===============================
// SVG REPORT ICONS
// ===============================
function ReportIcon({ name, size = 20 }) {
  const common = {
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
    excel: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="m8 12 4 6m0-6-4 6" />
      </>
    ),
    pdf: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 18v-5h2a1.5 1.5 0 0 1 0 3H8" />
        <path d="M14 13v5h1a2.5 2.5 0 0 0 0-5z" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5" />
        <path d="M4 17v-5h5" />
        <path d="M5.5 9A7 7 0 0 1 18 6l2 6" />
        <path d="M18.5 15A7 7 0 0 1 6 18l-2-6" />
      </>
    ),
  };

  return <svg {...common}>{icons[name]}</svg>;
}

function AdminReports() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportPeriod, setReportPeriod] = useState("all");

  // ===============================
  // FETCH PRODUCTS AND SALES
  // ===============================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, salesResponse] = await Promise.all([
        axios.get("http://localhost:5000/products"),
        axios.get("http://localhost:5000/sales"),
      ]);

      const productsData = Array.isArray(productsResponse.data)
        ? productsResponse.data
        : productsResponse.data?.products || [];

      const salesData = Array.isArray(salesResponse.data)
        ? salesResponse.data
        : salesResponse.data?.sales || [];

      setProducts(productsData);
      setSales(salesData);
    } catch (err) {
      console.error("Error fetching reports data:", err);
      setError("Unable to load reports data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ===============================
  // SALE AMOUNT
  // ===============================
  const getSaleAmount = (sale) => {
    return Number(
      sale.totalAmount ??
        sale.totalPrice ??
        sale.amount ??
        sale.total ??
        0
    ) || 0;
  };

  // ===============================
  // FILTER SALES BY PERIOD
  // ===============================
  const filteredSales = useMemo(() => {
    if (reportPeriod === "all") return sales;

    const now = new Date();
    const startDate = new Date(now);
    const days = Number(reportPeriod);

    startDate.setDate(startDate.getDate() - (days === 1 ? 0 : days - 1));
    startDate.setHours(0, 0, 0, 0);

    return sales.filter((sale) => {
      const saleDateValue = sale.createdAt || sale.date;
      if (!saleDateValue) return false;

      const saleDate = new Date(saleDateValue);
      if (Number.isNaN(saleDate.getTime())) return false;

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
      (Number(product.price) || 0) *
        (Number(product.quantity) || 0)
    );
  }, 0);

  const totalRevenue = useMemo(() => {
    return filteredSales.reduce(
      (total, sale) => total + getSaleAmount(sale),
      0
    );
  }, [filteredSales]);

  const formatCurrency = (value) =>
    `${(Number(value) || 0).toLocaleString("fr-TN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} TND`;

  // ===============================
  // REVENUE BY DATE
  // ===============================
  const revenueByDate = useMemo(() => {
    const revenueMap = new Map();

    filteredSales.forEach((sale) => {
      const dateValue = sale.createdAt || sale.date;
      if (!dateValue) return;

      const date = new Date(dateValue);
      if (Number.isNaN(date.getTime())) return;

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      revenueMap.set(
        key,
        (revenueMap.get(key) || 0) + getSaleAmount(sale)
      );
    });

    return Array.from(revenueMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, revenue]) => {
        const [year, month, day] = date.split("-");

        return {
          date: `${day}/${month}/${year}`,
          revenue: Number(revenue.toFixed(2)),
        };
      });
  }, [filteredSales]);

  // ===============================
  // TOP PRODUCTS BY REVENUE
  // ===============================
  const topProductsData = useMemo(() => {
    const productMap = {};

    filteredSales.forEach((sale) => {
      const productName =
        sale.product?.name ||
        sale.productName ||
        sale.name ||
        "Unknown product";

      productMap[productName] =
        (productMap[productName] || 0) + getSaleAmount(sale);
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

      categoryMap[category] =
        (categoryMap[category] || 0) + getSaleAmount(sale);
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));
  }, [filteredSales]);

  // ===============================
  // EXPORT EXCEL
  // ===============================
  const exportToExcel = () => {
    const productsSheet = products.map((product) => ({
      Product: product.name || "—",
      Category: product.category || "—",
      Brand: product.brand || "—",
      Price: Number(product.price) || 0,
      Quantity: Number(product.quantity) || 0,
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
      Quantity: Number(sale.quantity) || 0,
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

    const periodLabel =
      reportPeriod === "all"
        ? "All dates"
        : reportPeriod === "1"
          ? "Today"
          : `Last ${reportPeriod} days`;

    doc.setFontSize(11);
    doc.text(`Report period: ${periodLabel}`, 14, 30);
    doc.text(`Total products: ${totalProducts}`, 14, 42);
    doc.text(`Low stock products: ${lowStockProducts}`, 14, 50);
    doc.text(
      `Total stock value: ${formatCurrency(totalStockValue)}`,
      14,
      58
    );
    doc.text(`Total revenue: ${formatCurrency(totalRevenue)}`, 14, 66);
    doc.text(`Total transactions: ${filteredSales.length}`, 14, 74);

    const productsTable = products.map((product) => [
      product.name || "—",
      product.category || "—",
      formatCurrency(product.price),
      Number(product.quantity) || 0,
      Number(product.quantity || 0) <= 5
        ? "Low stock"
        : "Available",
    ]);

    autoTable(doc, {
      startY: 84,
      head: [["Product", "Category", "Price", "Quantity", "Status"]],
      body: productsTable,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [81, 69, 165] },
    });

    doc.save("Admin_Business_Report.pdf");
  };

  // ===============================
  // LOADING / ERROR STATES
  // ===============================
  if (loading && products.length === 0 && sales.length === 0) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <AdminNavbar />
          <div className="admin-reports-page">
            <div className="admin-report-state">Loading reports...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error && products.length === 0 && sales.length === 0) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          <AdminNavbar />
          <div className="admin-reports-page">
            <div className="admin-report-error">
              <p>{error}</p>
              <button
                type="button"
                className="reports-action-btn refresh-btn"
                onClick={fetchData}
                disabled={loading}
              >
                <ReportIcon name="refresh" />
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ===============================
  // MAIN PAGE
  // ===============================
  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminNavbar />

        <div className="admin-reports-page">
          <div className="admin-reports-header">
            <div>
              <span className="admin-reports-label">
                BUSINESS INTELLIGENCE
              </span>
              <h1>Reports &amp; Analytics</h1>
              <p>
                Analyse your business performance and monitor your activity.
              </p>
              {error && (
                <p className="admin-report-error">{error}</p>
              )}
            </div>

            <div className="admin-report-actions">
              <div className="admin-report-filters">
                <label htmlFor="report-period">Report period</label>
                <select
                  id="report-period"
                  value={reportPeriod}
                  onChange={(event) =>
                    setReportPeriod(event.target.value)
                  }
                >
                  <option value="all">All dates</option>
                  <option value="1">Today</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                </select>
              </div>

              <div className="reports-header-actions">
                <button
                  type="button"
                  className="reports-action-btn excel-btn"
                  onClick={exportToExcel}
                  disabled={loading}
                >
                  <ReportIcon name="excel" size={20} />
                  <span>Export Excel</span>
                </button>

                <button
                  type="button"
                  className="reports-action-btn pdf-btn"
                  onClick={exportToPDF}
                  disabled={loading}
                >
                  <ReportIcon name="pdf" size={20} />
                  <span>Export PDF</span>
                </button>

                <button
                  type="button"
                  className="reports-action-btn refresh-btn"
                  onClick={fetchData}
                  disabled={loading}
                >
                  <ReportIcon name="refresh" size={20} />
                  <span>{loading ? "Refreshing..." : "Refresh data"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPI CARDS */}
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

          {/* CHARTS */}
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
                      formatter={(value) => [
                        `${Number(value).toFixed(2)} TND`,
                        "Revenue",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
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
                      formatter={(value) => [
                        `${Number(value).toFixed(2)} TND`,
                        "Revenue",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
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
                          key={`${entry.name}-${index}`}
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
                      formatter={(value) => [
                        `${Number(value).toFixed(2)} TND`,
                        "Revenue",
                      ]}
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

          {/* INVENTORY TABLE */}
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
                    products.map((product, index) => {
                      const quantity = Number(product.quantity) || 0;
                      const isLowStock = quantity <= 5;

                      return (
                        <tr key={product._id || `${product.name}-${index}`}>
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
                              {isLowStock ? "Low stock" : "Available"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="admin-report-empty">
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
