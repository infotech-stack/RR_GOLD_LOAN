import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button,
  IconButton,
  Grid,
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { fetchPaymentEntries } from "../actions/customerActions";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import { useDispatch, useSelector } from "react-redux";
import ProofSection from "./proofSection";
import PaymentDetails from "./paymentDetails";
import { useNavigate } from "react-router-dom";
import "./customers.css";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { faMoneyCheck } from "@fortawesome/free-solid-svg-icons";
import { faGem } from "@fortawesome/free-solid-svg-icons";
import { faAddressCard } from "@fortawesome/free-solid-svg-icons";
import { faMoneyBill, faWallet } from "@fortawesome/free-solid-svg-icons";
const CustomerDialog = ({
  open,
  onClose,
  entry,
  paymentEntries,
  customerId,
  loanNumber,
}) => {
  const dispatch = useDispatch();
  const jewelList = entry && entry.jewelList ? entry.jewelList : [];
  const [editableList, setEditableList] = useState(jewelList);
  const [isTableVisible, setTableVisible] = useState(false);
  const [isProofVisible, setProofVisible] = useState(false);
  const [isPaymentVisible, setIsPaymentVisible] = useState(false);
  const [tempJewelValue, setTempJewelValue] = useState("");
  const [tempQualityValue, setTempQualityValue] = useState("");
  const [selectedJewelIndex, setSelectedJewelIndex] = useState(null);
  const [selectedQualityIndex, setSelectedQualityIndex] = useState(null);
  const [isJewelDialogOpen, setIsJewelDialogOpen] = useState(false);
  const [isQualityDialogOpen, setIsQualityDialogOpen] = useState(false);
  const [jewelOptions, setJewelOptions] = useState([
    "chain",
    "bracelet",
    "bangle",
    "stud jimmiki",
    "stud thongal",
    "stud drops",
    "ring",
    "coin",
    "dollar",
    "anklet",
    "stone stud",
    "mattal",
    "mugaphu chain",
    "silver",
    "others",
  ]);
  const [qualityOptions, setQualityOptions] = useState([
    "916",
    "916 Hallmark",
    "H/M",
    "22K",
    "20K",
    "KDM",
    "916 KDM",
    "916 ZDM",
    "others",
  ]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [formData, setFormData] = useState({
    noOfDays: "",
  });
  const [noOfDays, setNoOfDays] = useState(0);
  const toggleTableVisibility = () => {
    setTableVisible(!isTableVisible);
  };
  const toggleProofVisibility = () => {
    setProofVisible(!isProofVisible);
  };
  const togglePaymentVisibility = () => {
    setIsPaymentVisible(!isPaymentVisible);
  };
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("Customer ID:", customerId);
    console.log("Loan Number:", loanNumber);
    sessionStorage.setItem("customerId", customerId);
    sessionStorage.setItem("loanNumber", loanNumber);
    navigate("/report");
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editableEntry, setEditableEntry] = useState(entry);
  useEffect(() => {
    if (entry && entry.loanNumber) {
      dispatch(fetchPaymentEntries(entry.loanNumber));
    }
  }, [dispatch, entry]);

  useEffect(() => {
  }, [paymentEntries]);
  useEffect(() => {
    if (
      editableEntry.customerName &&
      editableEntry.mobileNumber1.length === 10
    ) {
      setEditableEntry((prevEntry) => ({
        ...prevEntry,
        customerId: `${editableEntry.customerName
          .slice(0, 3)
          .toUpperCase()}${editableEntry.mobileNumber1
          .slice(-4)
          .toUpperCase()}`,
      }));
    }
  }, [editableEntry.customerName, editableEntry.mobileNumber1]);
  useEffect(() => {
    if (editableEntry.date) {
      const formattedDate = formatDateForInput(editableEntry.date);
      setEditableEntry((prevEntry) => ({ ...prevEntry, date: formattedDate }));
    }
  }, [editableEntry.date]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const currentGrossWeight = calculateGrossWeight(editableList);
      const updatedData = {
        ...editableEntry,
        jewelList: editableList, 
        gw: currentGrossWeight,
        date: editableEntry.date,
      };

      // Send the PUT request
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/ledger/update/${loanNumber}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setSnackbarMessage("Data updated successfully");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Failed to update data");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      console.error(
        "Error updating data:",
        error.response ? error.response.data : error.message
      );

      if (error.response && error.response.data.errors) {
        const validationError = error.response.data.errors[0];

        setSnackbarMessage(`${validationError.msg}`);
      } else {
        setSnackbarMessage("Failed to update data");
      }
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      setIsEditing(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const parseDateString = (dateString) => {
    const [day, month, year] = dateString.split("/");
    if (!day || !month || !year) {
      console.error("Invalid date format:", dateString);
      return null;
    }
    return new Date(`${year}-${month}-${day}`);
  };

  const formatDateForInput = (date) => {
    if (!date) return "";

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date:", date);
      return "";
    }

    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = dateObj.getFullYear();

    // Return in the required format for input[type="date"]: YYYY-MM-DD
    return `${year}-${month}-${day}`;
  };

  const calculateInterest = (loanAmount, percent, months) => {
    return Math.floor((loanAmount * percent * months) / (12 * 100));
  };
  const handleOpenJewelDialog = (index) => {
    setTempJewelValue("");
    setSelectedJewelIndex(index);
    setIsJewelDialogOpen(true);
  };

  const handleOpenQualityDialog = (index) => {
    setTempQualityValue("");
    setSelectedQualityIndex(index);
    setIsQualityDialogOpen(true);
  };

  const handleSaveJewel = () => {
    if (tempJewelValue.trim() === "") return;

    setJewelOptions((prevOptions) => {
      if (!prevOptions.includes(tempJewelValue)) {
        return [...prevOptions, tempJewelValue];
      }
      return prevOptions;
    });

    const updatedList = [...editableList];
    if (selectedJewelIndex !== null && selectedJewelIndex >= 0) {
      updatedList[selectedJewelIndex].jDetails = tempJewelValue;
      setEditableList(updatedList);
    }

    setTempJewelValue("");
    setIsJewelDialogOpen(false);
  };

  const handleSaveQuality = () => {
    if (tempQualityValue.trim() === "") return;

    setQualityOptions((prevOptions) => {
      if (!prevOptions.includes(tempQualityValue)) {
        return [...prevOptions, tempQualityValue];
      }
      return prevOptions;
    });

    const updatedList = [...editableList];
    if (selectedQualityIndex !== null && selectedQualityIndex >= 0) {
      updatedList[selectedQualityIndex].quality = tempQualityValue;
      setEditableList(updatedList);
    }

    setTempQualityValue("");
    setIsQualityDialogOpen(false);
  };

  const convertDateFormat = (dateStr) => {
    console.log("Converting date:", dateStr);
    if (!dateStr) {
      console.error("Received null or undefined date string");
      return null;
    }

    // Check if the date string is in YYYY-MM-DD format
    const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (yyyymmddRegex.test(dateStr)) {
      return new Date(dateStr); // Directly return a Date object
    }

    // Otherwise, assume it's in DD/MM/YYYY format
    const [day, month, year] = dateStr.split("/");
    if (!day || !month || !year) {
      console.error("Invalid date format:", dateStr);
      return null;
    }

    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date.getTime())) {
      console.error("Converted date is invalid:", date);
      return null;
    }

    return date;
  };

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;

    if (name === undefined) {
      console.error("Error: `name` property is missing from event target.");
      return;
    }

    if (index !== null) {
      const updatedList = [...editableList];
      updatedList[index] = { ...updatedList[index], [name]: value };
      console.log("Updated List in Handle Change:", updatedList);
      setEditableList(updatedList);

      if (name === "jDetails" && value === "others")
        handleOpenJewelDialog(index);
      else if (name === "quality" && value === "others")
        handleOpenQualityDialog(index);
    } else {
      setEditableEntry((prevEntry) => {
        let updatedEntry = { ...prevEntry, [name]: value };

        if (name === "date") {
          const loanDate = convertDateFormat(value); // Convert string to Date
          console.log("Parsed loanDate:", loanDate);

       if (loanDate) {
            let newLastDateForLoan;
            let daysToAdd = 0;

            if (updatedEntry.schema === "LGL") {
              daysToAdd = 365;
            } else if (updatedEntry.schema === "MGL" || updatedEntry.schema === "HGL") {
              daysToAdd = 180;
            } else if (updatedEntry.schema === "HGL-SPCL") {
              daysToAdd = 90;
            }

            const calculatedDate = new Date(loanDate);
            calculatedDate.setDate(calculatedDate.getDate() + daysToAdd);

            newLastDateForLoan = formatDateForInput(calculatedDate);

            console.log(
              `Calculated newLastDateForLoan for schema ${updatedEntry.schema}:`,
              newLastDateForLoan
            );
            updatedEntry.lastDateForLoan = newLastDateForLoan;
          }
          else {
            console.error(
              "Invalid loanDate parsed, lastDateForLoan won't be updated."
            );
          }
        }


        // Interest calculation
        if (name === "loanAmount") {
          let interest = 0;

          if (updatedEntry.schema === "LGL") {
            interest = calculateInterest(value, 12, 12); // 12% for 12 months
          } else if (updatedEntry.schema === "MGL") {
            interest = calculateInterest(value, 18, 6);  // 18% for 6 months
          } else if (updatedEntry.schema === "HGL") {
            interest = calculateInterest(value, 24, 6);  // 24% for 6 months
          } else if (updatedEntry.schema === "HGL-SPCL") {
            interest = calculateInterest(value, 30, 3);  // 24% for 3 months
          }

          updatedEntry.interest = interest;
        }
        if (name === 'iw' || name === 'gw') {
          updatedEntry[name] = parseFloat(value);
  
          if (name === 'iw') {
            // When jewel weight changes, update gross weight from the jewel list
            const newGrossWeight = calculateGrossWeight(editableList);
            updatedEntry.gw = newGrossWeight;
            updatedEntry.nw = (newGrossWeight - parseFloat(updatedEntry.iw || 0)).toFixed(2);
          } else {
            // When gross weight is directly modified
            const iw = parseFloat(updatedEntry.iw || 0);
            updatedEntry.nw = (parseFloat(value) - iw).toFixed(2);
          }
        }

        return updatedEntry;
      });
    }
  };

