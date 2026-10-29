import { useEffect, useState } from "react";
import axios from "axios";

import AdminSidebar from "../components/dashboard/AdminSidebar";
import "../styles/AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee",
    password: "",
  });

  // ========================================
  // GET USERS
  // ========================================

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/user"
      );

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : response.data.users || []
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // SEARCH + FILTER
  // ========================================

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" ||
      user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // ========================================
  // OPEN ADD FORM
  // ========================================

  const handleAddUser = () => {
    setEditingUser(null);

    setFormData({
      name: "",
      email: "",
      role: "employee",
      password: "",
    });

    setShowForm(true);
  };

  // ========================================
  // OPEN EDIT FORM
  // ========================================

  const handleEdit = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "employee",
      password: "",
    });

    setShowForm(true);
  };

  // ========================================
  // FORM INPUT
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // ADD / EDIT USER
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // EDIT USER
        const dataToSend = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };

        // Password only if user entered a new one
        if (formData.password.trim() !== "") {
          dataToSend.password = formData.password;
        }

        const response = await axios.put(
          `http://localhost:5000/user/${editingUser._id}`,
          dataToSend
        );

        const updatedUser =
          response.data.user || response.data;

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === editingUser._id
              ? updatedUser
              : user
          )
        );

        alert("User updated successfully!");

      } else {
        // ADD USER
        const response = await axios.post(
          "http://localhost:5000/user",
          formData
        );

        const newUser =
          response.data.user || response.data;

        setUsers((prevUsers) => [
          ...prevUsers,
          newUser,
        ]);

        alert("User added successfully!");
      }

      setShowForm(false);

    } catch (error) {
      console.error(
        "Error saving user:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        "Something went wrong."
      );
    }
  };

  // ========================================
  // DELETE USER
  // ========================================

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/user/${userId}`
      );

      setUsers((prevUsers) =>
        prevUsers.filter(
          (user) => user._id !== userId
        )
      );

      alert("User deleted successfully!");

    } catch (error) {
      console.error(
        "Error deleting user:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
        "Unable to delete user."
      );
    }
  };

  // ========================================
  // CLOSE FORM
  // ========================================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="admin-layout">

      <AdminSidebar />

      <main className="admin-main">

        {/* HEADER */}
        <div className="users-header">

          <div>
            <h1>Users Management</h1>

            <p>
              Manage all users and their roles
            </p>
          </div>

          <button
            className="add-user-btn"
            onClick={handleAddUser}
          >
            + Add User
          </button>

        </div>

        {/* FILTERS */}
        <div className="users-filters">

          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
          >
            <option value="all">
              All Roles
            </option>

            <option value="admin">
              Admin
            </option>

            <option value="manager">
              Manager
            </option>

            <option value="employee">
              Employee
            </option>

          </select>

        </div>

        {/* TABLE */}
        <div className="users-table-container">

          {loading ? (

            <div className="users-loading">
              Loading users...
            </div>

          ) : filteredUsers.length === 0 ? (

            <div className="no-users">
              No users found.
            </div>

          ) : (

            <table className="users-table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr key={user._id}>

                    {/* NAME */}
                    <td>

                      <div className="user-name">

                        <div className="user-avatar">
                          {user.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <span>
                          {user.name}
                        </span>

                      </div>

                    </td>

                    {/* EMAIL */}
                    <td>
                      {user.email}
                    </td>

                    {/* ROLE */}
                    <td>

                      <span
                        className={`role-badge ${user.role}`}
                      >
                        {user.role}
                      </span>

                    </td>

                    {/* ACTIONS */}
                    <td>

                      <div className="user-actions">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            handleEdit(user)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(
                              user._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

        {/* =====================================
            ADD / EDIT MODAL
        ===================================== */}

        {showForm && (

          <div className="user-modal-overlay">

            <div className="user-modal">

              <div className="user-modal-header">

                <div>

                  <h2>
                    {editingUser
                      ? "Edit User"
                      : "Add New User"}
                  </h2>

                  <p>
                    {editingUser
                      ? "Update user information"
                      : "Create a new system user"}
                  </p>

                </div>

                <button
                  className="close-modal"
                  onClick={handleCloseForm}
                >
                  ×
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="user-form"
              >

                {/* NAME */}

                <div className="form-group">

                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />

                </div>

                {/* EMAIL */}

                <div className="form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />

                </div>

                {/* ROLE */}

                <div className="form-group">

                  <label>
                    Role
                  </label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >

                    <option value="employee">
                      Employee
                    </option>

                    <option value="manager">
                      Manager
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                  </select>

                </div>

                {/* PASSWORD */}

                <div className="form-group">

                  <label>
                    {editingUser
                      ? "New Password (optional)"
                      : "Password"}
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      editingUser
                        ? "Leave empty to keep current password"
                        : "Enter password"
                    }
                    required={!editingUser}
                  />

                </div>

                {/* BUTTONS */}

                <div className="user-form-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCloseForm}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-user-btn"
                  >
                    {editingUser
                      ? "Save Changes"
                      : "Create User"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default AdminUsers;