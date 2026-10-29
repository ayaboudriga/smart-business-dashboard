import "../styles/Reports.css";
import { useEffect, useState } from "react";
import axios from "axios";

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

function Reports() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================================
  // GET PRODUCTS + SALES
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
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================================
  // SALES STATISTICS
  // ================================

  const totalSales = sales.length;

  const totalRevenue = sales.reduce(
    (total, sale) => total + Number(sale.totalPrice || 0),
    0
  );

  const averageSale =
    totalSales > 0 ? totalRevenue / totalSales : 0;

  // ================================
  // INVENTORY STATISTICS
  // ================================

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.quantity || 0),
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      Number(product.quantity) > 0 &&
      Number(product.quantity) <= 5
  );

  const outOfStockProducts = products.filter(
    (product) =>
      Number(product.quantity) === 0
  );

  const availableProducts = products.filter(
    (product) =>
      Number(product.quantity) > 5
  );

  // ================================
  // STOCK STATUS CHART DATA
  // ================================

  const stockStatusData = [
    {
      name: "Available",
      value: availableProducts.length,
    },
    {
      name: "Low Stock",
      value: lowStockProducts.length,
    },
    {
      name: "Out of Stock",
      value: outOfStockProducts.length,
    },
  ];

  // ================================
  // SALES CHART DATA - LAST 7 DAYS
  // ================================

  const getLast7Days = () => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setDate(date.getDate() - i);

      days.push({
        date,
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        revenue: 0,
      });
    }

    return days;
  };

  const salesChartData = getLast7Days().map((day) => {
    const dayStart = new Date(day.date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(day.date);
    dayEnd.setHours(23, 59, 59, 999);

    const revenue = sales
      .filter((sale) => {
        const saleDate = new Date(sale.createdAt);

        return (
          saleDate >= dayStart &&
          saleDate <= dayEnd
        );
      })
      .reduce(
        (total, sale) =>
          total + Number(sale.totalPrice || 0),
        0
      );

    return {
      date: day.label,
      revenue,
    };
  });

  // ================================
  // TOP SELLING PRODUCTS
  // ================================

  const productSales = {};

  sales.forEach((sale) => {
    const productId = sale.product?._id;
    const productName =
      sale.product?.name || "Unknown";

    if (!productId) {
      return;
    }

    if (!productSales[productId]) {
      productSales[productId] = {
        name: productName,
        quantity: 0,
        revenue: 0,
      };
    }

    productSales[productId].quantity += Number(
      sale.quantity || 0
    );

    productSales[productId].revenue += Number(
      sale.totalPrice || 0
    );
  });

  const topProducts = Object.values(productSales)
    .sort(
      (a, b) =>
        b.quantity - a.quantity
    )
    .slice(0, 5);

  // ================================
  // RECENT SALES
  // ================================

  const recentSales = [...sales]
    .sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    )
    .slice(0, 5);

  // ================================
  // RENDER
  // ================================

  return (
    <div className="dashboard-layout">

      <ManagerSidebar />

      <main className="dashboard-content">

        <ManagerNavbar />

        {/* =========================
            HEADER
        ========================= */}

        <div className="reports-header">

          <div>
            <h1>Reports</h1>

            <p>
              Business performance and analytics
            </p>
          </div>

        </div>

        {loading ? (

          <div className="reports-loading">
            Loading reports...
          </div>

        ) : (

          <>

            {/* =========================
                KPI CARDS
            ========================= */}

            <div className="reports-stats">

              <div className="report-stat-card">

                <div className="report-stat-icon">
                  💰
                </div>

                <div>
                  <p>Total Revenue</p>

                  <h2>
                    {totalRevenue.toLocaleString()} TND
                  </h2>
                </div>

              </div>

              <div className="report-stat-card">

                <div className="report-stat-icon">
                  🛒
                </div>

                <div>
                  <p>Total Sales</p>

                  <h2>
                    {totalSales}
                  </h2>
                </div>

              </div>

              <div className="report-stat-card">

                <div className="report-stat-icon">
                  📦
                </div>

                <div>
                  <p>Total Products</p>

                  <h2>
                    {totalProducts}
                  </h2>
                </div>

              </div>

              <div className="report-stat-card">

                <div className="report-stat-icon">
                  📈
                </div>

                <div>
                  <p>Average Sale</p>

                  <h2>
                    {averageSale.toLocaleString(
                      undefined,
                      {
                        maximumFractionDigits: 2,
                      }
                    )}{" "}
                    TND
                  </h2>
                </div>

              </div>

            </div>

            {/* =========================
                BUSINESS OVERVIEW
            ========================= */}

            <div className="reports-grid">

              {/* TOP PRODUCTS */}

              <div className="reports-card">

                <div className="reports-card-header">

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

                  <div className="reports-empty">
                    No sales data available.
                  </div>

                ) : (

                  <div className="top-products-list">

                    {topProducts.map(
                      (product, index) => (

                        <div
                          className="report-product-item"
                          key={index}
                        >

                          <div className="report-product-rank">
                            {index + 1}
                          </div>

                          <div className="report-product-info">

                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              {product.quantity} units sold
                            </span>

                          </div>

                          <strong>
                            {product.revenue.toLocaleString()}{" "}
                            TND
                          </strong>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

              {/* INVENTORY SUMMARY */}

              <div className="reports-card">

                <div className="reports-card-header">

                  <div>

                    <h2>
                      Inventory Summary
                    </h2>

                    <p>
                      Current inventory status
                    </p>

                  </div>

                </div>

                <div className="inventory-report-list">

                  <div className="inventory-report-item">

                    <span>
                      📦 Available Products
                    </span>

                    <strong>
                      {availableProducts.length}
                    </strong>

                  </div>

                  <div className="inventory-report-item">

                    <span>
                      📊 Total Stock
                    </span>

                    <strong>
                      {totalStock}
                    </strong>

                  </div>

                  <div className="inventory-report-item low">

                    <span>
                      ⚠️ Low Stock
                    </span>

                    <strong>
                      {lowStockProducts.length}
                    </strong>

                  </div>

                  <div className="inventory-report-item out">

                    <span>
                      🔴 Out of Stock
                    </span>

                    <strong>
                      {outOfStockProducts.length}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

            {/* =========================
                STOCK STATUS CHART
            ========================= */}

            <div className="reports-card stock-chart-card">

              <div className="reports-card-header">

                <div>

                  <h2>
                    Stock Status
                  </h2>

                  <p>
                    Current inventory distribution
                  </p>

                </div>

              </div>

              <div className="stock-chart-wrapper">

                {totalProducts === 0 ? (

                  <div className="reports-empty">
                    No inventory data available.
                  </div>

                ) : (

                  <div
                    style={{
                      width: "100%",
                      height: "300px",
                    }}
                  >

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

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

                        <Legend
                          verticalAlign="bottom"
                          height={36}
                        />

                      </PieChart>

                    </ResponsiveContainer>

                  </div>

                )}

              </div>

            </div>

            {/* =========================
                RECENT SALES
            ========================= */}

            <div className="reports-card">

              <div className="reports-card-header">

                <div>

                  <h2>
                    Recent Sales
                  </h2>

                  <p>
                    Latest business transactions
                  </p>

                </div>

              </div>

              {recentSales.length === 0 ? (

                <div className="reports-empty">
                  No sales available.
                </div>

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

                      {recentSales.map(
                        (sale) => (

                          <tr key={sale._id}>

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
                              {Number(
                                sale.totalPrice || 0
                              ).toLocaleString()}{" "}
                              TND
                            </td>

                            <td>
                              {new Date(
                                sale.createdAt
                              ).toLocaleDateString()}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

            {/* =========================
                SALES / REVENUE CHART
            ========================= */}

            <div className="reports-card reports-revenue-card">

              <div className="reports-card-header">

                <div>

                  <h2>
                    Sales Performance
                  </h2>

                  <p>
                    Revenue generated during the last 7 days
                  </p>

                </div>

                <div className="chart-total">

                  {salesChartData
                    .reduce(
                      (total, item) =>
                        total + item.revenue,
                      0
                    )
                    .toLocaleString()}{" "}
                  TND

                </div>

              </div>

              <div className="revenue-chart">

                <ResponsiveContainer
                  width="100%"
                  height={300}
                >

                  <AreaChart
                    data={salesChartData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 0,
                    }}
                  >

                    <defs>

                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#0EA5A0"
                          stopOpacity={0.30}
                        />

                        <stop
                          offset="100%"
                          stopColor="#0EA5A0"
                          stopOpacity={0.02}
                        />

                      </linearGradient>

                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E7E9F2"
                    />

                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#9AA1B8",
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#9AA1B8",
                        fontSize: 12,
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        border: "1px solid #E7E9F2",
                        borderRadius: "12px",
                        boxShadow:
                          "0 8px 24px rgba(19,27,58,0.12)",
                      }}
                      formatter={(value) => [
                        `${Number(
                          value
                        ).toLocaleString()} TND`,
                        "Revenue",
                      ]}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0EA5A0"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                      dot={{
                        r: 4,
                        fill: "#0EA5A0",
                        strokeWidth: 2,
                        stroke: "#FFFFFF",
                      }}
                      activeDot={{
                        r: 6,
                      }}
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