const handleSchemaChange = (e) => {
  const selectedSchema = e.target.value;
  let percent = "";
  let lastDateForLoan = "";
  let interest = 0;

  const loanDate = new Date(editableEntry.date);
  let daysToAdd = 0;
  let interestPercent = 0;
  let interestMonths = 0;

  switch (selectedSchema) {
    case "LGL":
      percent = "12%";
      interestPercent = 12;
      interestMonths = 12;
      daysToAdd = 365;
      break;
    case "MGL":
      percent = "18%";
      interestPercent = 18;
      interestMonths = 6;
      daysToAdd = 180;
      break;
    case "HGL":
      percent = "24%";
      interestPercent = 24;
      interestMonths = 6;
      daysToAdd = 180;
      break;
    case "HGL-SPCL":
      percent = "30%";
      interestPercent = 30;
      interestMonths = 3;
      daysToAdd = 90;
      break;
    default:
      break;
  }

  // Calculate exact lastDateForLoan
  const calculatedDate = new Date(loanDate);
  calculatedDate.setDate(calculatedDate.getDate() + daysToAdd);
  lastDateForLoan = formatDateForInput(calculatedDate);

  // Calculate interest using your helper
  interest = calculateInterest(editableEntry.loanAmount, interestPercent, interestMonths);

  // Update entry
  setEditableEntry((prevEntry) => ({
    ...prevEntry,
    schema: selectedSchema,
    percent: percent,
    lastDateForLoan: lastDateForLoan,
    interest: interest,
  }));
};


  const addJewelDetails = () => {
    const newJewel = {
      jDetails: "", 
      quantity: 0,   
      quality: "",   
      iw: 0 // Initialize with 0 weight
    };
    const newList = [...editableList, newJewel];
    setEditableList(newList);
    
    // Recalculate gross weight
    const newGrossWeight = calculateGrossWeight(newList);
    setEditableEntry(prev => ({
      ...prev,
      gw: newGrossWeight,
      nw: (newGrossWeight - (prev.iw || 0)).toFixed(2)
    }));
  };
  const [loanTotals, setLoanTotals] = useState({
    totalLoans: 0,
  });
  const fetchLedgers = async (customerId) => {
    try {
      const loanResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/ledger/all`
      );
      const loanData = loanResponse.data;
      const customerLoans = loanData.filter(
        (loan) => loan.customerId === customerId
      );
      const totalLoanCount = customerLoans.length;

      setLoanTotals((prevTotals) => ({
        ...prevTotals,
        totalLoans: totalLoanCount,
      }));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (editableEntry.customerId) {
      fetchLedgers(editableEntry.customerId);
    }
  }, [editableEntry.customerId]);

  const deleteJewel = (index) => {
    const updatedList = editableList.filter((_, i) => i !== index);
    setEditableList(updatedList);

    // Recalculate gross weight
  const newGrossWeight = calculateGrossWeight(updatedList);
  setEditableEntry(prev => ({
    ...prev,
    gw: newGrossWeight,
    nw: (newGrossWeight - (prev.iw || 0)).toFixed(2)
  }));
  };
  const calculateGrossWeight = (list) => {
    const totalWeight = list.reduce(
      (total, item) => total + parseFloat(item.iw || 0),
      0
    );
    return totalWeight.toFixed(2);
  };
  useEffect(() => {
    const fetchLoanData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/ledger/merged-loan-data`
        );


        const filteredLoan = response.data.find(
          (loan) => loan.loanNumber === loanNumber
        );

        if (filteredLoan) {
          setLoanData(filteredLoan);
        } else {
          console.warn("No matching loan found for loanNumber:", loanNumber);
          setLoanData(null); // Reset if no match
        }
      } catch (err) {
        console.error("API Error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (loanNumber) {
      fetchLoanData();
    }
  }, [loanNumber]); // Re-fetch when loanNumber changes

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xxl"
        PaperProps={{
          sx: {
            maxHeight: "90vh",
            //overflow: "hidden",
            overflow: "visible",
            position: "relative",
          },
        }}
      >
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{
            position: "absolute",
            top: "-13px",
            right: "-7px",
            backgroundColor: "#D32521",
            color: "white",
            "&:hover": {
              backgroundColor: "#D32521",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent
          sx={{
            padding: "20px",
            overflowY: "auto",
          }}
        >
         
         
            <Grid container spacing={2} sx={{ marginBottom: "15px" }}>
              <Grid item xs={12} sm={2}>
                <label style={{ fontSize: "14px", fontWeight: "600" }}>
                  Total Loan :{" "}
                </label>
                <input
                  type="text"
                  value={loanTotals.totalLoans || "0"}
                  readOnly
                  className="loan_total"
                  style={{ padding: "6px", border: "1px solid #DEE2E6" }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <label className="gridItemLabel">Loan No :</label>
                <input
                  type="text"
                  value={editableEntry.loanNumber}
                  className="gridItemInput"
                  readOnly
                  style={{ padding: "6px", border: "1px solid #DEE2E6" }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <label className="customLabel">Original Loan Amount :</label>
                <input
                  type="text"
                  value={editableEntry.loanAmount }
                  name="loanAmount"
                  onChange={handleChange}
                  className=" gridItemInput "
                  style={{ padding: "6px", border: "1px solid #DEE2E6" }}
                  readOnly={!isEditing}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <label className="labelText">Loan Status:</label>
                <div className="loanStatusContainer">
                  <span
                    className="loanStatus"
                    style={{
                      backgroundColor:
                        paymentEntries.length > 0 &&
                        paymentEntries[0].balance === 0
                          ? "red"
                          : "green",
                    }}
                  >
                    <div className="statusDot"></div>
                    {paymentEntries.length > 0 &&
                    paymentEntries[0].balance === 0
                      ? "CLOSED"
                      : "LIVE"}
                  </span>
                </div>
              </Grid>
            </Grid>
            <div className="card no-hover-card mb-4 mt-4">
              <div
                className="card-header fw-bold"
                style={{ color: "#056129", backgroundColor: "#fff" }}
              >
                {" "}
                <FontAwesomeIcon
                  icon={faUser}
                  className="ps-2 pe-2"
                  style={{ color: "#047d34" }}
                />
                Customer Details
              </div>
              <div className="card-body" style={{ backgroundColor: "#E7F6EF" }}>
                <div className="row g-3">
                  <div className="col-12 col-md-3">
                    <label className="form-label">Customer ID:</label>
                    <input
                      type="text"
                      value={editableEntry.customerId}
                      readOnly
                      className="form-control"
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label">Name:</label>
                    <input
                      type="text"
                      value={editableEntry.customerName}
                      name="customerName"
                      className="form-control"
                      onChange={handleChange}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label">Phone No:</label>
                    <input
                      type="text"
                      value={editableEntry.mobileNumber1}
                      name="mobileNumber1"
                      className="form-control"
                      onChange={handleChange}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <label className="form-label">Father/Husband:</label>
                    <input
                      type="text"
                      value={editableEntry.fatherhusname}
                      name="fatherhusname"
                      className="form-control"
                      onChange={handleChange}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Address:</label>
                    <input
                      type="text"
                      value={editableEntry.address}
                      name="address"
                      className="form-control"
                      onChange={handleChange}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <label className="form-label">Landmark:</label>
                    <input
                      type="text"
                      value={editableEntry.landmark}
                      name="landmark"
                      className="form-control"
                      onChange={handleChange}
                      readOnly={!isEditing}
                    />
                  </div>
                  <div className="col-12 col-md-2">
                    <label className="form-label">Alter Phone No:</label>
                    <input
                      type="text"
                      value={editableEntry.mobileNumber2}
                      name="mobileNumber2"
                      className="form-control"
                      onChange={handleChange}
                      readOnly={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4 no-hover-card ">
              <div
                className="card-header fw-bold d-flex justify-content-between align-items-center"
                style={{ color: "#e36a22", backgroundColor: "#fff" }}
              >
                <span>
                  <FontAwesomeIcon
                    icon={faMoneyCheck}
                    className="ps-2 pe-2"
                    style={{ color: "#ff5f00" }}
                  />{" "}
                  Loan Details
                </span>

                <div
                  className="d-flex align-items-center gap-2"
                  style={{ padding: "0px" }}
                >
                  <label className="form-label mb-0">Last Date For Loan:</label>
                  <input
                    type="date"
                    value={formatDateForInput(editableEntry.lastDateForLoan)}
                    name="lastDateForLoan"
                    className="form-control w-auto"
                    onChange={handleChange}
                    readOnly={!isEditing}
                    style={{ padding: "0px" }}
                  />
                </div>
              </div>
              <div className="card-body" style={{ backgroundColor: "#FEF4EB" }}>
                <div className="row g-3">
                  <div className="col-12 col-md-2">
                    <label className="form-label">Loan Date:</label>
                    <input
                      type="date"
                      value={formatDateForInput(editableEntry.date)}
                      name="date"
                      className="form-control"
                      onChange={handleChange}
                      readOnly={!isEditing}
                    />
                  </div>
                  

                  <div className="col-12 col-md-2">
                    <label className="form-label">Scheme :</label>
                    <select
                      value={editableEntry.schema}
                      name="schema"
                      className="form-select"
                      onChange={handleSchemaChange}
                      disabled={!isEditing}
                    >
                      <option value="LGL">LGL</option>
                      <option value="MGL">MGL</option>
                      <option value="HGL">HGL</option>
                      <option value="HGL-SPCL">HGL-SPCL</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-2">
                    <label className="form-label">Percent:</label>
                    <input
                      type="text"
                      value={editableEntry.percent}
                      readOnly
                      className="form-control"
                    />
                  </div>
                  <div className="col-12 col-md-1">
                    <label className="form-label">No. of Days :</label>
                    <input
                      type="text"
                      className="form-control dayscolor text-center"
                      value={
                        loanData.loanamountbalance === "0"
                          ? "00"
                          : loanData.numberOfdays < 10
                          ? `0${loanData.numberOfdays}`
                          : loanData.numberOfdays
                      }
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-md-3">
            <label className="form-label">Balance Principal : </label>
            <input
              type="text"
              value={
                loanData?.loanamountbalance ?? // Check the single loan object
                (editableEntry.loanamountbalance !== null && editableEntry.loanamountbalance !== ""
                  ? editableEntry.loanamountbalance
                  : editableEntry.loanAmount)
              }
              name="loanamountbalance"
              className="form-control"
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </div>
                            <div className="col-12 col-md-2">
                    <label className="form-label">Interest Amount:</label>
                    <input
                      type="text"
                      value={editableEntry.interest}
                      readOnly
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card no-hover-card mb-4">
              <div
                className="card-header fw-bold d-flex justify-content-between align-items-center"
                style={{ color: " rgb(18 69 166)", backgroundColor: "#fff" }}
              >
                <span>
                  {" "}
                  <FontAwesomeIcon
                    icon={faGem}
                    className="ps-2 pe-2"
                    style={{ color: "rgb(13 82 165) " }}
                  />{" "}
                  Jewel Details
                </span>
                <Button
                  onClick={toggleTableVisibility}
                  className="toggleJewel "
                  sx={{
                    p: 0,
                  }}
                >
                  {isTableVisible ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                </Button>
              </div>

              {isTableVisible && (
                <div
                  className="card-body "
                  style={{ backgroundColor: "rgb(244 244 255)" }}
                >
                  <table className="table-container mt-2">
                    <thead>
                      <tr>
                        <th colSpan={2}>Jewel Name</th>
                        <th colSpan={2}>Quantity</th>
                        <th colSpan={2}>Quality</th>

                        {/* Conditionally render the "Actions" column only in edit mode */}
                        {isEditing && <th colSpan={2}>Actions</th>}

                        <th colSpan={2}>Item Weight (gms)</th>
                        <th>Gross Weight (gms)</th>
                        <th>Net Weight (gms)</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white">
                      {editableList.length > 0 ? (
                        editableList.map((jewel, index) => (
                          <tr key={index}>
                            <td colSpan={2}>
                              {isEditing ? (
                                <Select
                                  name="jDetails"
                                  value={jewel.jDetails || ""}
                                  sx={{ width: "230px" }}
                                  onChange={(e) => {
                                    console.log(
                                      "Dropdown Value Changed:",
                                      e.target.value
                                    );
                                    handleChange(e, index);
                                    if (e.target.value === "others")
                                      handleOpenJewelDialog(index);
                                  }}
                                  displayEmpty
                                >
                                  {jewelOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                      {option}
                                    </MenuItem>
                                  ))}
                                </Select>
                              ) : (
                                jewel.jDetails || "N/A"
                              )}
                            </td>
                            <td colSpan={2}>
                              {isEditing ? (
                                <TextField
                                  type="number"
                                  name="quantity"
                                  sx={{ width: "120px" }}
                                  value={jewel.quantity || 0}
                                  onChange={(e) => handleChange(e, index)}
                                />
                              ) : (
                                jewel.quantity || 0
                              )}
                            </td>
                            <td colSpan={2}>
                              {isEditing ? (
                                <Select
                                  name="quality"
                                  value={jewel.quality || ""}
                                  sx={{ width: "180px" }}
                                  onChange={(e) => {
                                    console.log(
                                      "Dropdown Quality Value Changed:",
                                      e.target.value
                                    );
                                    handleChange(e, index);
                                    if (e.target.value === "others")
                                      handleOpenQualityDialog(index);
                                  }}
                                  displayEmpty
                                >
                                  {qualityOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                      {option}
                                    </MenuItem>
                                  ))}
                                </Select>
                              ) : (
                                jewel.quality || "N/A"
                              )}
                            </td>

                            {/* Conditionally render the delete button only in edit mode */}
                            {isEditing && (
                              <td colSpan={2}>
                                <IconButton
                                  aria-label="delete"
                                  color="secondary"
                                  onClick={() => deleteJewel(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </td>
                            )}

                            {/* Display Item Weight as an array of values */}
                            <td colSpan={2}>
                              {isEditing ? (
                                <TextField
                                  type="number"
                                  name="iw"
                                  sx={{ width: "140px" }}
                                  value={jewel.iw || 0}
                                  onChange={(e) => handleChange(e, index)}
                                />
                              ) : (
                                jewel.iw || 0
                              )}
                            </td>

                            {/* Only show Gross Weight and Net Weight in the first row */}
                            {index === 0 && (
                              <>
                                <td rowSpan={editableList.length}>
                                  {/* Calculate Gross Weight as sum of all Item Weights */}
                                  {isEditing ? (
                                    <TextField
                                      type="number"
                                      name="gw"
                                      sx={{ width: "140px" }}
                                      value={
                                        calculateGrossWeight(editableList) || 0
                                      }
                                      onChange={handleChange}
                                    />
                                  ) : (
                                    calculateGrossWeight(editableList) || 0
                                  )}
                                </td>
                                <td rowSpan={editableList.length}>
                                  {isEditing ? (
                                    <TextField
                                      type="number"
                                      name="nw"
                                      sx={{ width: "140px" }}
                                      value={editableEntry.nw || ""}
                                      onChange={handleChange}
                                    />
                                  ) : (
                                    editableEntry.nw || "N/A"
                                  )}
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="12" className="no-jewels">
                            No jewels available
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {isEditing && (
                      <div className="parent-container">
                        <Button
                          variant="contained"
                          color="primary"
                          className="no-jewels1"
                          onClick={addJewelDetails}
                        >
                          Add Jewel
                        </Button>
                      </div>
                    )}
                  </table>
                </div>
              )}

              <Dialog
                open={isJewelDialogOpen}
                onClose={() => setIsJewelDialogOpen(false)}
              >
                <DialogTitle>Enter Jewel Name</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Jewel Name"
                    fullWidth
                    value={tempJewelValue}
                    onChange={(e) => setTempJewelValue(e.target.value)}
                  />
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center" }}>
                  <Button
                    onClick={handleSaveJewel}
                    color="success"
                    variant="contained"
                    sx={{ height: 27, mb: 3 }}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsJewelDialogOpen(false)}
                    color="error"
                    variant="contained"
                    sx={{ height: 27, mb: 3 }}
                  >
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>

              <Dialog
                open={isQualityDialogOpen}
                onClose={() => setIsQualityDialogOpen(false)}
              >
                <DialogTitle sx={{ alignItems: "center" }}>
                  Enter Quality
                </DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Quality"
                    fullWidth
                    value={tempQualityValue}
                    onChange={(e) => setTempQualityValue(e.target.value)}
                  />
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center" }}>
                  <Button
                    onClick={handleSaveQuality}
                    color="success"
                    variant="contained"
                    sx={{ height: 27, mb: 3 }}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsQualityDialogOpen(false)}
                    color="error"
                    variant="contained"
                    sx={{ height: 27, mb: 3 }}
                  >
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
            {/* Proof Section */}
            <div className="card no-hover-card mb-4">
              <div
                className="card-header fw-bold d-flex justify-content-between align-items-center"
                style={{ color: "#b2108e", backgroundColor: "#fff" }}
              >
                <span>
                  {" "}
                  <FontAwesomeIcon
                    icon={faAddressCard}
                    className="ps-2 pe-2"
                    style={{ color: "#d816c8" }}
                  />{" "}
                  Proof
                </span>
                <Button
                  onClick={toggleProofVisibility}
                  sx={{ p: 0 }}
                  className="toggleproof"
                >
                  {isProofVisible ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                </Button>
              </div>
              {isProofVisible && (
                <div
                  className="card-body"
                  style={{ backgroundColor: "#F9EFF0" }}
                >
                  <ProofSection
                    proof1={entry.proof1}
                    proof2={entry.proof2}
                    proof3={entry.proof3}
                    isProofVisible={isProofVisible}
                    entry={entry}
                  />
                </div>
              )}
            </div>

            {/* Payment Details Section */}
            <div className="card no-hover-card mb-4">
              <div
                className="card-header fw-bold d-flex justify-content-between align-items-center"
                style={{ color: "#637411", backgroundColor: "#fff" }}
              >
                <span>
                  <FontAwesomeIcon
                    icon={faMoneyBill}
                    className="ps-2 pe-2"
                    style={{ color: "#8AA41E" }}
                  />{" "}
                  Payment Details
                </span>
                <div>
                  <Button
                    onClick={handleClick}
                    className="me-3 ps-2 pe-2 addpayment "
                    sx={{ p: 0 }}
                  >
                    <AddCircleRoundedIcon className="me-1 fs-6" /> Add Payment
                  </Button>
                  <Button
                    onClick={togglePaymentVisibility}
                    sx={{ p: 0 }}
                    className="togglepayment"
                  >
                    {isPaymentVisible ? (
                      <ArrowDropUpIcon />
                    ) : (
                      <ArrowDropDownIcon />
                    )}
                  </Button>
                </div>
              </div>
              {isPaymentVisible && (
                <div
                  className="card-body"
                  style={{ backgroundColor: "rgb(248 255 239)" }}
                >
                  <div className="m-3">
                    <PaymentDetails paymentEntries={paymentEntries} />
                  </div>
                </div>
              )}
            </div>

          <div className="button-container">
            {isEditing ? (
              <>
                <button className="button-save" onClick={handleSaveClick}>
                  Save
                </button>
                <button
                  className="button-cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button className="button-edit" onClick={handleEditClick}>
                Edit
              </button>
            )}
          </div>
        </DialogContent>
        <DialogActions></DialogActions>
      </Dialog>
    </>
  );
};
export default CustomerDialog;
