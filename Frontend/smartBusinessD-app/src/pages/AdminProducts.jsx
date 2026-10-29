
import { useEffect, useState } from "react";
import axios from "axios";

import AdminSidebar from "../components/dashboard/AdminSidebar";
import AdminNavbar from "../components/dashboard/AdminNavbar";

import "../styles/AdminProducts.css";

function AdminProducts() {

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
      console.error("Error fetching products:", error);
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
    resetForm();
    setShowForm(true);
  };

  // =========================
  // EDIT PRODUCT
  // =========================

  const handleEditClick = (product) => {
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
  // SAVE / UPDATE
  // =========================

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.category ||
      !formData.brand ||
      formData.price === "" ||
      formData.quantity === ""
    ) {
      alert("Please fill in all required fields.");
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

      alert(response.data.message);

      handleCloseForm();

      await fetchProducts();

    } catch (error) {

      console.error("Error saving product:", error);

      alert(
        error.response?.data?.message ||
        "Unable to save product."
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDeleteProduct = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await axios.delete(
        `http://localhost:5000/products/${id}`
      );

      alert(response.data.message);

      await fetchProducts();

    } catch (error) {

      console.error(
        "Error deleting product:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to delete product."
      );
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredProducts = products.filter((product) => {

    const search = searchTerm
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
  // UI
  // =========================

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <AdminSidebar />

      <main className="admin-main">

        {/* NAVBAR */}
        <AdminNavbar />

        {/* HEADER */}
        <div className="admin-products-header">

          <div>
            <h1>Products Management</h1>

            <p>
              Manage products, inventory and stock
            </p>
          </div>

          <button
            type="button"
            className="admin-add-product-btn"
            onClick={handleAddClick}
          >
            + Add Product
          </button>

        </div>

        {/* FORM */}
        {showForm && (

          <div className="admin-product-form-card">

            <div className="admin-product-form-header">

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
                className="admin-close-form-btn"
                onClick={handleCloseForm}
              >
                ✕
              </button>

            </div>

            <form onSubmit={handleSaveProduct}>

              <div className="admin-product-form-grid">

                {/* NAME */}
                <div className="admin-form-field">

                  <label>Product Name</label>

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
                <div className="admin-form-field">

                  <label>Category</label>

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
                <div className="admin-form-field">

                  <label>Brand</label>

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
                <div className="admin-form-field">

                  <label>Price (TND)</label>

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
                <div className="admin-form-field">

                  <label>Quantity</label>

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
                <div className="admin-form-field">

                  <label>Supplier</label>

                  <input
                    type="text"
                    name="supplier"
                    placeholder="Example: Tech Distribution"
                    value={formData.supplier}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* ACTIONS */}
              <div className="admin-product-form-actions">

                <button
                  type="button"
                  className="admin-cancel-product-btn"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-save-product-btn"
                >
                  {editingProduct
                    ? "Update Product"
                    : "Save Product"}
                </button>

              </div>

            </form>

          </div>
        )}

        {/* PRODUCTS */}
        <div className="admin-products-card">

          <div className="admin-products-top">

            <div>
              <h2>All Products</h2>

              <span>
                {products.length} products
              </span>
            </div>

            <input
              type="text"
              placeholder="Search products..."
              className="admin-products-search"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

          </div>

          {/* LOADING */}
          {loading ? (

            <p className="admin-products-message">
              Loading products...
            </p>

          ) : products.length === 0 ? (

            <div className="admin-products-empty">

              <div className="admin-empty-icon">
                📦
              </div>

              <h3>No products yet</h3>

              <p>
                Start by adding your first product.
              </p>

              <button
                type="button"
                className="admin-add-product-btn"
                onClick={handleAddClick}
              >
                + Add Product
              </button>

            </div>

          ) : filteredProducts.length === 0 ? (

            <div className="admin-products-empty">

              <div className="admin-empty-icon">
                🔍
              </div>

              <h3>No products found</h3>

              <p>
                No products match "{searchTerm}".
              </p>

            </div>

          ) : (

            <div className="admin-products-table-container">

              <table className="admin-products-table">

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Supplier</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.map((product) => (

                    <tr key={product._id}>

                      <td>
                        <strong>
                          {product.name}
                        </strong>
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
                            Number(product.quantity) <= 5
                              ? "admin-stock-low"
                              : "admin-stock-ok"
                          }
                        >
                          {product.quantity}
                        </span>
                      </td>

                      <td>
                        {product.supplier || "-"}
                      </td>

                      <td>

                        <div className="admin-product-actions">

                          <button
                            type="button"
                            className="admin-edit-product-btn"
                            onClick={() =>
                              handleEditClick(product)
                            }
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            className="admin-delete-product-btn"
                            onClick={() =>
                              handleDeleteProduct(
                                product._id
                              )
                            }
                          >
                            🗑️ Delete
                          </button>

                        </div>

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

export default AdminProducts;
