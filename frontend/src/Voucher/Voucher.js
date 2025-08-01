import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Paper,
  Grid,
  Typography,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  IconButton,
  TableCell,
  Box,
} from "@mui/material";
import { toWords } from "number-to-words";
import axios from "axios";
import image from "../../src/Navbar/RR Gold Loan Logo.jpeg";
import "./Voucher.css";
import { capitalize } from "lodash";

const Voucher = () => {
  const [formData, setFormData] = useState({
    customerId: "",
    loanNo: "",
    jwNo: "",
    date: "",
    customerName: "",
    schema: "",
    rupeesInWords: "",
    principal: "",
    interest: "",
    noOfDays: "",
    loanAmount: "",
    cashier: "",
    customer: "",
    percent: "",
    laonsamount: "",
    interestPrinciple: "",
    interestAmount: "",
    balance: "",
    paymentDate:"",
    receiptNo:""
  });
  const [file, setFile] = useState(null);
  const [customerFile, setCustomerFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "loanNo") {
      setSelectedLoanNumber(value);
      fetchLoanDetails(value);
    } else if (name === "date") {
      const formattedDate = value;
      setFormData({ ...formData, [name]: formattedDate });
    } else if (name === "loanAmount") {
      const amountInWords = toWords(value);
      setFormData({ ...formData, [name]: value, rupeesInWords: amountInWords });
    }
  };
  const [loanNumbers, setLoanNumbers] = useState([]);
  const [selectedLoanNumber, setSelectedLoanNumber] = useState("");
  useEffect(() => {
    if (formData.customerId) {
      fetchLoanNumbers(formData.customerId);
    }
  }, [formData.customerId]);

  const fetchLoanNumbers = (customerId) => {
    axios
      .get(
        `${process.env.REACT_APP_BACKEND_URL}/api/ledger/loans/${customerId}`
      )
      .then((response) => {
        console.log("Full response data:", response.data);
        response.data.forEach((loan, index) => {
          console.log(`Loan ${index + 1} details:`, {
            loanNumber: loan.loanNumber,
            date: loan.date,
         
            customerName: loan.customerName,
            mobileNumber1: loan.mobileNumber1,
            mobileNumber2: loan.mobileNumber2,
            landmark: loan.landmark,
            address: loan.address,
            jDetails: loan.jDetails,
            quality: loan.quality,
            quantity: loan.quantity,
            iw: loan.iw,
            gw: loan.gw,
            nw: loan.nw,
            schema: loan.schema,
            percent: loan.percent,
            loanAmount: loan.loanAmount,
          });
        });
        setLoanNumbers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching loan numbers:", error);
      });
  };

  const fetchLoanDetails = (loanNumber) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/ledger/loan/${loanNumber}`)
      .then((response) => {
        const ledgerData = response.data;
        const formattedDate = new Date(ledgerData.date)
          .toISOString()
          .split("T")[0];
        const amountInWords = toWords(ledgerData.loanAmount);
        setFormData((prevData) => ({
          ...prevData,
          customerId: ledgerData.customerId,
          loanNo: ledgerData.loanNumber,
          
          date: formattedDate,
          paymentDate:ledgerData.paymentDate,
          receiptNo:ledgerData.receiptNo,
          customerName: ledgerData.customerName,
          schema: ledgerData.schema,
          rupeesInWords: amountInWords,
          principal: ledgerData.principal,
          interest: ledgerData.interest,
          loanAmount: ledgerData.loanAmount,
          cashier: ledgerData.cashier,
          customer: ledgerData.customer,
          percent: ledgerData.percent,
          loansAmount: ledgerData.loansAmount,
        }));

        return axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/byLoanNo/${ledgerData.loanNumber}`
        );
      })
      .then((loanEntryResponse) => {
        const loanEntries = loanEntryResponse.data;
        console.log(loanEntries);

        if (loanEntries.length > 0) {
          const latestEntry = loanEntries[0];

          setFormData((prevData) => ({
            ...prevData,
            noOfDays: latestEntry.noOfDays,
            interestPrinciple: latestEntry.interestPrinciple,
            interestAmount: latestEntry.interestamount,
            balance: latestEntry.balance,
            paymentDate:latestEntry.paymentDate,
            receiptNo:latestEntry.receiptNo
          }));
        }
      })
      .catch((error) => {
        console.error("Error fetching loan details:", error);
      });
  };

  

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    
    setFormData({
      customerId: "",
      loanNo: "",
      jwNo: "",
      date: "",
      customerName: "",
      schema: "",
      rupeesInWords: "",
      principal: "",
      interest: "",
      noOfDays: "",
      loanAmount: "",
      cashier: "",
      customer: "",
      percent: "",
      laonsamount: "",
    });
  };

