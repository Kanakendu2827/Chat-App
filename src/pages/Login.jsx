import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const API_BASE = import.meta.env.VITE_API_BASE || "";
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const text = await response.text();
      console.log("Server Response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError("Server returned invalid JSON.");
        return;
      }

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      setSuccess(`Welcome back, ${data.user.name}!`);

      localStorage.setItem("authToken", data.token);

      const normalizedUser = {
        _id: data.user.id,
        username: data.user.name,
        email: data.user.email,
        profilePic: data.user.profilePic || "",
      };

      localStorage.setItem("user", JSON.stringify(normalizedUser));

      setTimeout(() => {
        navigate("/chat");
      }, 1000);
    } catch (err) {
      console.error("Login Error:", err);
      setError("Unable to connect to the login server.");
    }
  };

  return (
    <div className="container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Sign in to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>

            <a href="/">Forgot Password?</a>
          </div>

          {error && (
            <div
              className="auth-error"
              style={{ color: "red", marginBottom: "10px" }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="auth-success"
              style={{ color: "green", marginBottom: "10px" }}
            >
              {success}
            </div>
          )}

          <button type="submit" className="auth-btn">
            Login
          </button>
        </form>

        <p className="switch-page">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;