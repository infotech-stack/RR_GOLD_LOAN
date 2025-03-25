import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../AuthContext";
import "./Login.css";
import logo from "../Home/RR Gold Finance Full Logo.jpeg";

function Login() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [adminIdError, setAdminIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isRootAdmin, setIsRootAdmin] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setAdminIdError("");
    setPasswordError("");

    if (!adminId || !password) {
      if (!adminId) setAdminIdError("Admin ID is required");
      if (!password) setPasswordError("Password is required");
      return;
    }

    const success = await login(adminId, password, isRootAdmin);

    if (success) {
      Swal.fire("Success", "Login successful!", "success");
      navigate("/dashboard");
    } else {
      Swal.fire("Error", "Invalid credentials", "error");
      setAdminIdError("Invalid credentials");
      setPasswordError("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      {/* Left Column: Background Image */}
      <div className="login-image"></div>

      {/* Right Column: Login Form */}
      <div className="login-form-container">
        <div className="login-container">
          <img
            src={logo}
            alt="Logo"
            className="logo"
            style={{
              maxWidth: "87%",
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
          />

          <Typography
            variant="h5"
            component="h2"
            className="login-header mt-4"
            align="center"
          >
            ADMIN LOGIN
          </Typography>

          <form onSubmit={handleSubmit} noValidate className="login-form">
            <TextField
              label="Admin ID"
              type="text"
              fullWidth
              variant="outlined"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              error={!!adminIdError}
              helperText={adminIdError}
              required
              size="small"
              className="login-input"
              sx={{ mb: 2, mt: 4 }} 
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
              required
              size="small"
              className="login-input"
              sx={{ mb: 2, mt: 1 }} 
            />
 <FormControlLabel
  control={
    <Switch
      checked={isRootAdmin}
      onChange={(e) => setIsRootAdmin(e.target.checked)}
      sx={{
        "& .MuiSwitch-thumb": {
          backgroundColor: "#B0BEC5", // Default thumb color (OFF)
          transition: "all 0.3s ease-in-out",
        },
        "& .MuiSwitch-track": {
          backgroundColor: "#B0BEC5", // Default track color (OFF)
          opacity: 0.5,
          transition: "all 0.3s ease-in-out",
        },
        "& .Mui-checked": {
          "& .MuiSwitch-thumb": {
            background: "linear-gradient(to right, #b8860b, #b8860b)", // Gradient for thumb when ON
          },
          "& + .MuiSwitch-track": {
            background: "linear-gradient(to right, #2e3191,rgb(16, 20, 122))", // Gradient for track when ON
            opacity: 1,
          },
        },
      }}
    />
  }
  label="Root Admin"
/>


            <Button
              type="submit"
              variant="contained"
              
              fullWidth
              className="login-button mt-3"
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
