import React, { useState } from "react";
import {
  TextField,
  Grid,
  Typography,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
  Paper,
} from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";

const AddedAdm = () => {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    branch: "",
    phoneNumber: "",
    adminId: "",
    password: "",
    permissions: [],
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    designation: "",
    branch: "",
    phoneNumber: "",
    adminId: "",
    password: "",
    permissions: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = {};
    let hasErrors = false;

    if (!formData.name) {
      errors.name = "Name is required";
      hasErrors = true;
    }

    if (!formData.designation) {
      errors.designation = "Designation is required";
      hasErrors = true;
    }

    if (!formData.branch) {
      errors.branch = "Branch is required";
      hasErrors = true;
    }

    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone Number is required";
      hasErrors = true;
    }

    if (!formData.adminId) {
      errors.adminId = "Admin ID is required";
      hasErrors = true;
    }

    if (!formData.password) {
      errors.password = "Password is required";
      hasErrors = true;
    }

    if (formData.permissions.length === 0) {
      errors.permissions = "Select at least one permission";
      hasErrors = true;
    }

    setFormErrors(errors);

    if (!hasErrors) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/admins/register`,
          formData
        );
        console.log("Admin data saved:", response.data);

        Swal.fire({
          title: "Success!",
          text: "Sub admin stored successfully",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Error saving admin data:", error.message);
      }
    }
  };

  const permissionOptions = [
    "Dashboard",
    "Ledger Entry",
    "Customer Management",
    "Branch Management",
    //"Appraisal Schema",
    "Voucher",
    "Repledge",
    "Expenses",
    "Day Book",
    "MD Voucher",
    "Bill Book",
  ];

  return (
    <div style={{ padding: "20px", marginTop: "20px" }}>
      <Paper
        style={{ padding: "20px", width: "700px", margin: "auto" }}
        className="paperbg"
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#373A8F", fontWeight: "550", textAlign: "center",mb:1 }}
        >
          ADD ADMINISTRATOR
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  htmlFor="name"
                  style={{ fontWeight: "500", marginBottom: "4px" }}
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter your name" // <-- Added placeholder here
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                />
                {formErrors.name && (
                  <span style={{ color: "red", fontSize: "13px" }}>
                    {formErrors.name}
                  </span>
                )}
              </div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <label
                htmlFor="name"
                style={{ fontWeight: "500", marginBottom: "4px" }}
              >
                Designation
              </label>
              <input
                type="text"
                id="Designation"
                name="designation"
                placeholder="Enter your Designation"
                value={formData.designation}
                onChange={handleChange}
                className="form-control"
              />
              {formErrors.designation && (
                <span style={{ color: "red", fontSize: "13px" }}>
                  {formErrors.designation}
                </span>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <label
                htmlFor="branch"
                style={{ fontWeight: "500", marginBottom: "4px" }}
              >
                Branch
              </label>
              <input
                type="text"
                id="branch"
                name="branch"
                placeholder="Enter your Branch"
                value={formData.branch}
                onChange={handleChange}
                className="form-control"
              />
              {formErrors.branch && (
                <span style={{ color: "red", fontSize: "13px" }}>
                  {formErrors.branch}
                </span>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <label
                htmlFor="phoneNumber"
                style={{ fontWeight: "500", marginBottom: "4px" }}
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Enter your Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-control"
              />
              {formErrors.phoneNumber && (
                <span style={{ color: "red", fontSize: "13px" }}>
                  {formErrors.phoneNumber}
                </span>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <label
                htmlFor="adminId"
                style={{ fontWeight: "500", marginBottom: "4px" }}
              >
                Admin ID
              </label>
              <input
                type="text"
                id="adminId"
                name="adminId"
                placeholder="Enter Admin ID"
                value={formData.adminId}
                onChange={handleChange}
                className="form-control"
              />
              {formErrors.adminId && (
                <span style={{ color: "red", fontSize: "13px" }}>
                  {formErrors.adminId}
                </span>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <label
                htmlFor="password"
                style={{ fontWeight: "500", marginBottom: "4px" }}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
              />
              {formErrors.password && (
                <span style={{ color: "red", fontSize: "13px" }}>
                  {formErrors.password}
                </span>
              )}
            </Grid>

            <Grid item xs={12}>
            <label
                htmlFor="permissions"
                style={{ fontWeight: "500", marginBottom: "4px" }}
              >
                Permissions
              </label>
              <FormControl fullWidth error={!!formErrors.permissions}>
               
                <Select
                  labelId="permissions-label"
                  id="permissions"
                  multiple
                  size="small"
                  value={formData.permissions}
                  placeholder="select permissions"
                  onChange={handleChange}
                  name="permissions"
                  renderValue={(selected) => selected.join(", ")}
                  sx={{
                    backgroundColor:"white",
                    borderRadius:"5px",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#DEE2E6",
                      },
                      "&:hover fieldset": {
                        borderColor: "#DEE2E6",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#DEE2E6",
                      },
                    },
                  }}
                >
                  {permissionOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Checkbox
                        checked={formData.permissions.indexOf(option) > -1}
                      />
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formErrors.permissions}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12} align="center">
              <Button
                variant="contained"
                color="primary"
                type="submit"
                className="sub-green"
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};

export default AddedAdm;
