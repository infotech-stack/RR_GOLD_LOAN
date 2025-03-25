import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  useMediaQuery,
  useTheme,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Form } from "react-bootstrap";
import { faCreditCard   } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const Accounts = () => {
  const [productName, setProductName] = useState("");
  const [date, setDate] = useState("");
  const [totalRupees, setTotalRupees] = useState("");
  const [isResale, setIsResale] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [voucherNo, setVoucherNo] = useState("");
  const [errors, setErrors] = useState({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchNextVoucherNo();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form fields
    if (!productName || !date || !totalRupees) {
      setErrors({
        productName: !productName,
        date: !date,
        totalRupees: !totalRupees,
      });
      return;
    }

    try {
      // Prepare data for the POST request
      const data = {
        productName,
        date,
        totalRupees: parseFloat(totalRupees),
        ...(isResale && { quantity, weight, voucherNo }),
      };

      // Send POST request to backend
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/expenses/add`,
        data
      );

      console.log("Expense added:", response.data);

      // Reset form fields and errors
      resetForm();
      setErrors({});

      // Show SweetAlert success message
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Day to Day Expenses stored successfully.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to store Day to Day Expenses.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
    }
  };

  const resetForm = () => {
    setProductName("");
    setDate("");
    setTotalRupees("");
    setIsResale(false);
    setQuantity("");
    setWeight("");
    setVoucherNo("");
  };
  const fetchNextVoucherNo = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/expenses/next-voucher`
      );
      console.log("Voucher response:", response.data); // Log response
      setVoucherNo(response.data.voucherNo);
    } catch (error) {
      console.error("Error fetching voucher number:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch voucher number.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
    }
  };
  return (
    <Paper
      elevation={3}
      style={{
        padding: "20px",
        margin: "auto",
        marginTop: "80px",
        maxWidth: "600px",
        width: "100%",
        boxSizing: "border-box",
      }}
      className="paperbg"
    >
      <Typography
        variant="h6"
        align="center"
        sx={{ mb: 2, color: "#373A8F", fontWeight: "550" }}
      >
       <FontAwesomeIcon icon={faCreditCard  } size="1.2x" style={{ color: "#373A8F" }} /> DAY TO DAY EXPENSES
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Form.Group controlId="productName">
              <Form.Label style={{ fontWeight: 500 }}>
                Expense Description
              </Form.Label>
              <Form.Control
                type="text"
                value={productName}
                placeholder="Enter expense description"
                onChange={(e) => setProductName(e.target.value)}
                isInvalid={!!errors.productName} // Bootstrap's error handling
              />
              <Form.Control.Feedback type="invalid">
                Product Name is required
              </Form.Control.Feedback>
            </Form.Group>
          </Grid>
          <Grid item xs={12}>
            <Form.Group controlId="date">
              <Form.Label style={{ fontWeight: 500 }}>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                isInvalid={!!errors.date} // Bootstrap's validation styling
              />
              <Form.Control.Feedback type="invalid">
                Date is required
              </Form.Control.Feedback>
            </Form.Group>
          </Grid>
          <Grid item xs={12}>
            <Form.Group controlId="totalRupees">
              <Form.Label style={{ fontWeight: 500 }}>Amount</Form.Label>
              <Form.Control
                type="text"
                value={totalRupees}
                placeholder="Enter amount"
                onChange={(e) => setTotalRupees(e.target.value)}
                isInvalid={!!errors.totalRupees} // Shows error styling if validation fails
              />
              <Form.Control.Feedback type="invalid">
                Total Rupees is required
              </Form.Control.Feedback>
            </Form.Group>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isResale}
                  onChange={() => setIsResale((prev) => !prev)}
                  color="primary"
                />
              }
              label="Resale"
            />
          </Grid>
          {isResale && (
            <>
              <Grid item xs={12}>
                <Form.Group controlId="quantity">
                  <Form.Label style={{ fontWeight: 500 }}>Quantity</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </Form.Group>
              </Grid>
              <Grid item xs={12}>
                <Form.Group controlId="weight">
                  <Form.Label style={{ fontWeight: 500 }}>Weight</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </Form.Group>
              </Grid>
              <Grid item xs={12}>
                <Form.Group controlId="voucherNo">
                  <Form.Label style={{ fontWeight: 500 }}>
                    Voucher No
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Auto-generated voucher number"
                    value={voucherNo}
                    readOnly
                  />
                </Form.Group>
              </Grid>
            </>
          )}
        </Grid>
        <Grid container justifyContent="center" sx={{ mt: 2 }} align="center">
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              className="sub-green"
              size={isMobile ? "small" : "medium"}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default Accounts;
