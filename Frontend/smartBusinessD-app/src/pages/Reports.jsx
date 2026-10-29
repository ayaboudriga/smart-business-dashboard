
import "../styles/Reports.css";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import ManagerSidebar from "../components/dashboard/ManagerSidebar";
import ManagerNavbar from "../components/dashboard/ManagerNavbar";

// ===============================
// SVG ICONS
// ===============================
function ReportIcon({ name, size = 20 }) {
  const icons = {
    revenue: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h3M16 3v6" />
      </>
    ),
    sales: (
      <>
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M2 3h2l2.5 12.5a2 2 0 0 0 2 1.5h9.7a2 2 0 0 0 2-1.6L22 8H5" />
      </>
    ),
    products: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" />
      </>
    ),
    average: (
      <>
        <path d="M3 17 9 11l4 4 8-9" />
        <path d="M15 6h6v6M3 21h18" />
      </>
    ),
    available: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8" />
      </>
    ),
    stock: (
      <>
        <path d="M4 19V5M4 19h17" />
        <rect x="7" y="11" width="3" height="5" />
        <rect x="12" y="7" width="3" height="9" />
        <rect x="17" y="3" width="3" height="13" />
      </>
    ),
    warning: (
      <>
        <path d="M10.3 4.3 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.3a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 16.5h.01" />
      </>
    ),
    out: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6m0-6-6 6" />
      </>
    ),
    excel: (
      <>
        <path d="M4 4h10l6 6v10H4z" />
        <path d="M14 4v6h6M7 13l4 5m0-5-4 5" />
      </>
    ),
    pdf: (
      <>
        <path d="M6 3h9l4 4v14H6z" />
        <path d="M15 3v5h4M8 12h7M8 15h7M8 18h5" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.5 9a7 7 0 0 1 12-2L20 12M18.5 15a7 7 0 0 1-12 2L4 12" />
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
      {icons[name]}
    </svg>
  );
}

