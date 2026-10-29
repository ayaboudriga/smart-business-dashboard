import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Register.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  console.log("handleSubmit works");
  console.log("Form data:", formData);
  if (
    !formData.fullName ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword
  ) {
    alert("Please fill in all fields.");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  try {
    console.log("Sending data to backend...");
    const response = await axios.post(
      "http://localhost:5000/user",
      {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: "employee",
      }
    );
    console.log("Backend response:", response.data);
    alert(response.data.message);

    window.location.href = "/login";

  } catch (error) {
    if (error.response) {
      alert(error.response.data.message);
    } else {
      alert("Unable to connect to the server.");
    }
  }
};

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-header">
          <h1>Smart Business</h1>
          <h2>Create Account</h2>
          <p>Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="register-input-group">
            <label>Full Name</label>

            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div className="register-input-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="register-input-group">
            <label>Password</label>

            <div className="register-password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />

              <button
                type="button"
                className="register-show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="register-input-group">
            <label>Confirm Password</label>

            <div className="register-password-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              <button
                type="button"
                className="register-show-password"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
  type="submit"
  className="register-btn"
  onClick={() => console.log("BUTTON CLICKED")}
>
  Create Account
</button>

        </form>

        <div className="register-login-link">
          <p>
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;