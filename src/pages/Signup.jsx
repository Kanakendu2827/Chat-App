import { useState } from "react";
import "../Auth.css";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Signup failed.");
        return;
      }

      setSuccess(`Account created for ${data.user.name}. You can now log in.`);
      localStorage.setItem("authToken", data.token);
      const normalizedUser = {
        _id: data.user.id,
        username: data.user.name,
        email: data.user.email,
        profilePic: data.user.profilePic || "",
      };
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      navigate("/chat");
    } catch (err) {
      setError("Unable to connect to the signup server.");
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p>Join us today</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button type="submit" className="auth-btn">
            Sign Up
          </button>
        </form>

        <p className="switch-page">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}