function Reports() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reportPeriod, setReportPeriod] = useState("all");

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchData = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [productsResponse, salesResponse] = await Promise.all([
        axios.get("http://localhost:5000/products"),
        axios.get("http://localhost:5000/sales"),
      ]);

      setProducts(
        Array.isArray(productsResponse.data)
          ? productsResponse.data
          : []
      );

      setSales(
        Array.isArray(salesResponse.data)
          ? salesResponse.data
          : []
      );
    } catch (error) {
      console.error("Error loading reports:", error);
      setErrorMessage(
        "Unable to load reports. Check that the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===============================
  // FILTER SALES BY PERIOD
  // ===============================
  const filteredSales = useMemo(() => {
    if (reportPeriod === "all") return sales;

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (reportPeriod === "7") {
      start.setDate(start.getDate() - 6);
    } else if (reportPeriod === "30") {
      start.setDate(start.getDate() - 29);
    }

    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return (
        !Number.isNaN(saleDate.getTime()) &&
        saleDate >= start &&
        saleDate <= now
      );
    });
  }, [sales, reportPeriod]);

  // ===============================
  // STATISTICS
  // ===============================
  const totalSales = filteredSales.length;

  const totalRevenue = filteredSales.reduce(
    (total, sale) => total + Number(sale.totalPrice || 0),
    0
  );

  const averageSale =
    totalSales > 0 ? totalRevenue / totalSales : 0;

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.quantity) > 0 &&
      Number(product.quantity) <= 5
  );

  const outOfStockProducts = products.filter(
    (product) => Number(product.quantity) === 0
  );

  const availableProducts = products.filter(
    (product) => Number(product.quantity) > 5
  );

  const stockStatusData = [
    { name: "Available", value: availableProducts.length },
    { name: "Low Stock", value: lowStockProducts.length },
    { name: "Out of Stock", value: outOfStockProducts.length },
  ];

  // ===============================
  // LAST 7 DAYS REVENUE
  // ===============================
  const salesChartData = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const revenue = filteredSales
        .filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return (
            !Number.isNaN(saleDate.getTime()) &&
            saleDate >= date &&
            saleDate < nextDay
          );
        })
        .reduce(
          (total, sale) => total + Number(sale.totalPrice || 0),
          0
        );

      days.push({
        date: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        revenue,
      });
    }

    return days;
  }, [filteredSales]);

  const last7DaysRevenue = salesChartData.reduce(
    (total, item) => total + item.revenue,
    0
  );

  // ===============================
  // TOP PRODUCTS
  // ===============================
  const productSales = {};

  filteredSales.forEach((sale) => {
    const productId = sale.product?._id;
    const productName = sale.product?.name || "Unknown";

    if (!productId) return;

    if (!productSales[productId]) {
      productSales[productId] = {
        name: productName,
        quantity: 0,
        revenue: 0,
      };
    }

    productSales[productId].quantity += Number(sale.quantity || 0);
    productSales[productId].revenue += Number(sale.totalPrice || 0);
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // ===============================
  // RECENT SALES
  // ===============================
  const recentSales = [...filteredSales]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  // ===============================
  // EXPORT EXCEL
  // ===============================
  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ["BUSINESS REPORT"],
      ["Generated on", new Date().toLocaleString()],
      ["Period", reportPeriod === "all" ? "All dates" : `Last ${reportPeriod} days`],
      [],
      ["Indicator", "Value"],
      ["Total Revenue (TND)", totalRevenue],
      ["Total Sales", totalSales],
      ["Average Sale (TND)", Number(averageSale.toFixed(2))],
      ["Total Products", totalProducts],
      ["Total Stock Units", totalStock],
      ["Available Products", availableProducts.length],
      ["Low Stock Products", lowStockProducts.length],
      ["Out of Stock Products", outOfStockProducts.length],
      [],
      ["Revenue - Last 7 Days"],
      ["Day", "Revenue (TND)"],
      ...salesChartData.map((day) => [day.date, day.revenue]),
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 30 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    const productData = products.map((product) => ({
      Name: product.name || "",
      Category: product.category || "",
      Brand: product.brand || "",
      Price_TND: Number(product.price || 0),
      Quantity: Number(product.quantity || 0),
      Supplier: product.supplier || "",
      Stock_Value_TND:
        Number(product.price || 0) * Number(product.quantity || 0),
    }));

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(productData),
      "Products"
    );

    const salesData = filteredSales.map((sale) => ({
      Product: sale.product?.name || "Unknown",
      Customer: sale.customer || "Walk-in Customer",
      Quantity: Number(sale.quantity || 0),
      Revenue_TND: Number(sale.totalPrice || 0),
      Date: sale.createdAt
        ? new Date(sale.createdAt).toLocaleDateString()
        : "",
    }));

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(salesData),
      "Sales"
    );

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        topProducts.map((product, index) => ({
          Rank: index + 1,
          Product: product.name,
          Units_Sold: product.quantity,
          Revenue_TND: product.revenue,
        }))
      ),
      "Top Products"
    );

    XLSX.writeFile(workbook, "Business_Report.xlsx");
  };

  // ===============================
  // EXPORT PDF
  // ===============================
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.text("Business Report", 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 26);
    doc.text(
      `Period: ${reportPeriod === "all" ? "All dates" : `Last ${reportPeriod} days`}`,
      14,
      32
    );

    autoTable(doc, {
      startY: 39,
      head: [["Business Indicator", "Value"]],
      body: [
        ["Total Revenue", `${totalRevenue.toLocaleString()} TND`],
        ["Total Sales", String(totalSales)],
        ["Average Sale", `${averageSale.toFixed(2)} TND`],
        ["Total Products", String(totalProducts)],
        ["Total Stock Units", String(totalStock)],
        ["Available Products", String(availableProducts.length)],
        ["Low Stock Products", String(lowStockProducts.length)],
        ["Out of Stock Products", String(outOfStockProducts.length)],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [35, 35, 35],
        textColor: [255, 255, 255],
      },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    let nextY = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Top Selling Products", 14, nextY);

    autoTable(doc, {
      startY: nextY + 4,
      head: [["Rank", "Product", "Units Sold", "Revenue (TND)"]],
      body: topProducts.length
        ? topProducts.map((product, index) => [
            index + 1,
            product.name,
            product.quantity,
            product.revenue.toLocaleString(),
          ])
        : [["-", "No sales data", "-", "-"]],
      theme: "grid",
      headStyles: {
        fillColor: [35, 35, 35],
        textColor: [255, 255, 255],
      },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    nextY = doc.lastAutoTable.finalY + 10;

    if (nextY > 250) {
      doc.addPage();
      nextY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Inventory", 14, nextY);

    autoTable(doc, {
      startY: nextY + 4,
      head: [["Product", "Category", "Price (TND)", "Quantity", "Stock Value"]],
      body: products.length
        ? products.map((product) => [
            product.name || "Unknown",
            product.category || "-",
            Number(product.price || 0).toLocaleString(),
            Number(product.quantity || 0),
            (
              Number(product.price || 0) * Number(product.quantity || 0)
            ).toLocaleString(),
          ])
        : [["No products", "-", "-", "-", "-"]],
      theme: "grid",
      headStyles: {
        fillColor: [35, 35, 35],
        textColor: [255, 255, 255],
      },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    nextY = doc.lastAutoTable.finalY + 10;

    if (nextY > 250) {
      doc.addPage();
      nextY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Recent Sales", 14, nextY);

    autoTable(doc, {
      startY: nextY + 4,
      head: [["Product", "Customer", "Quantity", "Revenue (TND)", "Date"]],
      body: recentSales.length
        ? recentSales.map((sale) => [
            sale.product?.name || "Unknown",
            sale.customer || "Walk-in Customer",
            sale.quantity ?? 0,
            Number(sale.totalPrice || 0).toLocaleString(),
            sale.createdAt
              ? new Date(sale.createdAt).toLocaleDateString()
              : "-",
          ])
        : [["No sales", "-", "-", "-", "-"]],
      theme: "grid",
      headStyles: {
        fillColor: [35, 35, 35],
        textColor: [255, 255, 255],
      },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    doc.save("Business_Report.pdf");
  };

  return (
    <div className="dashboard-layout">
      <ManagerSidebar />

      <main className="dashboard-content">
        <ManagerNavbar />

        {/* HEADER */}
        <div className="reports-header">
          <div className="reports-heading">
            <h1>Reports</h1>
            <p>Business performance and analytics</p>
          </div>

          {/* PERIOD FILTER + ACTION BUTTONS */}
          <div className="reports-header-actions">
            <label className="report-period-control">
              <span>REPORT PERIOD</span>
              <select
                value={reportPeriod}
                onChange={(event) => setReportPeriod(event.target.value)}
                disabled={loading}
              >
                <option value="all">All dates</option>
                <option value="1">Today</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </label>

            <button
              type="button"
              className="reports-action-btn excel-btn"
              onClick={exportExcel}
              disabled={loading}
            >
              <ReportIcon name="excel" size={18} />
              <span>Export Excel</span>
            </button>

            <button
              type="button"
              className="reports-action-btn pdf-btn"
              onClick={exportPDF}
              disabled={loading}
            >
              <ReportIcon name="pdf" size={18} />
              <span>Export PDF</span>
            </button>

            <button
              type="button"
              className="reports-action-btn refresh-btn"
              onClick={fetchData}
              disabled={loading}
            >
              <ReportIcon name="refresh" size={18} />
              <span>{loading ? "Refreshing..." : "Refresh data"}</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="reports-error">
            <p>{errorMessage}</p>
            <button
              type="button"
              className="reports-action-btn refresh-btn"
              onClick={fetchData}
            >
              <ReportIcon name="refresh" size={18} />
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="reports-loading">Loading reports...</div>
        ) : (
          <>
            {/* KPI CARDS */}
            <div className="reports-stats">
              <div className="report-stat-card">
                <div className="report-stat-icon">
                  <ReportIcon name="revenue" />
                </div>
                <div>
                  <p>Total Revenue</p>
                  <h2>{totalRevenue.toLocaleString()} TND</h2>
                </div>
              </div>

              <div className="report-stat-card">
                <div className="report-stat-icon">
                  <ReportIcon name="sales" />
                </div>
                <div>
                  <p>Total Sales</p>
                  <h2>{totalSales}</h2>
                </div>
              </div>

              <div className="report-stat-card">
                <div className="report-stat-icon">
                  <ReportIcon name="products" />
                </div>
                <div>
                  <p>Total Products</p>
                  <h2>{totalProducts}</h2>
                </div>
              </div>

              <div className="report-stat-card">
                <div className="report-stat-icon">
                  <ReportIcon name="average" />
                </div>
                <div>
                  <p>Average Sale</p>
                  <h2>
                    {averageSale.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    TND
                  </h2>
                </div>
              </div>
            </div>

            {/* TOP PRODUCTS + INVENTORY SUMMARY */}
            <div className="reports-grid">
              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h2>Top Selling Products</h2>
                    <p>Best performing products</p>
                  </div>
                </div>

                {topProducts.length === 0 ? (
                  <div className="reports-empty">
                    No sales data available.
                  </div>
                ) : (
                  <div className="top-products-list">
                    {topProducts.map((product, index) => (
                      <div className="report-product-item" key={product.name + index}>
                        <div className="report-product-rank">{index + 1}</div>
                        <div className="report-product-info">
                          <strong>{product.name}</strong>
                          <span>{product.quantity} units sold</span>
                        </div>
                        <strong>{product.revenue.toLocaleString()} TND</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="reports-card">
                <div className="reports-card-header">
                  <div>
                    <h2>Inventory Summary</h2>
                    <p>Current inventory status</p>
                  </div>
                </div>

                <div className="inventory-report-list">
                  <div className="inventory-report-item">
                    <span><ReportIcon name="available" size={19} /> Available Products</span>
                    <strong>{availableProducts.length}</strong>
                  </div>
                  <div className="inventory-report-item">
                    <span><ReportIcon name="stock" size={19} /> Total Stock</span>
                    <strong>{totalStock}</strong>
                  </div>
                  <div className="inventory-report-item low">
                    <span><ReportIcon name="warning" size={19} /> Low Stock</span>
                    <strong>{lowStockProducts.length}</strong>
                  </div>
                  <div className="inventory-report-item out">
                    <span><ReportIcon name="out" size={19} /> Out of Stock</span>
                    <strong>{outOfStockProducts.length}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* STOCK CHART */}
            <div className="reports-card stock-chart-card">
              <div className="reports-card-header">
                <div>
                  <h2>Stock Status</h2>
                  <p>Current inventory distribution</p>
                </div>
              </div>

              <div className="stock-chart-wrapper">
                {totalProducts === 0 ? (
                  <div className="reports-empty">No inventory data available.</div>
                ) : (
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stockStatusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          innerRadius={75}
                          outerRadius={105}
                          paddingAngle={4}
                        >
                          <Cell fill="#0EA5A0" />
                          <Cell fill="#E8A93B" />
                          <Cell fill="#E5566D" />
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* RECENT SALES */}
            <div className="reports-card">
              <div className="reports-card-header">
                <div>
                  <h2>Recent Sales</h2>
                  <p>Latest business transactions</p>
                </div>
              </div>

              {recentSales.length === 0 ? (
                <div className="reports-empty">No sales available.</div>
              ) : (
                <div className="reports-table-container">
                  <table className="reports-table">
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
                      {recentSales.map((sale) => (
                        <tr key={sale._id}>
                          <td>{sale.product?.name || "Unknown"}</td>
                          <td>{sale.customer || "Walk-in Customer"}</td>
                          <td>{sale.quantity ?? 0}</td>
                          <td>{Number(sale.totalPrice || 0).toLocaleString()} TND</td>
                          <td>
                            {sale.createdAt
                              ? new Date(sale.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* REVENUE CHART */}
            <div className="reports-card reports-revenue-card">
              <div className="reports-card-header">
                <div>
                  <h2>Sales Performance</h2>
                  <p>Revenue generated during the last 7 days</p>
                </div>
                <div className="chart-total">
                  {last7DaysRevenue.toLocaleString()} TND
                </div>
              </div>

              <div className="revenue-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={salesChartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0EA5A0" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#0EA5A0" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E9F2" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9AA1B8", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9AA1B8", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        border: "1px solid #E7E9F2",
                        borderRadius: 8,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                      formatter={(value) => [
                        `${Number(value).toLocaleString()} TND`,
                        "Revenue",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0EA5A0"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                      dot={{ r: 4, fill: "#0EA5A0", strokeWidth: 2, stroke: "#FFFFFF" }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Reports;
