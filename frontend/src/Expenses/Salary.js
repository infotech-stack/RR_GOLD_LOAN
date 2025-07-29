import React, { useState,useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
} from "@mui/material";
import { Form } from "react-bootstrap";
import { fetchNextVoucherNo } from '../utils/voucherUtils';
const Salary = () => {
  const [voucherNo, setVoucherNo] = useState("");
  const [formData, setFormData] = useState({
    employeeName: "",
    designation: "",
    date: "",
    salaryAmount: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (
      !formData.employeeName ||
      !formData.designation ||
      !formData.date ||
      !formData.salaryAmount
    ) {
      setErrors({
        employeeName: !formData.employeeName,
        designation: !formData.designation,
        date: !formData.date,
        salaryAmount: !formData.salaryAmount,
      });
      return;
    }

    try {
      // Send POST request to backend
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/salary/add`,
        {
          employeeName: formData.employeeName,
          designation: formData.designation,
          date: formData.date,
          salaryAmount: parseFloat(formData.salaryAmount), 
        }
      );

      console.log("Salary added:", response.data);
const updatedVoucherNo = await fetchNextVoucherNo();
    setVoucherNo(updatedVoucherNo);
      setFormData({
        employeeName: "",
        designation: "",
        date: "",
        salaryAmount: "",
      });
      setErrors({});

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Salary data stored successfully.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error adding salary:", error);

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to store salary data.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
    }
  };
  useEffect(() => {
    const storedVoucherNo = sessionStorage.getItem('currentVoucherNo');
    if (storedVoucherNo !== null && storedVoucherNo !== undefined) {
      setVoucherNo(Number(storedVoucherNo));
    }
  }, []);
  return (
    <Container sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        style={{
          padding: "20px",
   
         
          width: "600px",
          margin: "auto",
        }}
      
        className="paperbg"
      >
        <Typography
          variant="h6"
          align="center"
          sx={{ mb: 2, color: "#373A8F", fontWeight: "550" }}
        >
          SALARY PAYMENT
        </Typography>
           {voucherNo !== null && voucherNo !== undefined && (
        <Typography variant="subtitle1" align="center" sx={{ mb: 2, color: "#666" }}>
          Voucher No: <strong>{voucherNo}</strong>
        </Typography>
      )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              <Form.Group controlId="employeeName">
                <Form.Label style={{ fontWeight: 500 }}>
                  Employee Name
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter employee name"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  isInvalid={!!errors.employeeName}
                />
                <Form.Control.Feedback type="invalid">
                  Employee Name is required
                </Form.Control.Feedback>
              </Form.Group>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Form.Group controlId="designation">
                <Form.Label style={{ fontWeight: 500 }}>Designation</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  isInvalid={!!errors.designation} 
                />
                <Form.Control.Feedback type="invalid">
                  Designation is required
                </Form.Control.Feedback>
              </Form.Group>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Form.Group controlId="date">
                <Form.Label style={{ fontWeight: 500 }}>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  isInvalid={!!errors.date} 
                />
                <Form.Control.Feedback type="invalid">
                  Date is required
                </Form.Control.Feedback>
              </Form.Group>
            </Grid>
            <Grid item xs={12} sm={12}>
              <Form.Group controlId="salaryAmount">
                <Form.Label style={{ fontWeight: 500 }}>
                  Salary Amount
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter salary amount"
                  name="salaryAmount"
                  value={formData.salaryAmount}
                  onChange={handleInputChange}
                  isInvalid={!!errors.salaryAmount} 
                />
                <Form.Control.Feedback type="invalid">
                  Salary Amount is required
                </Form.Control.Feedback>
              </Form.Group>
            </Grid>
            <Grid item xs={12} align="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="sub-green"
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Salary;
