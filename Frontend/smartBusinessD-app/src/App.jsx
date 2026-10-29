import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import AdminReports from "./pages/AdminReports";

import ManagerDashboard from "./pages/ManagerDashboard";

import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeInventory from "./pages/EmployeeInventory";

import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME & AUTH */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-users" element={<AdminUsers />} />
        <Route path="/admin-products" element={<AdminProducts />} />
        <Route path="/admin-reports" element={<AdminReports />} />

        {/* MANAGER */}
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/manager-products" element={<Products />} />
        <Route path="/manager-sales" element={<Sales />} />
        <Route path="/manager-reports" element={<Reports />} />

        {/* EMPLOYEE */}
        <Route
          path="/employee-dashboard"
          element={<EmployeeDashboard />}
        />
        <Route
          path="/employee-products"
          element={<Products />}
        />
        <Route
          path="/employee-inventory"
          element={<EmployeeInventory />}
        />
        <Route
          path="/employee-sales"
          element={<Sales />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
