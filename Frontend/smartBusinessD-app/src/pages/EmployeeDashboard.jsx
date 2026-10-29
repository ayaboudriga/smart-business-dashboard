import { useEffect, useState } from "react";
import axios from "axios";

import EmployeeSidebar from "../components/dashboard/EmployeeSidebar";
import EmployeeNavbar from "../components/dashboard/EmployeeNavbar";

import "../styles/EmployeeDashboard.css";

function EmployeeDashboard() {
    const storedUser = localStorage.getItem("user");

    const user = storedUser
    ? JSON.parse(storedUser)
    : null;

const [products, setProducts] = useState([]);
const [sales, setSales] = useState([]);
const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
  try {
    const [productsResponse, salesResponse] = await Promise.all([
      axios.get("http://localhost:5000/products"),
      axios.get("http://localhost:5000/sales"),
    ]);

    setProducts(productsResponse.data);
    setSales(salesResponse.data);

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
  fetchDashboardData();
}, []);

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => Number(product.quantity) <= 5
  );

  const categories = [
    ...new Set(
      products.map((product) => product.category)
    ),
  ];

  const totalStockValue = products.reduce(
    (total, product) =>
      total +
      Number(product.price) *
      Number(product.quantity),
    0
  );
  const totalSales = sales.reduce(
  (total, sale) => total + Number(sale.totalPrice),
  0
);

const numberOfSales = sales.length;

  return (
    <div className="dashboard-layout">

      <EmployeeSidebar />

      <main className="dashboard-content">

        <EmployeeNavbar />

        <div className="dashboard-header">

          <div>
            <h1>Welcome back, {user?.name || "Employee"} 👋</h1>

            <p>
            Here's your inventory overview.
            </p>
          </div>

        </div>

        {loading ? (

          <div className="dashboard-loading">
            Loading dashboard...
          </div>

        ) : (

          <>
            {/* KPI CARDS */}

            <div className="dashboard-stats">

              <div className="stat-card">

                <div className="stat-icon">
                    💰
                </div>

                <div>
                    <p>Stock Value</p>

                    <h2>
                    {totalStockValue.toLocaleString()} TND
                    </h2>
                </div>

                </div>

              <div className="stat-card">

            <div className="stat-icon">
                💵
            </div>

            <div>
                <p>Total Sales</p>

                <h2>
                {totalSales.toLocaleString()} TND
                </h2>
            </div>

            </div>



        <div className="stat-card">

        <div className="stat-icon">
            🧾
        </div>

        <div>
            <p>Number of Sales</p>

            <h2>
            {numberOfSales}
            </h2>
        </div>

        </div>

              <div className="stat-card">

                <div className="stat-icon">
                  🏷️
                </div>

                <div>
                  <p>Categories</p>

                  <h2>
                    {categories.length}
                  </h2>
                </div>

              </div>


              

            </div>


            {/* LOW STOCK */}

            <div className="dashboard-card">

              <div className="dashboard-card-header">

                <div>

                  <h2>
                    Low Stock Products
                  </h2>

                  <p>
                    Products that need attention
                  </p>

                </div>

              </div>


              {lowStockProducts.length === 0 ? (

                <div className="dashboard-empty">
                  ✅ All products have sufficient stock.
                </div>

              ) : (

                <div className="dashboard-table-container">

                  <table className="dashboard-table">

                    <thead>

                      <tr>

                        <th>
                          Product
                        </th>

                        <th>
                          Category
                        </th>

                        <th>
                          Stock
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {lowStockProducts.map(
                        (product) => (

                          <tr key={product._id}>

                            <td>
                              {product.name}
                            </td>

                            <td>
                              {product.category}
                            </td>

                            <td>

                              <span className="dashboard-stock-low">
                                {product.quantity}
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>


            {/* RECENT PRODUCTS */}

            <div className="dashboard-card">

              <div className="dashboard-card-header">

                <div>

                  <h2>
                    Recent Products
                  </h2>

                  <p>
                    Your latest products
                  </p>

                </div>

              </div>


              {products.length === 0 ? (

                <div className="dashboard-empty">
                  No products available.
                </div>

              ) : (

                <div className="dashboard-table-container">

                  <table className="dashboard-table">

                    <thead>

                      <tr>

                        <th>
                          Product
                        </th>

                        <th>
                          Brand
                        </th>

                        <th>
                          Category
                        </th>

                        <th>
                          Price
                        </th>

                        <th>
                          Stock
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {products
                        .slice(0, 5)
                        .map((product) => (

                          <tr key={product._id}>

                            <td>
                              {product.name}
                            </td>

                            <td>
                              {product.brand}
                            </td>

                            <td>
                              {product.category}
                            </td>

                            <td>
                              {product.price} TND
                            </td>

                            <td>
                              {product.quantity}
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
        {/* RECENT SALES */}

<div className="dashboard-card">

  <div className="dashboard-card-header">

    <div>
      <h2>Recent Sales</h2>

      <p>
        Your latest sales transactions
      </p>
    </div>

  </div>


  {sales.length === 0 ? (

    <div className="dashboard-empty">
      No sales available.
    </div>

  ) : (

    <div className="dashboard-table-container">

      <table className="dashboard-table">

        <thead>

          <tr>

            <th>
              Product
            </th>

            <th>
              Customer
            </th>

            <th>
              Quantity
            </th>

            <th>
              Total
            </th>

            <th>
              Date
            </th>

          </tr>

        </thead>


        <tbody>

          {sales
            .slice(0, 5)
            .map((sale) => (

              <tr key={sale._id}>

                <td>
                  {sale.product?.name || "Unknown"}
                </td>

                <td>
                  {sale.customer || "Walk-in Customer"}
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

      </main>

    </div>
  );
}

export default EmployeeDashboard;