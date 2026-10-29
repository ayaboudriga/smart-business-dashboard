
import { useEffect, useState } from "react";
import axios from "axios";

import AdminSidebar from "../components/dashboard/AdminSidebar";
import AdminNavbar from "../components/dashboard/AdminNavbar";
import "../styles/AdminProducts.css";

function AdminProductIcon({ type, size = 20 }) {
  const icons = {
    add: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    close: (
      <>
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
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
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    delete: (
      <>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 14H6L5 6" />
        <path d="M10 11v5M14 11v5" />
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

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const [searchTerm, setSearchTerm] = useState("");

  // GET PRODUCTS
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/products"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.products || [];

      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // RESET FORM
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

  // ADD PRODUCT
  const handleAddClick = () => {
    resetForm();
    setShowForm(true);
  };

  // EDIT PRODUCT
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

  // CLOSE FORM
  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
  };

  // SAVE / UPDATE
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.category ||
      !formData.brand.trim() ||
      formData.price === "" ||
      formData.quantity === ""
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const price = Number(formData.price);
    const quantity = Number(formData.quantity);

    if (
      !Number.isFinite(price) ||
      !Number.isFinite(quantity) ||
      price < 0 ||
      quantity < 0
    ) {
      alert("Price and quantity must be valid non-negative numbers.");
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        brand: formData.brand.trim(),
        price,
        quantity,
        supplier: formData.supplier.trim(),
      };

      let response;

      if (editingProduct) {
        response = await axios.put(
          `http://localhost:5000/products/${editingProduct._id}`,
          productData
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/products",
          productData
        );
      }

      alert(response.data.message || "Product saved successfully.");

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

  // DELETE PRODUCT
  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:5000/products/${id}`
      );

      alert(response.data.message || "Product deleted successfully.");

      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete product."
      );
    }
  };

  // SEARCH
  const search = searchTerm.toLowerCase().trim();

  const filteredProducts = products.filter((product) =>
    [
      product.name,
      product.category,
      product.brand,
      product.supplier,
    ].some((value) =>
      String(value || "").toLowerCase().includes(search)
    )
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <AdminNavbar />

        {/* HEADER */}
        <div className="admin-products-header">
          <div>
            <h1>Products Management</h1>
            <p>Manage products, inventory and stock</p>
          </div>

          <button
            type="button"
            className="admin-add-product-btn"
            onClick={handleAddClick}
          >
            <AdminProductIcon type="add" />
            Add Product
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div className="admin-product-form-card">
            <div className="admin-product-form-header">
              <div>
                <h2>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <p>Enter the product information below.</p>
              </div>

              <button
                type="button"
                className="admin-close-form-btn"
                onClick={handleCloseForm}
                aria-label="Close form"
              >
                <AdminProductIcon type="close" size={21} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="admin-product-form-grid">
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

                <div className="admin-form-field">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Monitors">Monitors</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Printers">Printers</option>
                    <option value="Storage">Storage</option>
                    <option value="Networking">Networking</option>
                  </select>
                </div>

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

                <div className="admin-form-field">
                  <label>Price (TND)</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Example: 2899"
                    min="0"
                    step="any"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-form-field">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Example: 10"
                    min="0"
                    step="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

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
                  {editingProduct ? "Update Product" : "Save Product"}
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
              <span>{products.length} products</span>
            </div>

            <div className="admin-products-search-wrapper">
              <AdminProductIcon type="search" size={19} />
              <input
                type="text"
                placeholder="Search products..."
                className="admin-products-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search products"
              />
            </div>
          </div>

          {loading ? (
            <p className="admin-products-message">
              Loading products...
            </p>
          ) : products.length === 0 ? (
            <div className="admin-products-empty">
              <div className="admin-empty-icon">
                <AdminProductIcon type="package" size={38} />
              </div>

              <h3>No products yet</h3>
              <p>Start by adding your first product.</p>

              <button
                type="button"
                className="admin-add-product-btn"
                onClick={handleAddClick}
              >
                <AdminProductIcon type="add" />
                Add Product
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="admin-products-empty">
              <div className="admin-empty-icon">
                <AdminProductIcon type="search" size={38} />
              </div>

              <h3>No products found</h3>
              <p>No products match "{searchTerm}".</p>
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
                        <strong>{product.name}</strong>
                      </td>
                      <td>{product.category}</td>
                      <td>{product.brand}</td>
                      <td>{product.price} TND</td>
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
                      <td>{product.supplier || "-"}</td>
                      <td>
                        <div className="admin-product-actions">
                          <button
                            type="button"
                            className="admin-edit-product-btn"
                            onClick={() => handleEditClick(product)}
                          >
                            <AdminProductIcon type="edit" size={16} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-delete-product-btn"
                            onClick={() =>
                              handleDeleteProduct(product._id)
                            }
                          >
                            <AdminProductIcon type="delete" size={16} />
                            Delete
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
