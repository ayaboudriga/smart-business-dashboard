
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

import "../styles/Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
const handleLogin = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    setError("Please fill in all fields.");
    return;
  }

  setError("");

  try {
    console.log("Sending login data...");

    const response = await axios.post(
      "http://localhost:5000/login",
      {
        email,
        password,
      }
    );

    console.log("Login response:", response.data);

        alert(response.data.message);

        // Save logged-in user
        localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
        );

        const role = response.data.user.role;

        if (role === "admin") {
        window.location.href = "/admin-dashboard";
        } else if (role === "manager") {
        window.location.href = "/manager-dashboard";
        } else {
        window.location.href = "/employee-dashboard";
        }
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    if (error.response) {
      setError(error.response.data.message);
    } else {
      setError("Unable to connect to the server.");
    }
  }
};
  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">
          <h1>Smart Business</h1>
          <h2>Welcome Back </h2>
          <p>Login to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="input-group">
            <label>Email</label>
            <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
          </div>

        <div className="input-group">
        <label>Password</label>

        <div className="password-container">
            <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />

            <button
            type="button"
            className="show-password"
            onClick={() => setShowPassword(!showPassword)}
            >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
        </div>
        </div>

          <div className="login-options">
            {error && <p className="error-message">{error}</p>}
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>

        </form>

        <div className="register-link">
        <p>
            Don't have an account?{" "}
            <Link to="/register">Register</Link>
        </p>
        </div>

      </div>

    </div>
  );
}

export default Login;