const handlePrint = () => {
  // Get the receipt content
  const receiptContent = document.querySelector('.receipt-print-area');
  
  // Create a print container
  const printContainer = document.createElement('div');
  printContainer.className = 'print-container';
  
  // Clone the content twice
  const copy1 = receiptContent.cloneNode(true);
  const copy2 = receiptContent.cloneNode(true);
  copy1.querySelector('select[name="loanNo"]').value = formData.loanNo;
copy2.querySelector('select[name="loanNo"]').value = formData.loanNo;

  
  
  // Build the print document
  printContainer.appendChild(copy1);
  printContainer.appendChild(copy2);
  
  // Add to body
  document.body.appendChild(printContainer);
  
  // Add print styles
  const style = document.createElement('style');
  style.innerHTML = `
  @media print {
    body > *:not(.print-container) {
      display: none !important;
    }

    .print-container {
      display: flex !important;
      flex-direction: column;
      width: 100%;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      page-break-inside: avoid;
    }

    .receipt-print-area {
      margin: 8mm auto 10mm auto;
      width: 100%;
      max-width: 180mm; /* A4 width with some padding */
      page-break-inside: avoid;
    }

    .print-container .receipt-print-area + .receipt-print-area {
      margin-top: 10mm; /* spacing between the two copies */
    }

    .print-divider {
      display: none; /* Remove any page break divider */
    }

    .print-button {
      display: none !important;
    }
  }

  @media screen {
    .print-container {
      display: none !important;
    }
  }
`;

  document.head.appendChild(style);

  window.print();

  // Clean up
  setTimeout(() => {
    document.head.removeChild(style);
    document.body.removeChild(printContainer);
  }, 1000);
};

  return (
    <div style={{ padding: "20px", marginTop: "0px" }}>
      <Paper
        elevation={2}
        style={{ padding: "20px" }}
        sx={{ maxWidth: 600, margin: "auto",mt:-1 }}
        className="paperbg2 receipt-print-area"
      >
        <Grid container spacing={2} >
          <Grid item xs={12} sm={5}>
            <img
              src={image}
              alt="Logo"
              style={{ width: "60%", height: "auto",marginRight:"40px" }}
            />
          </Grid>
          <Grid item xs={12} sm={7}>
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              className="headss"
            >
             RR GOLD FINANCE
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{mt:-1}}>
            Cell No:  9489719090, 6382845409
            </Typography>
            <Typography variant="body1" fontSize={14} align="center" gutterBottom>
            960, Main Road, (Opp. Dhana Book Nilayam)
              <br />
              BHAVANI - 638 301. Erode Dt
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" align="center" sx={{mt:-2}}>
              Receipt Voucher
            </Typography>
          </Grid>
        </Grid>
  <Box display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
  <Typography variant="body1" fontWeight={500} mr={1}>
    Receipt No:
  </Typography>
  <Typography variant="body1">{formData.receiptNo}</Typography>
</Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer Id"
                name="customerId"
                value={formData.customerId}
                onChange={handleInputChange}
                variant="standard"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Loan Number"
                name="loanNo"
                value={formData.loanNo}
                onChange={handleInputChange}
                variant="standard"
                fullWidth
                required
                SelectProps={{
                  native: true,
                }}
              >
                <option value=""></option>
                {loanNumbers.map((loan) => (
                  <option key={loan.loanNumber} value={loan.loanNumber}>
                    {loan.loanNumber}
                  </option>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                variant="standard"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Schema"
                name="schema"
                value={formData.schema}
                onChange={handleInputChange}
                variant="standard"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="No Of Days"
                name="rupeesInWords"
                value={formData.noOfDays}
                onChange={handleInputChange}
                variant="standard"
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.paymentDate}
                onChange={handleInputChange}
                variant="standard"
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TableContainer
                component={Paper}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "10px auto",
                  maxWidth: "80%",
                }}
                sx={{ mt: 2, mb: 5 }}
                className="tables"
              >
                <Table
                  aria-label="Customer Entry Details - Part 2"
                  className="table-bordered"
                >
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Principal Paid: {formData.interestAmount}
                        </Typography>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Interest Paid: {formData.interestPrinciple}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body1">
                          Balance: {formData.balance}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Total Paid"
                value={
                  (parseFloat(formData.interestAmount) || 0) +
                  (parseFloat(formData.interestPrinciple) || 0)
                }
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Cashier Sign"
            name="cashierSign"
            value={formData.cashierSign}
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            fullWidth
            
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Customer Sign"
            name="customerSign"
            value={formData.customerSign}
            onChange={handleInputChange}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            fullWidth
         
          />
        </Grid>


            <Grid item xs={12} align="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="print-button newprint"
                fullWidth
                onClick={handlePrint}
              >
                Print
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
  
    </div>
  );
};

export default Voucher;
