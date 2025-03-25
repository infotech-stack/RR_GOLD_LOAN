import React, { useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert";
import {
  Button,
  Paper,
  Grid,
  Typography,
  IconButton,
  Alert,
} from "@mui/material";
import Form from "react-bootstrap/Form";
import CloseIcon from "@mui/icons-material/Close";
import image from "../../src/Navbar/RR Gold Loan Logo.jpeg";
import { toWords } from "number-to-words";
import PaidVoucher from "./paidvoucher";
import { useReactToPrint } from "react-to-print";
const Tools = () => {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    rupeesInWords: "",
    purposeOfAmount: "",
    date: "", 
  });
  const [receivedFile, setReceivedFile] = useState(null);
  const [authorizedFile, setAuthorizedFile] = useState(null);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      const amount = parseFloat(value);

      const amountInWords = Number.isFinite(amount) ? toWords(amount) : "";
      setFormData({
        ...formData,
        [name]: value,
        rupeesInWords: amountInWords,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (setter) => (e) => {
    const selectedFile = e.target.files[0];
    setter(selectedFile);
  };

  const handleFileRemove = (setter) => () => {
    setter(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.purposeOfAmount || !formData.date) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/vouchers/add`,
        formData
      );

      console.log(response.data);
      Swal({
        title: "Success!",
        text: "Received voucher stored successfully!",
        icon: "success",
        button: "OK",
      });

      setError("");
    } catch (error) {
      console.error("There was an error submitting the form!", error);
    }
  };

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      <div ref={componentRef} className="printable-div">
        <div style={{ padding: "20px", marginTop: "0px" }}>
          <Paper
            elevation={2}
            style={{ padding: "20px" }}
            sx={{ maxWidth: 600, margin: "auto", backgroundColor: "#fdfffd" }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <img
                  src={image}
                  alt="Logo"
                  style={{ width: "60%", height: "auto" }}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <Typography
                  variant="h6"
                  align="center"
                  gutterBottom
                  sx={{ color: "#373A8F", fontWeight: 600 }}
                >
                  RR GOLD FINANCE
                </Typography>
                {/* <Typography variant="subtitle1" align="center">
                  Cell No: 9042425142, 9042425642
                </Typography>
                <Typography variant="body1" align="center" gutterBottom>
                  135/5 Velavan Complex, Near (MGN) Lodge, Salem Main Road,
                  <br />
                  Komarapalayam-638183
                </Typography> */}
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  align="center"
                  sx={{ fontWeight: 600 ,mb:2,color:'#005900'}}
                >
                  RECEIVED VOUCHER
                </Typography>
              </Grid>
            </Grid>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Form.Group controlId="date">
                    <Form.Label style={{fontWeight:500}}>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Form.Group controlId="name">
                    <Form.Label style={{fontWeight:500}}>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                    />
                  </Form.Group>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Form.Group controlId="amount">
                    <Form.Label style={{fontWeight:500}}>Amount</Form.Label>
                    <Form.Control
                      type="text"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter Amount"
                    />
                  </Form.Group>
                </Grid>
                <Grid item xs={12 } md={6}>
                  <Form.Group controlId="rupeesInWords">
                    <Form.Label style={{fontWeight:500}}>Rupees in Words</Form.Label>
                    <Form.Control
                      type="text"
                      name="rupeesInWords"
                      value={formData.rupeesInWords}
                      onChange={handleInputChange}
                      placeholder="Rupees in Words"
                     readOnly
                    />
                  </Form.Group>
                </Grid>
                <Grid item xs={12}>
                  <Form.Group controlId="purposeOfAmount">
                    <Form.Label style={{fontWeight:500}}>Purpose of Amount</Form.Label>
                    <Form.Control
                      type="text"
                      name="purposeOfAmount"
                      value={formData.purposeOfAmount}
                      onChange={handleInputChange}
                      placeholder="Purpose of Amount"
                    />
                  </Form.Group>
                </Grid>
              
                <Grid item xs={12} sm={6} sx={{mt:2}}>
                  {receivedFile ? (
                    <div style={{ position: "relative", textAlign: "center" }}>
                      <img
                        src={URL.createObjectURL(receivedFile)}
                        alt="Received Sign"
                        style={{ width: "90%", height: "60px"}}
                      />
                      <IconButton
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "rgba(255, 255, 255, 0.7)",
                        }}
                        onClick={handleFileRemove(setReceivedFile)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </div>
                  ) : (
                    <Button variant="outlined"  component="label" fullWidth sx={{ 
                      color: "#15137b", 
                      border: "1px solid rgba(8, 43, 109, 0.5)", 
                      "&:hover": { borderColor: "rgba(8, 43, 109, 0.5)" } 
                    }}
                    >
                      Upload Received Sign
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange(setReceivedFile)}
                      />
                    </Button>
                  )}
                </Grid>
                <Grid item xs={12} sm={6} sx={{mt:2}}>
                  {authorizedFile ? (
                    <div style={{ position: "relative", textAlign: "center" }}>
                      <img
                        src={URL.createObjectURL(authorizedFile)}
                        alt="Authorized Sign"
                        style={{ width: "90%", height: "60px" }}
                      />
                      <IconButton
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "rgba(255, 255, 255, 0.7)",
                        }}
                        onClick={handleFileRemove(setAuthorizedFile)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </div>
                  ) : (
                    <Button variant="outlined" component="label" fullWidth sx={{ 
                      color: "#15137b", 
                      border: "1px solid rgba(8, 43, 109, 0.5)", 
                      "&:hover": { borderColor: "rgba(8, 43, 109, 0.5)" } 
                    }}>
                      Upload Authorized Sign
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange(setAuthorizedFile)}
                      />
                    </Button>
                  )}
                </Grid>
              </Grid>
              <Grid
                container
                spacing={2}
                justifyContent="center"
                sx={{ mb: 7, mt: 2 }}
              >
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  style={{ marginTop: "20px" }}
                  className="sub-green print-button"
                >
                  Submit
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePrint}
                  style={{ marginTop: "20px", marginLeft: "10px" }}
                  className="print-button sub-green1"
                >
                  Print
                </Button>
              </Grid>
            </form>
          </Paper>
        </div>
      </div>
      <PaidVoucher />
    </>
  );
};

export default Tools;
