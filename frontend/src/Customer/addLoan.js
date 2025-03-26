import React, { useState, useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";

import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  IconButton,
  Box,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import FormHelperText from "@mui/material/FormHelperText";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import CloseIcon from "@mui/icons-material/Close";
import "../Master/Master.css";
import Badge from "react-bootstrap/Badge";
import Swal from "sweetalert2";
import axios from "axios";
import { useLedger } from "../LedgerContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerDetails}  from "../actions/customerActions"
const Addloan = ({
  ledgerId,
  customerId,
  hideUploadButtons,
  entry,
  isAddLoan,
  isReadOnly,
  onSubmit,
  onSave,
}) => {
  const isEditing = !!entry;
  const dispatch = useDispatch();
  const customerDetails = useSelector((state) => state.customer.customerDetails);
  const [jewelList, setJewelList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [nextLoanNumber, setNextLoanNumber] = useState("");
  const [latestJewelNumber, setLatestJewelNumber] = useState("");
  const [schemas, setSchemas] = useState([]);
  const [formData, setFormData] = useState({
    customerId: "",
    loanNumber: "",
    date: "",
   
    customerName: "",
    mobileNumber1: "",
    mobileNumber2: "",
    landmark: "",
    address: "",
    jDetails: "",
    quality: "",
    quantity: "",
    fatherhusname: "",
    gw: "",
    iw: "",
    nw: "",
    schema: "",
    loanAmount: "",
    percent: "",
    interest: "",
    lastDateForLoan: "",
    doccharge: "",
    interestbalamount: "",
    loanamountbalance: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    customerId: false,
    loanNumber: false,
    date: false,
  
    customerName: false,
    mobileNumber1: false,
    mobileNumber2: false,
    landmark: false,
    address: false,
    jDetails: false,
    quality: false,
    quantity: false,
    iw: false,
    gw: false,
    nw: false,
    schema: false,
    loanAmount: false,
    percent: false,
    interest: false,
    lastDateForLoan: false,
    fatherhusname: false,
    doccharge: false,
    loanamountbalance: false,
    interestbalamount: false,
  });
 
 



 
  const [latestLoanNumber, setLatestLoanNumber] = useState("");

  const [customJewelDetail, setCustomJewelDetail] = useState("");
  const [enableCustomerId, setEnableCustomerId] = useState(false);
  const formatDateToInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const [editedEntry, setEditedEntry] = useState(entry);

 

  const fetchLedgerEntryById = async (id) => {
    const response = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/ledger/${id}`
    );
    const data = await response.json();
    return data;
  };

 
  useEffect(() => {
 
    fetchLatestLoanNumber();
    fetchSchemas();
  }, []);

  const fetchLatestLoanNumber = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ledger/latest_loan_number`)
      .then((response) => response.json())
      .then((data) => {
        setLatestLoanNumber(data.latestLoanNumber);
      })
      .catch((error) =>
        console.error("Error fetching latest loan number:", error)
      );
  };



  const [files, setFiles] = useState({
    proof1: [],
    proof2: [],
    proof3: [],
    customerSign: null,
    customerPhoto: null,
  });
 

  const handleFileChange = (event, fileType) => {
    const { files: selectedFiles } = event.target;

    if (fileType === "proof3") {
      setFiles((prevFiles) => ({
        ...prevFiles,
        proof3: Array.from(selectedFiles), // Store proof3 as an array of files
      }));
    }
  };

  const handleFileRemove = (fileType, index) => {
    setFiles((prevFiles) => {
      const updatedFiles = prevFiles[fileType].filter((_, i) => i !== index);
      return {
        ...prevFiles,
        [fileType]: updatedFiles.length > 0 ? updatedFiles : null,
      };
    });
  };

  

  const fetchSchemas = () => {
    console.log("Fetching schemas...");

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/schemas`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Data received:", data);
        setSchemas(data); // Store the full schema objects
      })
      .catch((error) => {
        console.error("Error fetching schemas:", error);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Determine the new value based on the field name
    let newValue = value;
  
    if (name === "loanNumber") {
      newValue = value.toUpperCase();
    } else if (name === "date") {
      newValue = formatDateToInput(value);
    }
  
    setEditedEntry({ ...editedEntry, [name]: newValue });
  
    setFormData((prevState) => {
      const newFormData = { ...prevState, [name]: newValue };
  
      // Handle schema change
      if (name === "schema") {
        const selectedSchema = schemas.find(
          (schema) => schema.name === newValue
        );
        if (selectedSchema) {
          // Update the percentage based on the selected schema
          newFormData.percent = selectedSchema.interestPercent;
  
          // Recalculate the last date for the loan
          const enteredDate = new Date(newFormData.date);
          let calculatedDate = new Date(enteredDate);
  
          // Calculate lastDateForLoan based on schema name
          switch (selectedSchema.name.toLowerCase()) {
            case "lgl":
              calculatedDate.setFullYear(calculatedDate.getFullYear() + 1); // 1 year
              break;
            case "mgl":
              calculatedDate.setMonth(calculatedDate.getMonth() + 6); // 6 months
              break;
            case "hgl":
              calculatedDate.setMonth(calculatedDate.getMonth() + 3); // 3 months
              break;
            default:
              break;
          }
  
          newFormData.lastDateForLoan = calculatedDate
            .toISOString()
            .split("T")[0];
        }
      }
  
      // Handle date change (recalculate lastDateForLoan if schema is already selected)
      if (name === "date" && newFormData.schema) {
        const selectedSchema = schemas.find(
          (schema) => schema.name === newFormData.schema
        );
        if (selectedSchema) {
          const enteredDate = new Date(newValue);
          let calculatedDate = new Date(enteredDate);
  
          // Calculate lastDateForLoan based on schema name
          switch (selectedSchema.name.toLowerCase()) {
            case "lgl":
              calculatedDate.setFullYear(calculatedDate.getFullYear() + 1); // 1 year
              break;
            case "mgl":
              calculatedDate.setMonth(calculatedDate.getMonth() + 6); // 6 months
              break;
            case "hgl":
              calculatedDate.setMonth(calculatedDate.getMonth() + 3); // 3 months
              break;
            default:
              break;
          }
  
          newFormData.lastDateForLoan = calculatedDate
            .toISOString()
            .split("T")[0];
        }
      }
  
      // Handle customerId generation
      if (name === "customerName" || name === "mobileNumber1") {
        const { customerName, mobileNumber1 } = newFormData;
        newFormData.customerId =
          customerName && mobileNumber1 && mobileNumber1.length === 10
            ? `${customerName.slice(0, 3).toUpperCase()}${mobileNumber1
                .slice(-4)
                .toUpperCase()}`
            : "";
      }
  
      // Validation for loan number
      if (name === "loanNumber") {
        const pattern = /^RR\d{3,}$/;
        if (!isEditing) {
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [name]: !pattern.test(newValue),
          }));
        }
        newFormData[name] = newValue;
      } else if (name === "mobileNumber1") {
        const pattern = /^\d{10}$/;
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: !pattern.test(value),
        }));
      } else if (name === "schema" || name === "landmark") {
        const pattern = /^[a-zA-Z\s]*$/;
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: !pattern.test(value),
        }));
      } else if (name === "address") {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: value.trim().length <= 10,
        }));
      } else if (name === "lastDateForLoan") {
        setValidationErrors((prevErrors) => {
          const errors = {};
          // Check if the field is empty
          if (!value) {
            errors.lastDateForLoan = "Last Date is required";
          } else {
            // Further validation (e.g., check if date is in the future)
            const today = new Date();
            const inputDate = new Date(value);
            if (inputDate < today) {
              errors.lastDateForLoan = "Date must be in the future";
            }
          }
          return { ...prevErrors, ...errors };
        });
      } else if (name === "fatherhusname") {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: value.trim() === "",
        }));
      } else if (name === "doccharge") {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: value.trim() === "",
        }));
      } else {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: value.trim() === "",
        }));
      }
  
      if (name === "lastDateForLoan") {
        const errors = {};
  
        if (!value) {
          errors.lastDateForLoan = "Last Date is required";
        }
        setValidationErrors(errors);
      }
  
      if (name === "loanAmount" || name === "percent") {
        const principal = parseFloat(newFormData.loanAmount);
        const percentage = parseFloat(newFormData.percent);
        if (!isNaN(principal) && !isNaN(percentage)) {
          let interest = 0;
          if (percentage === 12) {
            interest = principal * 0.12;
          } else if (percentage === 18) {
            interest = (principal * 0.18) / 2;
          } else if (percentage === 24) {
            interest = (principal * 0.24) / 2;
          }
          newFormData.interest = interest.toFixed(0);
        } else {
          newFormData.interest = "";
        }
      }
      if (name === "jewelWeight" || name === "jewelList") {
        newFormData.gw = calculateTotalWeight();
      }
      return newFormData;
    });
  };

  const validateFormData = (formData, files, isEditing) => {
    let errors = {};

    for (let key in formData) {
      if (["jDetails", "quality", "quantity","iw","mobileNumber2"].includes(key)) {
        continue;
      }

      if (typeof formData[key] !== "string" || formData[key].trim() === "") {
        if (key === "lastDateForLoan") {
          errors[key] = "Enter Last date";
        } else {
          errors[key] = `Enter ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`;
        }
      } else if (key === "mobileNumber1" && !/^\d{10}$/.test(formData[key])) {
        errors[key] = "Enter a valid 10-digit mobile number";
      } else if (
        (key === "schema" || key === "landmark") &&
        !/^[a-zA-Z\s]*$/.test(formData[key])
      ) {
        errors[key] = `Enter a valid ${key
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()}`;
      } else if (key === "address" && formData[key].trim().length <= 10) {
        errors[key] = "Address must be longer than 10 characters";
      }
    }

    if (!formData.lastDateForLoan) {
      errors.lastDateForLoan = "Enter Last date";
    }
    if (!formData.date) {
      errors.date = "Enter date";
    }
    if (!formData.schema) {
      errors.schema = "Schema is Required";
    }
    if (!formData.doccharge) {
      errors.doccharge = "Document charge is Required";
    }
    if (!formData.percent) {
      errors.percent = "Percent is Required";
    }
    if (!formData.loanAmount) {
      errors.loanAmount = "Loan amount is Required";
    }
    if (!formData.loanNumber) {
      errors.loanNumber = "Loan number is Required";
    }
    if (!formData.nw) {
      errors.nw = "gross weight is Required";
    }
    if (!formData.gw) {
      errors.gw = " net weight is Required";
    }

    if (!isEditing) {
      if (!files.proof3 || files.proof3.length === 0) {
        errors.proof3 = "Upload proof 3 (jewel detail)";
      }
    }

    return errors;
  };

  const [errors, setErrors] = useState({
    jDetails: false,
    quality: false,
    quantity: false,
  });
  const handleAddJewel = () => {
    const { jDetails, quality, quantity, iw } = formData;

    let tempErrors = {
      jDetails: !jDetails,
      quality: !quality,
      quantity: !quantity,
      iw: !iw,
    };
  
    if (Object.values(tempErrors).some((error) => error)) {
      setErrors(tempErrors);
      return;
    }
  
    setErrors({
      jDetails: false,
      quality: false,
      quantity: false,
      iw: false,
    });
  
    const updatedJewelList = [...jewelList, formData];

    setJewelList(updatedJewelList);
  
    setFormData((prevFormData) => ({
      ...prevFormData,
      jDetails: "",
      quality: "",
      quantity: "",
      iw: "",
      gw: calculateTotalWeight(updatedJewelList), 
    }));
  };
  
  const handleDeleteItem = (index) => {
    const updatedList = jewelList.filter((_, i) => i !== index);
    setJewelList(updatedList);
    setFormData((prevFormData) => ({
      ...prevFormData,
      gw: calculateTotalWeight(updatedList), 
    }));
  };
  const calculateTotalWeight = (list) => {
    const totalWeight = list.reduce((total, item) => total + parseFloat(item.iw || 0), 0);
    return totalWeight.toFixed(2); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.loanNumber !== latestLoanNumber) {
      setSnackbarMessage(
        "The loan number does not match the latest loan number."
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const formDataWithJLNumber = { ...formData,  };
    const validationErrors = validateFormData(
      formDataWithJLNumber,
      files,
      isEditing
    );

    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      return;
    }

    const formDataToSend = new FormData();
    for (const [key, value] of Object.entries(formDataWithJLNumber)) {
      formDataToSend.append(key, value);
    }
    formDataToSend.append("jewelList", JSON.stringify(jewelList || []));
    Object.keys(files).forEach((fileType) => {
      if (fileType === "proof3" && Array.isArray(files[fileType])) {
        // proof3 should handle multiple files
        files[fileType].forEach((file) => {
          formDataToSend.append("proof3", file);
        });
      } else if (files[fileType]) {
        // Single file types
        formDataToSend.append(fileType, files[fileType]);
      }
    });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ledger/add`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );
      if (!response.ok) {
        const errorText = await response.text(); // Get the response as plain text (could be HTML)
        console.error("Error Response:", errorText); // Log the full response
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
        return;
      }
      const responseText = await response.text();
      console.log("Raw Response:", responseText);

      const data = JSON.parse(responseText);
      console.log("Success:", data);

      setSnackbarMessage(
        `Ledger entry ${isEditing ? "updated" : "stored"} successfully.`
      );
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setNextLoanNumber(nextLoanNumber + 1);
      fetchLatestLoanNumber();
    
      setFormData({
        loanNumber: nextLoanNumber,
        customerId: "",
        date: "",
       
        customerName: "",
        mobileNumber1: "",
        mobileNumber2: "",
        landmark: "",
        address: "",
        jDetails: "",
        quality: "",
        quantity: "",
        iw: "",
        gw: "",
        nw: "",
        schema: "",
        loanAmount: "",
        percent: "",
        proof: "",
        interest: "",
        lastDateForLoan: "",
      });
      setFiles({
        proof1: null,
        proof2: null,
        proof3: null,
        customerSign: null,
        customerPhoto: null,
        thumbImpression: null,
      });
      setValidationErrors({});
    } catch (error) {
      console.error("Error:", error);
      setSnackbarMessage("Something went wrong!");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };
 useEffect(() => {
    if (customerId) {
      fetchCustomerDetails(customerId);
    }
  }, [customerId]);

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/ledger/${customerId}`
      );
      const customer = response.data;
      setFormData({
        customerId: customer.customerId,
        customerName: customer.customerName, // Check property names
        mobileNumber1: customer.mobileNumber1,
        mobileNumber2: customer.mobileNumber2,
        landmark: customer.landmark,
        address: customer.address,
        fatherhusname: customer.fatherhusname, // Check this property
      });
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };
  const handleCustomerIdChange = (e) => {
    const customerId = e.target.value;
    const newCustomerId = e.target.value;
    setFormData({
      ...formData,
      customerId: customerId,
      customerId: newCustomerId,
    });
    if (customerId.length === 7) {
      fetchCustomerDetails(customerId);
    }
  };
  const [openDialog1, setOpenDialog1] = useState(false);

  const handleDialogClose1 = () => {
    setOpenDialog1(false);
  };
  const handleSaveCustomDetail = () => {
    if (!customJewelDetail) {
      setValidationErrors({ ...validationErrors, customJewelDetail: true });
    } else {
      setFormData({
        ...formData,
        jDetails: customJewelDetail,
      });
      handleDialogClose1();
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setValidationErrors({ ...validationErrors, customJewelDetail: false });
  };

  const handleSelectChange = (event) => {
    const value = event.target.value;
    if (value === "others") {
      setOpenDialog1(true);
    } else {
      setFormData({
        ...formData,
        jDetails: value,
      });
    }
  };
  const [dialogError, setDialogError] = useState(false);
  const [customQuality, setCustomQuality] = useState("");
  const handleSelectChanges = (event) => {
    const value = event.target.value;
    if (value === "others") {
      setOpenDialog(true);
    } else {
      setFormData({
        ...formData,
        quality: value,
      });
    }
  };

  const handleSaveCustomQuality = () => {
    if (!customQuality) {
      setDialogError(true);
    } else {
      setFormData({
        ...formData,
        quality: customQuality,
      });
      setOpenDialog(false);
      setDialogError(false);
    }
  };
  
  return (
    <>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Paper
        style={{ padding: 20, margin: "auto", marginTop: "-4px" }}
        sx={{ maxWidth: "100%", overflow: "hidden" }}
        // className="paperbg"
      >
        <Typography
          variant="h6"
         
          gutterBottom
          align="center"
          sx={{ color: "#373A8F", fontWeight: "550",mt:-2,mb:-1 }}
        >
        ADD LOAN
        </Typography>
        <Grid item xs={12} sm={2} className="text-center mb-3 mt-3">
  <div
    className="d-inline-flex align-items-center p-2 rounded"
    style={{
      backgroundColor: "#1784cc",
      maxWidth: "100%",
      maxHeight: "30px",
    }}
  >
    <span className="text-white fw-bold">Next Loan No:</span>
    <span
      className="ms-2 p-1 rounded"
      style={{
        backgroundColor: "",
        color: "#fff",
        fontSize: "0.895em",
        fontWeight: "bold",
        letterSpacing: "1px",
      }}
    >
      {latestLoanNumber}
    </span>
  </div>
</Grid>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="customerId" className="form-label">Customer Id</label>
            <input
              type="text"
              id="customerId"
              name="customerId"
              className={`form-control ${validationErrors.customerId ? 'is-invalid' : ''}`}
              value={formData.customerId}
              onChange={handleCustomerIdChange}
              disabled={!enableCustomerId}
              readOnly={isReadOnly}
            />
            {validationErrors.customerId && (
              <div className="invalid-feedback">Customer Id is required</div>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
  <label htmlFor="loanNumber" className="form-label">Loan Number</label>
  <input
    type="text"
    id="loanNumber"
    name="loanNumber"
    className={`form-control ${validationErrors.loanNumber ? 'is-invalid' : ''}`}
    value={formData.loanNumber}
    onChange={handleChange}
    placeholder="Enter Loan Number (e.g., RR123)"
  />
  {validationErrors.loanNumber && (
    <div className="invalid-feedback">
      Loan Number must start with 'RR' followed by at least 3 digits
    </div>
  )}
</Grid>
<Grid item xs={12} sm={6} md={3}>
  <label htmlFor="date" className="form-label">Date</label>
  <input
    type="date"
    id="date"
    name="date"
    className={`form-control ${validationErrors.date ? 'is-invalid' : ''}`}
    value={formData.date} // Ensure this is in yyyy-MM-dd format
    onChange={handleChange}
  />
  {validationErrors.date && (
    <div className="invalid-feedback">
      Date is required
    </div>
  )}
</Grid>


<Grid item xs={12} sm={6} md={3}>
  <label htmlFor="customerName" className="form-label">Customer Name</label>
  <input
    type="text"
    id="customerName"
    name="customerName"
    className={`form-control ${validationErrors.customerName ? 'is-invalid' : ''}`}
    value={formData.customerName}
    onChange={handleChange}
    readOnly // Makes the input field read-only
  />
  {validationErrors.customerName && (
    <div className="invalid-feedback">
      Customer Name is required
    </div>
  )}
</Grid>

<Grid item xs={12} sm={6} md={3}>
  <label htmlFor="mobileNumber1" className="form-label">Mobile Number</label>
  <input
    type="text"
    id="mobileNumber1"
    name="mobileNumber1"
    className={`form-control ${validationErrors.mobileNumber1 ? 'is-invalid' : ''}`}
    value={formData.mobileNumber1}
    readOnly // Makes the field read-only
    onChange={handleChange}
  />
  {validationErrors.mobileNumber1 && (
    <div className="invalid-feedback">
      Mobile Number must be 10 digits
    </div>
  )}
</Grid>

          
<Grid item xs={12} sm={6} md={3}>
  <label htmlFor="mobileNumber2" className="form-label">Alternative Mobile Number</label>
  <input
    type="text"
    id="mobileNumber2"
    name="mobileNumber2"
    className="form-control"
    value={formData.mobileNumber2}
    onChange={handleChange}
    placeholder="Enter Mobile Number"
  />
</Grid>

<Grid item xs={12} sm={6} md={3}>
  <label htmlFor="fatherhusname" className="form-label">Father/Husband Name</label>
  <input
    type="text"
    id="fatherhusname"
    name="fatherhusname"
    className={`form-control ${validationErrors.fatherhusname ? 'is-invalid' : ''}`}
    value={formData.fatherhusname}
    onChange={handleChange}
    readOnly
  />
  {validationErrors.fatherhusname && (
    <div className="invalid-feedback">Father Name/Husband is required</div>
  )}
</Grid>

<Grid item xs={12} sm={6} md={3}>
  <label htmlFor="landmark" className="form-label">Landmark</label>
  <input
    type="text"
    id="landmark"
    name="landmark"
    className={`form-control ${validationErrors.landmark ? 'is-invalid' : ''}`}
    value={formData.landmark}
    onChange={handleChange}
    readOnly
  />
  {validationErrors.landmark && (
    <div className="invalid-feedback">Landmark must be a string</div>
  )}
</Grid>


<Grid item xs={12}>
  <label htmlFor="address" className="form-label">Address</label>
  <input
    type="text"
    id="address"
    name="address"
    className={`form-control ${validationErrors.address ? 'is-invalid' : ''}`}
    value={formData.address}
    onChange={handleChange}
    readOnly
  />
  {validationErrors.address && (
    <div className="invalid-feedback">
      Address must be greater than 10 characters
    </div>
  )}
</Grid>


<Grid item xs={12} sm={3}>
  <label htmlFor="schema" className="form-label">Schema</label>
  <select
    id="schema"
    name="schema"
    className={`form-select ${validationErrors.schema ? 'is-invalid' : ''}`}
    value={formData.schema}
    onChange={handleChange}
    disabled={!formData.date}
  >
    <option value="">Select Schema</option>
    {schemas.map((schema) => (
      <option key={schema._id} value={schema.name}>
        {schema.name}
      </option>
    ))}
  </select>
  {validationErrors.schema && (
    <div className="invalid-feedback">
      Schema is required
    </div>
  )}
</Grid>

<Grid item xs={12} sm={6} md={1}>
  <label htmlFor="percent" className="form-label">%</label>
  <input
    type="text"
    id="percent"
    name="percent"
    className={`form-control ${validationErrors.percent ? 'is-invalid' : ''}`}
    value={formData.percent}
    onChange={handleChange}
    placeholder="%"
  />
  {validationErrors.percent && (
    <div className="invalid-feedback">
      Percent is required
    </div>
  )}
</Grid>

<Grid item xs={12} sm={4}>
  <label htmlFor="loanAmount" className="form-label">Loan Amount</label>
  <input
    type="number"
    id="loanAmount"
    name="loanAmount"
    className={`form-control ${validationErrors.loanAmount ? 'is-invalid' : ''}`}
    value={formData.loanAmount}
    min="0"
    onChange={handleChange}
    placeholder="Enter Loan Amount"
  />
  {validationErrors.loanAmount && (
    <div className="invalid-feedback">
      Loan Amount is required
    </div>
  )}
</Grid>

<Grid item xs={12} sm={4}>
  <label htmlFor="lastDateForLoan" className="form-label">Last Date for Loan</label>
  <input
    type="date"
    id="lastDateForLoan"
    name="lastDateForLoan"
    className={`form-control ${validationErrors.lastDateForLoan ? 'is-invalid' : ''}`}
    value={formData.lastDateForLoan}
    onChange={handleChange}
    readOnly
  />
  {validationErrors.lastDateForLoan && (
    <div className="invalid-feedback">
      {validationErrors.lastDateForLoan}
    </div>
  )}
</Grid>

<Grid item xs={12} className="text-center mb-3 mt-3">
  <div className="d-flex justify-content-center align-items-center">
  <hr className="flex-grow-1 my-3" style={{ borderTop: "2px solid #1784cc", opacity: "1", boxShadow: "0px 2px 5px rgba(23, 132, 204, 0.5)" }} />

    <span
      className="mx-3 p-2 rounded"
      style={{
        backgroundColor: "#1784cc",
        color: "#fff",
        fontWeight: "600",
        fontSize: "0.9em",
        whiteSpace: "nowrap",
      }}
    >
      Add Jewellery Detail
    </span>
    <hr className="flex-grow-1 my-3" style={{ borderTop: "2px solid #1784cc", opacity: "1", boxShadow: "0px 2px 5px rgba(23, 132, 204, 0.5)" }} />

  </div>
</Grid>
            <Grid item xs={12} sm={3}>
  <label htmlFor="jDetails" className="form-label">Jewel Details</label>
  <select
    id="jDetails"
    name="jDetails"
    className={`form-select ${errors.jDetails ? 'is-invalid' : ''}`}
    value={formData.jDetails}
    onChange={handleSelectChange}
  >
    <option value="">Select Jewel Type</option>
    <option value="chain">Chain</option>
    <option value="bracelet">Bracelet</option>
    <option value="earnings">Earrings</option>
    <option value="bangle">Bangle</option>
    <option value="ring">Ring</option>
    <option value="anklet">Anklet</option>
    <option value="coin">Coin</option>
    <option value="others">Others</option>
    {formData.jDetails === customJewelDetail && (
      <option value={customJewelDetail}>{customJewelDetail}</option>
    )}
  </select>
  {errors.jDetails && (
    <div className="invalid-feedback">Jewel Details are required</div>
  )}
</Grid>

            <Dialog
              open={openDialog1}
              onClose={handleDialogClose1}
              aria-labelledby="form-dialog-title"
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle id="form-dialog-title">
                {" "}
                <Typography
                  variant="h6"
                  gutterBottom
                  align="center"
                  sx={{ color: "#373A8F", fontWeight: "550" }}
                >
                  JEWEL DETAIL
                </Typography>
              </DialogTitle>
              <DialogContent>
              <div className="mb-3">
  <label htmlFor="customJewelDetail" className="form-label">Jewel Details</label>
  <input
    type="text"
    id="customJewelDetail"
    className={`form-control ${validationErrors.customJewelDetail ? 'is-invalid' : ''}`}
    value={customJewelDetail}
    onChange={(e) => setCustomJewelDetail(e.target.value)}
    placeholder="Enter Jewel Details"
  />
  {validationErrors.customJewelDetail && (
    <div className="invalid-feedback">Details are required</div>
  )}
</div>

              </DialogContent>
              <DialogActions>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    width: "100%",
                    mb: 2,
                  }}
                >
                  <Button
                    onClick={handleSaveCustomDetail}
                    color="success"
                    variant="contained"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleDialogClose1}
                    color="error"
                    variant="contained"
                  >
                    Cancel
                  </Button>
                </Box>
              </DialogActions>
            </Dialog>
            <Grid item xs={12} sm={3}>
    <label htmlFor="quality" className="form-label">Quality</label>
    <select
      id="quality"
      name="quality"
      className={`form-select ${errors.quality ? 'is-invalid' : ''}`}
      value={formData.quality}
      onChange={handleSelectChanges}
    >
      <option value="">Select Quality</option>
      <option value="916">916</option>
      <option value="916 Hallmark">916 Hallmark</option>
      <option value="H/M">H/M</option>
      <option value="22K">22K</option>
      <option value="20K">20K</option>
      <option value="KDM">KDM</option>
      <option value="916 KDM">916 KDM</option>
      <option value="916 ZDM">916 ZDM</option>
      <option value="others">Others</option>
      {formData.quality === customQuality && (
        <option value={customQuality}>{customQuality}</option>
      )}
    </select>
    {errors.quality && <div className="invalid-feedback">Quality is required</div>}
</Grid>


            <Dialog
              open={openDialog}
              onClose={handleDialogClose}
              aria-labelledby="form-dialog-title"
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle id="form-dialog-title">
                <Typography
                  variant="h6"
                  gutterBottom
                  align="center"
                  sx={{ color: "#373A8F", fontWeight: "550" }}
                >
                  Quality
                </Typography>
              </DialogTitle>
              <DialogContent>
              <div className="form-group">
  <label htmlFor="customQuality">Custom Quality</label>
  <input
    type="text"
    id="customQuality"
    name="customQuality"
    className={`form-control ${dialogError ? 'is-invalid' : ''}`}
    value={customQuality}
    onChange={(e) => setCustomQuality(e.target.value)}
    placeholder="Enter Quality"
  />
  {dialogError && (
    <div className="invalid-feedback">Quality is required</div>
  )}
</div>

              </DialogContent>
              <DialogActions>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    width: "100%",
                    mb: 2,
                  }}
                >
                  <Button
                    onClick={handleSaveCustomQuality}
                    color="success"
                    variant="contained"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleDialogClose}
                    color="error"
                    variant="contained"
                  >
                    Cancel
                  </Button>
                </Box>
              </DialogActions>
            </Dialog>
            <Grid item xs={12} sm={3}>
  <label htmlFor="quantity" className="form-label">Quantity</label>
  <input
    type="number"
    id="quantity"
    name="quantity"
    className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
    min="0"
    value={formData.quantity}
    onChange={handleChange}
    placeholder="Enter Quantity"
  />
  {errors.quantity && (
    <div className="invalid-feedback">Quantity is required</div>
  )}
</Grid>


<Grid item xs={12} sm={6} md={3}>
  <label htmlFor="iw" className="form-label">Item Weight (gms)</label>
  <input
    type="number"
    id="iw"
    name="iw"
    className={`form-control ${errors.iw ? 'is-invalid' : ''}`}
    value={formData.iw || ""}
    onChange={handleChange}
    placeholder="Enter Item Weight"
    step="any"
  />
  {errors.iw && (
    <div className="invalid-feedback">Item Weight is required</div>
  )}
</Grid>


            <Grid item xs={12} align="center" sx={{ mb: 0 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddJewel}
              sx={{
                fontWeight: 600,
                fontSize: "13px",
                backgroundColor: "rgb(255, 165, 0)",
                color: "#fff",
                height: '28px',
                '&:hover': {
                  backgroundColor: "rgb(255, 140, 0)", 
                },
              }}
            >
              Add Jewel
            </Button>
          </Grid>

            {jewelList.length > 0 && (
              <Grid item xs={12}>
                <TableContainer
                  component={Paper}
                  sx={{ maxWidth: 900, margin: "auto" }}
                >
                  <Table
                    sx={{
                      border: "1px solid black",
                      borderCollapse: "collapse",
                    }}
                  >
                    <TableHead
                      sx={{
                        color: "#1784CC",
                        backgroundColor:'#FFFFC5'
                      }}
                    >
                      <TableRow>
                        <TableCell
                          sx={{
                            padding: "12px",
                            textAlign: "left",
                            border: "1px solid black",
                            fontWeight: "700",
                            color: "#02437E",
                          }}
                        >
                          Jewel Details
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "12px",
                            textAlign: "left",
                            border: "1px solid black",
                            fontWeight: "700",
                            color: "#02437E",
                          }}
                        >
                          Quality
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "12px",
                            textAlign: "left",

                            fontWeight: "700",
                            color: "#02437E",
                            border: "1px solid black",
                          }}
                        >
                          Quantity
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "12px",
                            textAlign: "left",

                            fontWeight: "700",
                            color: "#02437E",
                            border: "1px solid black",
                          }}
                        >
                          Item Weight (gms)
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "12px",
                            textAlign: "left",
                            border: "1px solid black",
                            fontWeight: "700",
                            color: "#02437E",
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jewelList.map((item, index) => (
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
                          <TableCell sx={{ border: "1px solid black" }}>
                            {item.jDetails}
                          </TableCell>
                          <TableCell sx={{ border: "1px solid black" }}>
                            {item.quality}
                          </TableCell>
                          <TableCell sx={{ border: "1px solid black" }}>
                            {item.quantity}
                          </TableCell>
                          <TableCell sx={{ border: "1px solid black" }}>
                            {item.iw}
                          </TableCell>
                          <TableCell sx={{ border: "1px solid black" }}>
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteItem(index)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
            <Grid item xs={12} sm={6} md={4}>
  <label htmlFor="gw" className="form-label">Gross Weight (gms)</label>
  <input
    type="number"
    id="gw"
    name="gw"
    className={`form-control ${validationErrors.gw ? 'is-invalid' : ''}`}
    value={formData.gw || ""}
    onChange={handleChange}
    step="any"
    placeholder="Enter Gross Weight"
  />
  {validationErrors.gw && (
    <div className="invalid-feedback">Gross Weight is required</div>
  )}
</Grid>

            

<Grid item xs={12} sm={6} md={4}>
  <label htmlFor="nw" className="form-label">Net Weight (gms)</label>
  <input
    type="number"
    id="nw"
    name="nw"
    className={`form-control ${validationErrors.nw ? 'is-invalid' : ''}`}
    value={formData.nw || ""}
    onChange={handleChange}
    placeholder="Enter Net Weight"
    step="any"
  />
  {validationErrors.nw && (
    <div className="invalid-feedback">Net Weight is required</div>
  )}
</Grid>

<Grid item xs={12} sm={4}>
  <label htmlFor="doccharge" className="form-label">Document Charge</label>
  <input
    type="number"
    id="doccharge"
    name="doccharge"
    className={`form-control ${validationErrors.doccharge ? 'is-invalid' : ''}`}
    value={formData.doccharge || ""}
    onChange={handleChange}
    placeholder="Enter Document Charge"
  />
  {validationErrors.doccharge && (
    <div className="invalid-feedback">Document Charge is required</div>
  )}
</Grid>


<Grid item xs={12} sm={6} md={4} className="disables">
  <label htmlFor="interestbalamount" className="form-label">Interest Balance Amount</label>
  <input
    type="number"
    id="interestbalamount"
    name="interestbalamount"
    className={`form-control ${validationErrors.interestbalamount ? 'is-invalid' : ''}`}
    value={formData.interestbalamount || ""}
    onChange={handleChange}
    placeholder="Enter Interest Balance Amount"
  />
  {validationErrors.interestbalamount && (
    <div className="invalid-feedback">Loan Amount is required</div>
  )}
</Grid>

<Grid item xs={12} sm={6} md={4} className="disables">
  <label htmlFor="loanamountbalance" className="form-label">Loan Amount Balance</label>
  <input
    type="number"
    id="loanamountbalance"
    name="loanamountbalance"
    className={`form-control ${validationErrors.loanamountbalance ? 'is-invalid' : ''}`}
    value={formData.loanamountbalance || ""}
    onChange={handleChange}
    placeholder="Enter Loan Amount Balance"
  />
  {validationErrors.loanamountbalance && (
    <div className="invalid-feedback">Loan Amount is required</div>
  )}
</Grid>


<Grid item xs={12} sm={4} className="disables">
  <label htmlFor="interest" className="form-label">Interest</label>
  <input
    type="number"
    id="interest"
    name="interest"
    className={`form-control disables ${validationErrors.interest ? 'is-invalid' : ''}`}
    value={formData.interest || ""}
    onChange={handleChange}
    placeholder="Enter Interest"
    min="0"
  />
  {validationErrors.interest && (
    <div className="invalid-feedback">Interest is required</div>
  )}
</Grid>

          </Grid>

          <Grid
            container
            style={{ marginTop: "15px" }}
            alignItems="center"
            justifyContent="center"
          >
            {!hideUploadButtons && (
              <Grid item xs={12} sm={3}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Button
                    variant="outlined"
                    color="warning"
                    component="label"
                    className="upload-button"
                  
                    fullWidth
                    sx={{ border: "1px dashed #f57f17",height:'38px' }}
                    startIcon={
                      <UploadIcon className="icon-color" sx={{ mr: 0 }} />
                    }
                  >
                    Jewel Uploads
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={(e) => handleFileChange(e, "proof3")}
                    />
                  </Button>
                  <Box mt={2}>
                    {files.proof3?.length > 0 ? ( 
                      files.proof3.map((file, idx) => (
                        <div
                          key={idx}
                          style={{ textAlign: "center", marginBottom: "10px" }}
                        >
                          <Typography variant="body2">{file.name}</Typography>
                          <IconButton
                            style={{
                              background: "rgba(255, 255, 255, 0.7)",
                              marginLeft: "10px",
                            }}
                            onClick={() => handleFileRemove("proof3", idx)} 
                          >
                            <CloseIcon />
                          </IconButton>
                        </div>
                      ))
                    ) : (
                      <Typography variant="body2">No files selected</Typography> 
                    )}
                  </Box>
                  {validationErrors.proof3 && (
                    <Typography color="error" variant="caption" mt={1}>
                      {validationErrors.proof3}
                    </Typography>
                  )}
                </Box>
              </Grid>
            )}

            <Grid item xs={12} sx={{ mt: 1 }} align="center">
              <Button
                type="submit"
                className="sub-but"
                variant="contained"
                color="primary"
                sx={{  height:'28px'}}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
};

export default Addloan;
