import React, { useState } from "react";
import {
  Button,
  TextField,
  Paper,
  Grid,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import "./report.css";
import Snackbar from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import PrintDialog from "./printDialog";
import { toWords } from "number-to-words";
import axios from "axios";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";



const Report = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const customerId = state?.customerId;
  const loanNumber = state?.loanNumber;
  const [jewelList, setJewelList] = useState([]);
  const [isClosed, setIsClosed] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [formData, setFormData] = useState({
    jewelNo: "",
    customerName: "",
    date: "",
    customerId: "",
    loanNo: "",
    mobileNumber: "",
    address: "",
    loan: "",
    loanAmount: "",
    totalAmount: "",
    items: "",
    quality: "",
    quantity: "",
    totalWeightGms: "",
    gross: "",
    net: "",
    agreementSigned: "",
    customerSign1: "",
    cashReceivedRs: "",
    rupeesInWords: "",
    paymentNo: "",
    paymentDate: "",
    receiptNo: "",
    noOfDays: "",
    interestPrinciple: "",
    balancePrinciple: "",
    remarks: "",
    loanClosureDate: "",
    lastDateForLoan: "",
    closedate: "",
    customersign: "",
    schema: "",
    percent: "",
    totalamount: "",
    isSchemaUpdated :"",
    interest: "",
    interestamount: "",
  });

  const [isReadOnly, setIsReadOnly] = useState(false);
  const [noOfDays, setNoOfDays] = useState(0);

  const [formDisabled, setFormDisabled] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    jewelNo: false,
    customerName: false,
    date: false,
    customerId: false,
    loanNo: false,
    mobileNumber: false,
    address: false,
    loan: false,
    loanAmount: false,
    totalAmount: false,
    items: false,
    quality: false,
    quantity: false,
    totalWeightGms: false,
    gross: false,
    net: false,
    agreementSigned: false,
    cashReceivedRs: false,
    rupeesInWords: false,
    paymentNo: false,
    paymentDate: false,
    receiptNo: false,
    noOfDays: false,
    interestPrinciple: false,
    balancePrinciple: false,
    remarks: false,
    loanClosureDate: false,
    customersign: false,
    cashiersign: false,
    authorizedFile: false,
    schema: false,
    percent: false,
    totalamount: false,
    interestamount: false,
    interest: false,
    lastDateForLoan: false,
  });
  useEffect(() => {
    const customerId = sessionStorage.getItem("customerId");
    const loanNumber = sessionStorage.getItem("loanNumber");

    if (customerId && loanNumber) {
      setFormData((prevData) => ({
        ...prevData,
        customerId: customerId,
        loanNo: loanNumber,
      }));
      fetchReportData(loanNumber);
      sessionStorage.removeItem("customerId");
      sessionStorage.removeItem("loanNumber");
    } else {
      navigate("/report");
    }
  }, [navigate]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const currentDate = new Date();
    const lastDateForLoan = new Date(formData.lastDateForLoan);

    if (name === "interestamount") {
      if (parseFloat(value) > parseFloat(formData.loanAmount)) {
        setValidationErrors((prevState) => ({
          ...prevState,
          interestamount: true,
        }));
        return;
      } else {
        setValidationErrors((prevState) => ({
          ...prevState,
          interestamount: false,
        }));
      }
    }

    

    if (name === "date") {
      const formattedDate = value; // Already in the correct format
      setFormData({ ...formData, [name]: formattedDate });

      // Handle loan amount and its conversion to words
    } else if (name === "loanamountbalance") {
      const amountInWords = toWords(value);
      
      setFormData({
        ...formData,
        [name]: value,
        rupeesInWords: amountInWords,
        
      });

      // Handle interest and its impact on total amount
    } else if (name === "interest") {
      const totalAmount = calculateTotalAmount(formData.loanAmount, value); // Calculate total amount
      setFormData({ ...formData, [name]: value, totalAmount });

      
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Handle fetching report data based on loanNo and customerId
    if (name === "loanNo") {
      setSelectedLoanNumber(value);
      fetchReportData(value);
    }

    if (name === "customerId") {
      fetchReportData(value);
    }
  };
 
  const calculateTotalAmount = (loanAmount, interest) => {
    // Assuming loanAmount and interest are numeric strings
    const loan = parseFloat(loanAmount) || 0;
    const interestAmount = parseFloat(interest) || 0;
    return (loan + interestAmount).toFixed(0); // Returning a fixed-point number
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
        setLoanNumbers(response.data);
        console.log("Loan Numbers:", response.data); // Log loan numbers to the console
      })
      .catch((error) => {
        console.error("Error fetching loan numbers:", error);
      });
  };
  const fetchReportData = (loanNumber) => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/ledger/loan/${loanNumber}`)
      .then((response) => {
        const reportData = response.data;
        const formattedDate = new Date(reportData.date)
          .toISOString()
          .split("T")[0];
        const formattedLastDateForLoan = new Date(reportData.lastDateForLoan)
          .toISOString()
          .split("T")[0];
          const amountInWords = toWords(
            Number.isFinite(parseFloat(reportData.loanamountbalance)) 
              ? parseFloat(reportData.loanamountbalance) 
              : parseFloat(reportData.loanAmount) || 0
          );
          

        setFormData({
          gross: reportData.gw,
          customerName: reportData.customerName,
          date: formattedDate,
          customerId: reportData.customerId,
          loanNo: reportData.loanNumber,
          mobileNumber: reportData.mobileNumber1,
          address: reportData.address,
          loanAmount: reportData.loanAmount,
          loanamountbalance: Number.isFinite(parseFloat(reportData.loanamountbalance)) 
          ? parseFloat(reportData.loanamountbalance) 
          : parseFloat(reportData.loanAmount) || 0,
        
          rupeesInWords: amountInWords,
          totalAmount: reportData.totalAmount,
          items: reportData.iw,
          quality: reportData.quality,
          quantity: reportData.quantity,
          interest: reportData.interest,
          totalWeightGms: reportData.iw,
          isSchemaUpdated:reportData.isSchemaUpdated,
          net: reportData.nw,
          schema: reportData.schema,
          percent: reportData.percent,
          lastDateForLoan: formattedLastDateForLoan,
        });
        const jewelList = reportData.jewelList || [];

        setJewelList(jewelList);
        setIsReadOnly(true);
        console.log("last date for loan", formattedLastDateForLoan);
      })
      .catch((error) => {
        console.error("Error fetching report data:", error);
      });
  };
  useEffect(() => {
    if (loanNumber) {
      fetchReportData(loanNumber);
    }
  }, [loanNumber]);
  useEffect(() => {
    const calculateDays = async () => {
      if (formData.paymentDate && formData.date) {
        try {
          const previousEntriesResponse = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/byLoanNo/${formData.loanNo}`
          );
          const previousEntries = previousEntriesResponse.data;

          previousEntries.sort(
            (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
          );

          let calculatedNoOfDays = 0;
          let lastPaymentDate;

          if (previousEntries.length > 0) {
            lastPaymentDate = new Date(previousEntries[0].paymentDate);

            calculatedNoOfDays =
              Math.floor(
                (new Date(formData.paymentDate) - lastPaymentDate) /
                  (1000 * 60 * 60 * 24)
              ) ;
          } else {
            const loanDate = new Date(formData.date);
            const paymentDate = new Date(formData.paymentDate);

            calculatedNoOfDays =
              Math.floor((paymentDate - loanDate) / (1000 * 60 * 60 * 24));
          }

          setNoOfDays(calculatedNoOfDays);
          setFormData((prevData) => ({
            ...prevData,
            noOfDays: calculatedNoOfDays.toString(),
          }));
        } catch (error) {
          console.error("Error calculating days:", error);
        }
      }
    };

    calculateDays();
  }, [formData.paymentDate, formData.loanNo, formData.date]);
  const calculateTotalAmounts = (loanAmount, interest) => {
    const loan = parseFloat(loanAmount) || 0;
    const interestAmount = parseFloat(interest) || 0;
    return (loan + interestAmount).toFixed(0);
  };

  const [tableData, setTableData] = useState([]);


  const [authorizedFile, setAuthorizedFile] = useState(null);
  const [customersign, setCustomersign] = useState(null);
  const [cashiersign, setCashiersign] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showSaveButton, setShowSaveButton] = useState(true);
  const [showOtherButtons, setShowOtherButtons] = useState(false);
  const handlePrint = (row) => {
    setSelectedRow({
      paymentDate: row.paymentDate,
      customerId: row.customerId,
      customerName: (formData && formData.customerName) || row.customerName,
      loanNo: (formData && formData.loanNo) || row.loanNo,
      jewelNo: (formData && formData.jewelNo) || row.jewelNo,
      schema: (formData && formData.schema) || row.schema,
      noOfDays: row.noOfDays,
      interestamount: row.interestamount,
      interestPrinciple: row.interestPrinciple,
      balance: row.balance,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFileChange = (setter) => (e) => {
    const selectedFile = e.target.files[0];
    setter(selectedFile);
  };

  const handleFileRemove = (setter) => () => {
    setter(null);
  };
  const submitReport = async (formDataToSend) => {
    try {
      formDataToSend.append("jewelList", JSON.stringify(jewelList));
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/report`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Report submitted successfully.");
    } catch (error) {
      console.error("Error submitting report:", error);
      Swal.fire({
        title: "Error!",
        text: "There was a problem submitting the report",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const calculateAndUpdateBalance = async () => {
    try {
      const previousEntriesResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/byLoanNo/${formData.loanNo}`
      );
      const previousEntries = previousEntriesResponse.data;

      previousEntries.sort(
        (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
      );

      let previousBalance = 0;
      let previousLoanAmountBalance = 0;
      let previousInterestBalAmount = 0;

      if (previousEntries.length > 0) {
        previousBalance = parseFloat(previousEntries[0].balance);
        previousLoanAmountBalance = parseFloat(
          previousEntries[0].loanamountbalance
        );
        previousInterestBalAmount = parseFloat(
          previousEntries[0].interestbalamount
        );
      }

      const totalAmountNum = parseFloat(formData.totalAmount);
      const interestAmountNum = Math.floor(parseFloat(formData.interestamount));
      const interestPrincipleNum = Math.floor(
        parseFloat(formData.interestPrinciple)
      );

      let principalAmount = parseFloat(formData.loanAmount);
      let interestRate = parseFloat(formData.percent);
      const numberOfDays = parseInt(formData.noOfDays);

      if (
        isNaN(principalAmount) ||
        isNaN(interestRate) ||
        isNaN(numberOfDays)
      ) {
        throw new Error("Invalid input: One or more values are not numbers.");
      }

      if (interestRate === 12) {
        interestRate = 0.12;
      } else if (interestRate === 18) {
        interestRate = 0.18;
      } else if (interestRate === 24) {
        interestRate = 0.24;
      } 
      else if (interestRate === 30) {
        interestRate = 0.24;
      } 
      else {
        throw new Error("Invalid interest rate: Must be 12, 18, or 24");
      }

      const dailyInterestRate = interestRate / 365;

      // Use previousLoanAmountBalance if available, otherwise use principalAmount
      const amountToCalculateInterest =
        previousLoanAmountBalance > 0
          ? previousLoanAmountBalance
          : principalAmount;
      const calculatedInterest =
        amountToCalculateInterest * dailyInterestRate * numberOfDays;

      const roundUpToNearestTen = (num) => Math.ceil(num / 10) * 10;

      let interestbalamount = roundUpToNearestTen(calculatedInterest);
      console.log(
        "Calculated Interest (Rounded to nearest 10):",
        interestbalamount
      );

      // If the interestPrinciple matches the calculated interest, set the interest balance to 0
      if (interestPrincipleNum >= interestbalamount) {
        interestbalamount = 0;
      }

      let loanamountbalance;
      if (previousEntries.length === 0) {
        loanamountbalance = principalAmount - interestAmountNum;
      } else {
        loanamountbalance = previousLoanAmountBalance - interestAmountNum;
      }

      let newBalance;

      if (previousBalance === 0) {
        newBalance = Math.floor(principalAmount - interestAmountNum);
        console.log("New Balance when previousBalance is 0:", newBalance);
      } else {
        newBalance = Math.floor(previousLoanAmountBalance - interestAmountNum);
        console.log("New Balance when previousBalance is NOT 0:", newBalance);
      }
      console.log("the new balance is :", newBalance);
      // Prevent negative balance
      if (newBalance < 0) {
        Swal.fire({
          icon: "error",
          title: "Payment Error",
          text: "Payment cannot be processed as it would result in a negative balance.",
        });
        return;
      }

      newBalance = Math.max(newBalance, 0);

      // Check if account should be closed
      if (newBalance === 0) {
        Swal.fire({
          icon: "info",
          title: "Account Closed",
          text: "The account is closed as the interest or loan balance is cleared.",
        });
        setSnackbarOpen(true);
        setSnackbarMessage("Account Closed");
        setFormDisabled(true);
        setIsClosed(true);
      }

      const newEntry = {
        ...formData,
        balance: newBalance,
        loanamountbalance: loanamountbalance,
        interestbalamount: interestbalamount,
      };
      console.log("The new entry is", newEntry);

      const updatedTableData = [newEntry, ...tableData];
      updatedTableData.sort(
        (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
      );

      setTableData(updatedTableData);

      // Update ledger information
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/ledger/updateLoan/${formData.loanNo}`,
        {
          loanamountbalance: loanamountbalance,
          interestbalamount: interestbalamount,
        }
      );

      Swal.fire({
        title: "Success!",
        html: `<p>Payment completed</p><p style="color: red;">Don't forget to save</p>`,
        icon: "success",
        confirmButtonText: "OK",
      });

      // Clear form data after successful operation
      setFormData({
        jewelNo: "",
        customerName: "",
        loanDate: "",
        customerId: "",
        loanNo: "",
        mobileNumber: "",
        address: "",
        loan: "",
        loanAmount: "",
        totalAmount: "",
        items: "",
        quality: "",
        quantity: "",
        totalWeightGms: "",
        gross: "",
        net: "",
        cashReceivedRs: "",
        rupeesInWords: "",
        paymentNo: "",
        paymentDate: "",
        receiptNo: "",
        noOfDays: "",
        agreementSigned: "",
        interestPrinciple: "",
        balancePrinciple: "",
        remarks: "",
        loanClosureDate: "",
        schema: "",
        percent: "",
        totalamount: "",
        interestamount: "",
        lastDateForLoan: "",
      });

      setCustomersign(null);
      setCashiersign(null);
      setAuthorizedFile(null);
      setShowSaveButton(true);
      setShowOtherButtons(false);
    } catch (error) {
      console.error("Error calculating and updating balance:", error);
      Swal.fire({
        title: "Error!",
        text: "There was a problem calculating the balance",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    let valid = true;
    let updatedErrors = { ...validationErrors };

    Object.keys(updatedErrors).forEach((field) => {
      updatedErrors[field] = !formData[field];
    });
    if (!formData.paymentDate) {
      updatedErrors.paymentDate = true;
      valid = false;
    } else {
      updatedErrors.paymentDate = false;
    }
    if (!formData.interestPrinciple) {
      updatedErrors.interestPrinciple = true;
      valid = false;
    } else {
      updatedErrors.interestPrinciple = false;
    }
    if (!formData.interestamount) {
      updatedErrors.interestamount = true;
      valid = false;
    } else {
      updatedErrors.interestamount = false;
    }
    if (!formData.noOfDays) {
      updatedErrors.noOfDays = true;
      valid = false;
    } else {
      updatedErrors.noOfDays = false;
    }

    setValidationErrors(updatedErrors);

    if (!valid) {
      Swal.fire({
        title: "Validation Error!",
        text: "Please fill in all required fields.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        formDataToSend.append(key, formData[key]);
      }
    }
    if (authorizedFile) {
      formDataToSend.append("authorizedFile", authorizedFile);
    }

    await submitReport(formDataToSend);
    await calculateAndUpdateBalance();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async (row) => {
    try {
      // Validate and format date
      if (!row || !row.paymentDate) {
        throw new Error("Row data is invalid");
      }

      const date = new Date(row.paymentDate);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid payment date provided");
      }
      const formattedDate = date.toISOString().split("T")[0];

      const formattedRow = {
        ...row,
        paymentDate: formattedDate,
        customerId: row.customerId,
        noOfDays: row.noOfDays || 0,
        interestbalamount: row.interestbalamount || 0,
        loanamountbalance: row.loanamountbalance || 0,
        interestPrincipleNum: row.interestPrinciple,
        interestAmountNum: row.interestamount,
      };

      // Check if the loan entry exists
      const checkResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/check/${formattedRow.loanNo}`
      );

      if (checkResponse.data.exists) {
        // Update existing entry
        const updateResponse = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/updateClosed/${formattedRow.loanNo}`,
          formattedRow
        );
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Data updated successfully",
        });
      } else {
        // Create new entry
        const createResponse = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/add`,
          formattedRow
        );
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Data saved successfully",
        });
      }

      // Reset UI after saving
      setShowSaveButton(false);
      setShowOtherButtons(true);
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving data:", error);
      if (error.response && error.response.status === 400) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Loan entry with this payment date already exists",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to save data",
        });
      }
      setIsSaved(false);
    }
  };

  const fetchTableData = async (loanNo) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/byLoanNo/${loanNo}`
      );
      console.log("API Response:", response.data);
      setShowSaveButton(false);
      setShowOtherButtons(true);
      if (Array.isArray(response.data) && response.data.length > 0) {
        setTableData(response.data);

        const hasClosedAccount = response.data.some(
          (entry) => entry.balance === 0
        );
        const hasAnyEntryClosed = response.data.some((entry) => entry.isClosed);

        setIsFormDisabled(hasClosedAccount || hasAnyEntryClosed);

        if (hasClosedAccount) {
          setSnackbarMessage("Account is closed");
          setSnackbarOpen(true);
        }
      } else {
        console.error("Unexpected API response format");
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
    }
  };

  useEffect(() => {
    const loanNo = formData.loanNo;
    if (loanNo) {
      fetchTableData(loanNo);
    }
  }, [formData.loanNo]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/delete/${id}`
          );
          Swal.fire("Deleted!", response.data.message, "success");
        } catch (error) {
          console.error("Error deleting loan entry:", error);
          Swal.fire("Error!", "Failed to delete loan entry", "error");
        }
      }
    });
  };

  return (
    <>
      <Snackbar open={snackbarOpen} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="info">
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <div style={{ padding: "20px", marginTop: "0px" }}>
        <Paper
          elevation={2}
          style={{ padding: "20px" }}
          sx={{ maxWidth: 1100, margin: "auto" }}
          className="paperbg"
        > {formData.isSchemaUpdated && (
          <Typography
            align="left"
            gutterBottom
            sx={{ color: "Red", fontWeight: "500", fontSize: "15px" }}
          >
            (Schema Changed)
          </Typography>
        )}
        
        <Typography
            variant="h6"
            align="center"
            gutterBottom
            sx={{ color: "#373A8F", fontWeight: "550" }}
          >
            APPRAISAL ENTRY
          </Typography>
          <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
  {/* Customer ID */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Customer ID</label>
      <input
        type="text"
        className={`form-control ${validationErrors.customerId ? "is-invalid" : ""}`}
        name="customerId"
        value={formData.customerId}
        onChange={handleInputChange}
        placeholder="Enter Customer ID"
        readOnly={isReadOnly}
      />
      {validationErrors.customerId && (
        <div className="invalid-feedback">Customer Id is required</div>
      )}
    </div>
  </Grid>


  {/* Loan Number */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Loan Number</label>
      <select
        className={`form-control ${validationErrors.loanNo ? "is-invalid" : ""}`}
        name="loanNo"
        value={formData.loanNo}
        onChange={handleInputChange}
        placeholder="Select Loan Number"
        disabled={isReadOnly}
      >
        <option value=""></option>
        {loanNumbers.map((loan) => (
          <option key={loan.loanNumber} value={loan.loanNumber}>
            {loan.loanNumber}
          </option>
        ))}
      </select>
      {validationErrors.loanNo && (
        <div className="invalid-feedback">Loan Number is required</div>
      )}
    </div>
  </Grid>

  {/* Name of the Borrower */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Name of the Borrower</label>
      <input
        type="text"
        className={`form-control ${validationErrors.customerName ? "is-invalid" : ""}`}
        name="customerName"
        value={formData.customerName}
        onChange={handleInputChange}
        placeholder="Enter Customer Name"
        readOnly={isReadOnly}
      />
      {validationErrors.customerName && (
        <div className="invalid-feedback">Customer Name is required</div>
      )}
    </div>
  </Grid>

  {/* Date of Loan */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Date of Loan</label>
      <input
        type="date"
        className={`form-control ${validationErrors.date ? "is-invalid" : ""}`}
        name="loanDate"
        value={formData.date}
        onChange={handleInputChange}
        placeholder="Enter Date of Loan"
        readOnly={isReadOnly}
      />
      {validationErrors.date && (
        <div className="invalid-feedback">Date is required</div>
      )}
    </div>
  </Grid>

  {/* Last Date for Loan */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Last Date for Loan</label>
      <input
        type="date"
        className={`form-control ${validationErrors.lastDateForLoan ? "is-invalid" : ""}`}
        name="lastDateForLoan"
        value={formData.lastDateForLoan}
        onChange={handleInputChange}
        placeholder="Enter Last Date for Loan"
        readOnly={isReadOnly}
      />
      {validationErrors.lastDateForLoan && (
        <div className="invalid-feedback">{validationErrors.lastDateForLoan}</div>
      )}
    </div>
  </Grid>

  {/* Mobile Number */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Mobile Number</label>
      <input
        type="text"
        className={`form-control ${validationErrors.mobileNumber ? "is-invalid" : ""}`}
        name="mobileNumber"
        value={formData.mobileNumber}
        onChange={handleInputChange}
        placeholder="Enter Mobile Number"
        readOnly={isReadOnly}
      />
      {validationErrors.mobileNumber && (
        <div className="invalid-feedback">Mobile Number is required</div>
      )}
    </div>
  </Grid>

  {/* Principle */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Principle</label>
      <input
        type="text"
        className={`form-control ${validationErrors.principal ? "is-invalid" : ""}`}
        name="principle"
        value={formData.loanAmount}
        onChange={handleInputChange}
        placeholder="Enter Principle Amount"
        readOnly={isReadOnly}
      />
      {validationErrors.principal && (
        <div className="invalid-feedback">Principle Amount is required</div>
      )}
    </div>
  </Grid>

  {/* Interest */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Interest</label>
      <input
        type="text"
        className={`form-control ${validationErrors.interest ? "is-invalid" : ""}`}
        name="interest"
        value={formData.interest}
        onChange={handleInputChange}
        placeholder="Enter Interest Amount"
        readOnly={isReadOnly}
      />
      {validationErrors.interest && (
        <div className="invalid-feedback">Interest is required</div>
      )}
    </div>
  </Grid>

  {/* Address */}
  <Grid item xs={12}>
    <div className="form-group">
      <label className="form-label">Address</label>
      <input
        type="text"
        className={`form-control ${validationErrors.address ? "is-invalid" : ""}`}
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        placeholder="Enter Address"
        readOnly={isReadOnly}
      />
      {validationErrors.address && (
        <div className="invalid-feedback">Address is required</div>
      )}
    </div>
  </Grid>
</Grid>

            <Typography
              variant="h6"
              sx={{ mt: 3, mb: 2, color: "#373A8F", fontWeight: "550" }}
              align="center"
            >
              LOAN DETAILS
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={4}>
    <div className="form-group">
      <label className="form-label">Rupees in Words</label>
      <input
        type="text"
        className={`form-control ${validationErrors.rupeesInWords ? "is-invalid" : ""}`}
        name="rupeesInWords"
        value={formData.rupeesInWords}
        onChange={handleInputChange}
        placeholder="Enter Rupees in Words"
        readOnly={isReadOnly}
      />
      {validationErrors.rupeesInWords && (
        <div className="invalid-feedback">Rupees in words is required</div>
      )}
    </div>
  </Grid>
  <Grid item xs={12} sm={4}>
    <div className="form-group">
      <label className="form-label">Agreement Signed and Cash Received (Rs)</label>
      <input
        type="text"
        className={`form-control ${validationErrors.loanAmount ? "is-invalid" : ""}`}
        name="loanAmount"
        value={formData.loanAmount}
        onChange={handleInputChange}
        placeholder="Enter Cash Amount"
        readOnly={isReadOnly}
      />
      {validationErrors.loanAmount && (
        <div className="invalid-feedback">Cash amount is required</div>
      )}
    </div>
  </Grid>
  <Grid item xs={12} sm={2}>
    <div className="form-group">
      <label className="form-label">Gross Weight</label>
      <input
        type="text"
        className={`form-control ${validationErrors.gw ? "is-invalid" : ""}`}
        name="gw"
        value={formData.gross}
        onChange={handleInputChange}
        placeholder="Enter Gross Weight"
        readOnly={isReadOnly}
      />
      {validationErrors.gw && (
        <div className="invalid-feedback">Gross Weight is required</div>
      )}
    </div>
  </Grid>
  <Grid item xs={12} sm={2}>
    <div className="form-group">
      <label className="form-label">Net Weight</label>
      <input
        type="text"
        className={`form-control ${validationErrors.nw ? "is-invalid" : ""}`}
        name="nw"
        value={formData.net}
        onChange={handleInputChange}
        placeholder="Enter Net Weight"
        readOnly={isReadOnly}
      />
      {validationErrors.nw && (
        <div className="invalid-feedback">Net Weight is required</div>
      )}
    </div>
  </Grid>
              <Table
                sx={{
                  width: "100%",
                  ml: 2,
                  borderCollapse: "collapse",
                  margin: "20px 0px 7px 10px",
                  fontSize: "16px",
                  color: "#333",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
                  border: "1px solid #ddd",
                }}
              >
                <TableHead
                  sx={{
                    backgroundColor: "#1784CC",
                  }}
                >
                  <TableRow>
                    <TableCell
                      sx={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                        fontWeight: "700",
                        color: "#fff",
                        borderTopLeftRadius: "8px",
                      }}
                    >
                      Jewel Details
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
                      Quality
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "2px solid #ddd",
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    >
                      Quantity
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jewelList.map((jewel, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:nth-of-type(even)": {
                          backgroundColor: "#f9f9f9",
                        },
                        "&:nth-of-type(odd)": {
                          backgroundColor: "#fff",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          padding: "12px",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {jewel.jDetails || "Unknown"}
                      </TableCell>
                      <TableCell
                        sx={{
                          padding: "12px",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {jewel.quality || "N/A"}
                      </TableCell>
                      <TableCell
                        sx={{
                          padding: "12px",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        {jewel.quantity || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>

            <Typography
              variant="h6"
              sx={{ mt: 3, mb: 2, color: "#373A8F", fontWeight: "550" }}
              align="center"
            >
              PAYMENT DETAILS
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
  {/* Schema */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Schema</label>
      <input
        type="text"
        className={`form-control ${validationErrors.schema ? "is-invalid" : ""}`}
        name="schema"
        value={formData.schema}
        onChange={handleInputChange}
        readOnly={isReadOnly}
        placeholder="Enter Schema"
        disabled={isFormDisabled}
      />
      {validationErrors.schema && (
        <div className="invalid-feedback">Schema is required</div>
      )}
    </div>
  </Grid>

  {/* Percent */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Percent</label>
      <input
        type="text"
        className={`form-control ${validationErrors.percent ? "is-invalid" : ""}`}
        name="percent"
        value={formData.percent}
        onChange={handleInputChange}
        placeholder="Enter Percent"
        readOnly={isReadOnly}
        disabled={isFormDisabled}
      />
      {validationErrors.percent && (
        <div className="invalid-feedback">Percent is required</div>
      )}
    </div>
  </Grid>

  {/* Date */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Date</label>
      <input
        type="date"
        className={`form-control ${validationErrors.paymentDate ? "is-invalid" : ""}`}
        name="paymentDate"
        value={formData.paymentDate}
        onChange={handleInputChange}
        placeholder="Enter Date"

        disabled={isFormDisabled}
      />
      {validationErrors.paymentDate && (
        <div className="invalid-feedback">Payment date is required</div>
      )}
    </div>
  </Grid>

  {/* Receipt No */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Receipt No</label>
      <input
        type="text"
        className={`form-control ${validationErrors.receiptNo ? "is-invalid" : ""}`}
        name="receiptNo"
        value={formData.receiptNo}
        onChange={handleInputChange}
        placeholder="Enter Receipt Number"
        disabled={isFormDisabled}
      />
      {validationErrors.receiptNo && (
        <div className="invalid-feedback">Receipt number is required</div>
      )}
    </div>
  </Grid>

  {/* Principle Paid */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Principle Paid</label>
      <input
        type="number"
        className={`form-control ${validationErrors.interestamount ? "is-invalid" : ""}`}
        name="interestamount"
        value={formData.interestamount}
        onChange={handleInputChange}
        placeholder="Enter Principle Paid"
        disabled={isFormDisabled}
        min={0}
      />
      {validationErrors.interestamount && (
        <div className="invalid-feedback">
          Principle amount cannot exceed {formData.loanAmount}
        </div>
      )}
    </div>
  </Grid>

  {/* No of Days */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">No of Days</label>
      <input
        type="text"
        className={`form-control ${validationErrors.noOfDays ? "is-invalid" : ""}`}
        name="noOfDays"
        value={formData.noOfDays}
        onChange={handleInputChange}
        placeholder="Enter Number of Days"
        disabled={isFormDisabled}
      />
      {validationErrors.noOfDays && (
        <div className="invalid-feedback">Number of days is required</div>
      )}
    </div>
  </Grid>

  {/* Interest Paid */}
  <Grid item xs={12} sm={3}>
    <div className="form-group">
      <label className="form-label">Interest Paid</label>
      <input
        type="number"
        className={`form-control ${validationErrors.interestPrinciple ? "is-invalid" : ""}`}
        name="interestPrinciple"
        value={formData.interestPrinciple}
        onChange={handleInputChange}
        placeholder="Enter Interest Paid"
        disabled={isFormDisabled}
        min={0}
      />
      {validationErrors.interestPrinciple && (
        <div className="invalid-feedback">Interest is required</div>
      )}
    </div>
  </Grid>

  {/* Balance Principle */}
  <Grid item xs={12} sm={6} md={4} className="disables">
    <div className="form-group">
      <label className="form-label">Balance Principle</label>
      <input
        type="text"
        className={`form-control ${validationErrors.balancePrinciple ? "is-invalid" : ""}`}
        name="balancePrinciple"
        value={formData.balancePrinciple}
        onChange={handleInputChange}
        placeholder="Enter Balance Principle"
        disabled={isFormDisabled}
      />
      {validationErrors.balancePrinciple && (
        <div className="invalid-feedback">Balance is required</div>
      )}
    </div>
  </Grid>

  {/* Total Amount */}
  <Grid item xs={12} sm={6} className="disables">
    <div className="form-group">
      <label className="form-label">Total Amount</label>
      <input
        type="text"
        className="form-control"
        name="totalAmount"
        value={formData.totalAmount}
        onChange={handleInputChange}
        placeholder="Enter Total Amount"
        disabled={isFormDisabled}
      />
    </div>
  </Grid>

  {/* Remarks */}
  <Grid item xs={12} sm={3}>
    <div className="form-group">
      <label className="form-label">Remarks</label>
      <input
        type="text"
        className={`form-control ${validationErrors.remarks ? "is-invalid" : ""}`}
        name="remarks"
        value={formData.remarks}
        onChange={handleInputChange}
        placeholder="Enter Remarks"
        disabled={isFormDisabled}
      />
      {validationErrors.remarks && (
        <div className="invalid-feedback">Remarks is required</div>
      )}
    </div>
  </Grid>
</Grid>

           <Grid container spacing={2} justifyContent="space-between" sx={{ mt: 2 }}>
  {/* Customer Signature */}
  <Grid item xs={12} sm={6} md={3}>
    {customersign ? (
      <div style={{ position: "relative", textAlign: "center" }}>
        <img
          src={URL.createObjectURL(customersign)}
          alt="Customer Signature"
          style={{ width: "90%", height: "60px" }}
        />
        <button
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "rgba(255, 255, 255, 0.7)",
            border: "none",
            cursor: "pointer",
          }}
          onClick={handleFileRemove(setCustomersign)}
        >
          <CloseIcon />
        </button>
      </div>
    ) : (
      <div className="form-group">
        <label className="btn btn-outline-primary w-100">
          Customer Signature
          <input
            type="file"
            hidden
            onChange={handleFileChange(setCustomersign)}
          />
        </label>
      </div>
    )}
  </Grid>

  {/* Cashier Signature */}
  <Grid item xs={12} sm={6} md={3}>
    {cashiersign ? (
      <div style={{ position: "relative", textAlign: "center" }}>
        <img
          src={URL.createObjectURL(cashiersign)}
          alt="Cashier Signature"
          style={{ width: "90%", height: "60px" }}
        />
        <button
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "rgba(255, 255, 255, 0.7)",
            border: "none",
            cursor: "pointer",
          }}
          onClick={handleFileRemove(setCashiersign)}
        >
          <CloseIcon />
        </button>
      </div>
    ) : (
      <div className="form-group">
        <label className="btn btn-outline-primary w-100">
          Cashier Signature
          <input
            type="file"
            hidden
            onChange={handleFileChange(setCashiersign)}
          />
        </label>
      </div>
    )}
  </Grid>

  {/* Loan Closure Date */}
  <Grid item xs={12} sm={6} md={3}>
    <div className="form-group">
      <label className="form-label">Loan Closure Date</label>
      <input
        type="date"
        className={`form-control ${validationErrors.closedate ? "is-invalid" : ""}`}
        name="closedate"
        value={formData.closedate}
        onChange={handleInputChange}
      />
      {validationErrors.closedate && (
        <div className="invalid-feedback">Loan Closure Date is required</div>
      )}
    </div>
  </Grid>
</Grid>
            <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                className="add-but"
                color="primary"
                disabled={formDisabled}
                style={{ marginRight: "10px" }}
              >
                Add
              </Button>
            </Grid>
          </form>
        </Paper>
      </div>
      <div style={{ padding: "20px", marginTop: "20px" }}>
        <Paper
          elevation={2}
          style={{ padding: "20px" }}
          sx={{ maxWidth: 1100, margin: "auto" }}
          className="paperbg"
        >
          <form onSubmit={handleSubmit}></form>

          <TableContainer component={Paper}>
            <Table sx={{ border: "1px solid black" }}>
              <TableHead sx={{ backgroundColor: "#1784CC", fontWeight: 500 }}>
                <TableRow sx={{ border: "1px solid black" }}>
                  <TableCell
                    sx={{
                      border: "1px solid black",
                      color: "white",
                      fontWeight: 500,
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    className="disables"
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    className="disables"
                  >
                    Interest
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    className="disables"
                  >
                    Total Amount
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid black",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    CustomerID
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid black",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    Loan no
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid black",
                      color: "white",
                      fontWeight: 600,
                      width: "50px",
                    }}
                  >
                    No of Days
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid black",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    Interest
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid black",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    Principal
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid black",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    Balance
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid black",
                      color: "white",
                      fontWeight: 600,
                      width: "70px",
                    }}
                  >
                    Principal Balance
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid black",
                      color: "white",
                      fontWeight: 600,
                      width: "70px",
                    }}
                  >
                    Interest Balance
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    className="disables"
                  >
                    jewel no
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    className="disables"
                  >
                    customer name
                  </TableCell>
                  <TableCell
                    sx={{ border: "1px solid black" }}
                    className="disables"
                  >
                    schema
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid black",
                      color: "white",
                      fontWeight: 600,
                    }}
                    align="center"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {row.paymentDate}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      className="disables"
                    >
                      {row.loanAmount}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      className="disables"
                    >
                      {row.interest}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      className="disables"
                    >
                      {row.totalAmount}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {row.customerId}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {row.loanNo}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {row.noOfDays}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {row.interestPrinciple}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {row.interestamount}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {row.balance}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {row.loanamountbalance}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {row.interestbalamount}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      className="disables"
                    >
                      {row.jewelNo}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      className="disables"
                    >
                      {row.customerName}
                    </TableCell>
                    <TableCell
                      sx={{ border: "1px solid black" }}
                      className="disables"
                    >
                      {row.schema}
                    </TableCell>
                    <TableCell sx={{ border: "1px solid black" }}>
                      {showSaveButton && (
                        <Button
                          variant="contained"
                          className="report-button sub-but"
                          onClick={() => handleSave(row)}
                          sx={{ mt: 1, ml: 1 }}
                        >
                          Save
                        </Button>
                      )}
                      {showOtherButtons && (
                        <>
                          <Button
                            variant="contained"
                            className="report-button sub-print"
                            onClick={() => handlePrint(row)}
                            sx={{ mt: 1, ml: 1 }}
                          >
                            Voucher
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            className="report-button sub-del"
                            sx={{ mt: 1, ml: 1 }}
                            onClick={() => handleDelete(row._id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <PrintDialog
            open={openDialog}
            onClose={handleCloseDialog}
            data={selectedRow}
          />
        </Paper>
      </div>
    </>
  );
};

export default Report;
