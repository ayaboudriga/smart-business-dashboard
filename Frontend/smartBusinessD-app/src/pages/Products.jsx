import { useEffect, useState } from "react";
import axios from "axios";

import EmployeeSidebar from "../components/dashboard/EmployeeSidebar";
import EmployeeNavbar from "../components/dashboard/EmployeeNavbar";

import ManagerSidebar from "../components/dashboard/ManagerSidebar";
import ManagerNavbar from "../components/dashboard/ManagerNavbar";

import "../styles/Products.css";

function Products() {

  // =========================
  // GET LOGGED USER
  // =========================

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error reading user:", error);
  }

  const isManager = user?.role === "manager";

  // =========================
  // PRODUCTS
  // =========================

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FORM
  // =========================

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    price: "",
    quantity: "",
    supplier: "",
  });

  // =========================
  // SEARCH
  // =========================

  const [searchTerm, setSearchTerm] = useState("");

  // =========================
  // GET PRODUCTS
  // =========================

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/products"
      );

      setProducts(response.data);

    } catch (error) {
      console.error(
        "Error fetching products:",
        error
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      brand: "",
      price: "",
      quantity: "",
      supplier: "",
    });

    setEditingProduct(null);
  };

  // =========================
  // ADD PRODUCT
  // =========================

  const handleAddClick = () => {
    console.log("ADD PRODUCT CLICKED");

    resetForm();
    setShowForm(true);
  };

  // =========================
  // EDIT PRODUCT
  // =========================

  const handleEditClick = (product) => {
    console.log(
      "EDIT PRODUCT CLICKED:",
      product
    );

    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      category: product.category || "",
      brand: product.brand || "",
      price: product.price ?? "",
      quantity: product.quantity ?? "",
      supplier: product.supplier || "",
    });

    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  // =========================
  // SAVE / UPDATE PRODUCT
  // =========================

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    console.log("SAVE PRODUCT CLICKED");
    console.log("Form data:", formData);

    if (
      !formData.name ||
      !formData.category ||
      !formData.brand ||
      formData.price === "" ||
      formData.quantity === ""
    ) {
      alert(
        "Please fill in all required fields."
      );
      return;
    }

    try {

      const productData = {
        name: formData.name,
        category: formData.category,
        brand: formData.brand,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        supplier: formData.supplier,
      };

      let response;

      // UPDATE
      if (editingProduct) {

        response = await axios.put(
          `http://localhost:5000/products/${editingProduct._id}`,
          productData
        );

      }

      // CREATE
      else {

        response = await axios.post(
          "http://localhost:5000/products",
          productData
        );

      }

      alert(
        response.data.message
      );

      handleCloseForm();

      await fetchProducts();

    } catch (error) {

      console.error(
        "Error saving product:",
        error
      );

      if (error.response) {

        alert(
          error.response.data.message ||
          "Server error."
        );

      } else {

        alert(
          "Unable to connect to the server."
        );

      }
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDeleteProduct = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this product?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      const response =
        await axios.delete(
          `http://localhost:5000/products/${id}`
        );

      alert(
        response.data.message
      );

      await fetchProducts();

    } catch (error) {

      console.error(
        "Error deleting product:",
        error
      );

      if (error.response) {

        alert(
          error.response.data.message ||
          "Server error."
        );

      } else {

        alert(
          "Unable to connect to the server."
        );

      }
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredProducts =
    products.filter((product) => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      if (!search) {
        return true;
      }

      return (
        product.name
          ?.toLowerCase()
          .includes(search) ||

        product.category
          ?.toLowerCase()
          .includes(search) ||

        product.brand
          ?.toLowerCase()
          .includes(search) ||

        product.supplier
          ?.toLowerCase()
          .includes(search)
      );
    });

  // =========================
  // JSX
  // =========================

  return (

    <div className="dashboard-layout">

      {/* =========================
          SIDEBAR
      ========================= */}

      {isManager ? (
        <ManagerSidebar />
      ) : (
        <EmployeeSidebar />
      )}

      <main className="dashboard-content">

        {/* =========================
            NAVBAR
        ========================= */}

        {isManager ? (
          <ManagerNavbar />
        ) : (
          <EmployeeNavbar />
        )}

        {/* =========================
            HEADER
        ========================= */}

        <div className="products-header">

          <div>

            <h1>
              Products
            </h1>

            <p>
              Manage your products and inventory
            </p>

          </div>

          <button
            type="button"
            className="add-product-btn"
            onClick={handleAddClick}
          >
            + Add Product
          </button>

        </div>

        {/* =========================
            ADD / EDIT FORM
        ========================= */}

        {showForm && (

          <div className="product-form-card">

            <div className="product-form-header">

              <div>

                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

                <p>
                  Enter the product information below.
                </p>

              </div>

              <button
                type="button"
                className="close-form-btn"
                onClick={handleCloseForm}
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSaveProduct}
            >

              <div className="product-form-grid">

                {/* NAME */}

                <div className="form-field">

                  <label>
                    Product Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Example: HP ProBook 450"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* CATEGORY */}

                <div className="form-field">

                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select category
                    </option>

                    <option value="Laptops">
                      Laptops
                    </option>

                    <option value="Monitors">
                      Monitors
                    </option>
                    <option value="phones">
                      Phones
                    </option>
                    <option value="Accessories">
                      Accessories
                    </option>

                    <option value="Printers">
                      Printers
                    </option>

                    <option value="Storage">
                      Storage
                    </option>

                    <option value="Networking">
                      Networking
                    </option>

                  </select>

                </div>

                {/* BRAND */}

                <div className="form-field">

                  <label>
                    Brand
                  </label>

                  <input
                    type="text"
                    name="brand"
                    placeholder="Example: HP"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* PRICE */}

                <div className="form-field">

                  <label>
                    Price (TND)
                  </label>

                  <input
                    type="number"
                    name="price"
                    placeholder="Example: 2899"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* QUANTITY */}

                <div className="form-field">

                  <label>
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    placeholder="Example: 10"
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* SUPPLIER */}

                <div className="form-field">

                  <label>
                    Supplier
                  </label>

                  <input
                    type="text"
                    name="supplier"
                    placeholder="Example: Tech Distribution"
                    value={formData.supplier}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* FORM BUTTONS */}

              <div className="product-form-actions">

                <button
                  type="button"
                  className="cancel-product-btn"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-product-btn"
                >
                  {editingProduct
                    ? "Update Product"
                    : "Save Product"}
                </button>

              </div>

            </form>

          </div>

        )}

        {/* =========================
            PRODUCTS CARD
        ========================= */}

        <div className="products-card">

          <div className="products-top">

            <h2>
              All Products
            </h2>

            <input
              type="text"
              placeholder="Search products..."
              className="products-search"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

          </div>

          {/* LOADING */}

          {loading ? (

            <p className="products-message">
              Loading products...
            </p>

          ) : products.length === 0 ? (

            /* NO PRODUCTS */

            <div className="products-empty">

              <div className="empty-icon">
                📦
              </div>

              <h3>
                No products yet
              </h3>

              <p>
                Start by adding your first product.
              </p>

              <button
                type="button"
                className="add-product-btn"
                onClick={handleAddClick}
              >
                + Add Product
              </button>

            </div>

          ) : filteredProducts.length === 0 ? (

            /* NO SEARCH RESULTS */

            <div className="products-empty">

              <div className="empty-icon">
                🔍
              </div>

              <h3>
                No products found
              </h3>

              <p>
                No products match "{searchTerm}".
              </p>

            </div>

          ) : (

            /* TABLE */

            <div className="products-table-container">

              <table className="products-table">

                <thead>

                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Brand
                    </th>

                    <th>
                      Price
                    </th>

                    <th>
                      Stock
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredProducts.map(
                    (product) => (

                      <tr
                        key={product._id}
                      >

                        <td>
                          {product.name}
                        </td>

                        <td>
                          {product.category}
                        </td>

                        <td>
                          {product.brand}
                        </td>

                        <td>
                          {product.price} TND
                        </td>

                        <td>

                          <span
                            className={
                              Number(
                                product.quantity
                              ) <= 5
                                ? "stock-low"
                                : "stock-ok"
                            }
                          >
                            {product.quantity}
                          </span>

                        </td>

                        <td className="product-actions">

                          {/* EDIT */}

                          <button
                            type="button"
                            className="edit-product-btn"
                            onClick={() =>
                              handleEditClick(
                                product
                              )
                            }
                          >
                            ✏️ Edit
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="delete-product-btn"
                            onClick={() =>
                              handleDeleteProduct(
                                product._id
                              )
                            }
                          >
                            🗑️ Delete
                          </button>

                        </td>

                      </tr>

                    )
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

export default Products;