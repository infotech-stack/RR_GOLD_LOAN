import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  IconButton,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadIcon from "@mui/icons-material/Upload";
import CloseIcon from "@mui/icons-material/Close";
import "./Master.css";
import Swal from "sweetalert2";
import axios from "axios";

const Master = ({
  ledgerId,
  customerId,
  ledgerEntries,
  fatherhusname,
  customerName,
  mobileNumber,
  address,
  mobilenumbers,
  landmark,
  proof1,
  hideUploadButtons,
  entry,
  isAddLoan,
  isReadOnly,
}) => {
  const isEditing = !!entry;
  const [nextLoanNumber, setNextLoanNumber] = useState("");
  const [jewelList, setJewelList] = useState([]);
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
    iw: "",
    gw: "",
    nw: "",
    schema: "",
    loanAmount: "",
    percent: "",
    interest: "",
    lastDateForLoan: "",
    otherDetails: "",
    fatherhusname: "",
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
  const [enableCustomerId, setEnableCustomerId] = useState(false);
  const formatDateToInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [customJewelDetail, setCustomJewelDetail] = useState("");
  const [editedEntry, setEditedEntry] = useState(entry);

  useEffect(() => {
    setEditedEntry(entry);
  }, [entry]);
  useEffect(() => {
    if (ledgerId && isEditing) {
      fetchLedgerEntryById(ledgerId).then((data) => {
        setFormData({
          ...data,
          date: formatDateToInput(data.date),
        });
      });
    }
  }, [ledgerId, isEditing]);

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
  useEffect(() => {
    if (ledgerEntries) {
      setFormData(ledgerEntries);
      setFiles({
        proof1: ledgerEntries.proof1 || [],
        proof2: ledgerEntries.proof2 || [],
        proof3: ledgerEntries.proof3 || [],
        customerSign: ledgerEntries.customerSign || null,
        customerPhoto: ledgerEntries.customerPhoto || null,
        thumbImpression: ledgerEntries.thumbImpression || null,
      });
    }
  }, [ledgerEntries]);

  const handleFileChange = (e, fileType) => {
    const selectedFiles = e.target.files;

    if (fileType === "proof3") {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [fileType]: [...(prevFiles[fileType] || []), ...selectedFiles],
      }));
    } else {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [fileType]: selectedFiles[0],
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

  const handleSingleFileRemove = (fileType) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fileType]: null,
    }));
  };

  const fetchSchemas = () => {


    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/schemas`)
      .then((response) => response.json())
      .then((data) => {
       
        setSchemas(data);
      })
      .catch((error) => {
        console.error("Error fetching schemas:", error);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "loanNumber") {
      newValue = value.toUpperCase();
    }
    if (name === "l") setEditedEntry({ ...editedEntry, [name]: newValue });

    setFormData((prevState) => {
      const newFormData = { ...prevState, [name]: newValue };
const updateLastDateForLoan = () => {
  const selectedSchema = schemas.find(
    (schema) => schema.name === newFormData.schema
  );

if (selectedSchema) {
  const timePeriod = selectedSchema.timePeriod; // e.g., "3 Months"
  const enteredDate = new Date(newFormData.date);
  let calculatedDate = new Date(enteredDate);

  // Add exact days based on schema
  let totalDays = 0;

  if (timePeriod.includes("Year")) {
    const years = parseInt(timePeriod); // e.g., 1
    totalDays = years * 365;
  } else if (timePeriod.includes("Month")) {
    const months = parseInt(timePeriod); // e.g., 3 or 6
    totalDays = months * 30; // Approximate: 30 days per month
  }

  // Add days
  calculatedDate.setDate(calculatedDate.getDate() + totalDays);
  newFormData.lastDateForLoan = calculatedDate.toISOString().split("T")[0];

  // Calculate interest
  const principal = parseFloat(newFormData.loanAmount);
  const percentage = parseFloat(selectedSchema.interestPercent.replace('%', ''));

  if (!isNaN(principal) && !isNaN(percentage)) {
    const interest = (principal * percentage * totalDays) / (365 * 100);
    newFormData.interest = interest.toFixed(0);
  } else {
    newFormData.interest = "";
  }
}

};


      if (name === "schema" || name === "date") {
        updateLastDateForLoan();
      }
      if (name === "schema") {
        const selectedSchema = schemas.find(
          (schema) => schema.name === newValue
        );
        newFormData.percent = selectedSchema
          ? selectedSchema.interestPercent
          : "";
      }

      if (name === "customerName" || name === "mobileNumber1") {
        const { customerName, mobileNumber1 } = newFormData;
        newFormData.customerId =
          customerName && mobileNumber1 && mobileNumber1.length === 10
            ? `${customerName.slice(0, 3).toUpperCase()}${mobileNumber1
                .slice(-4)
                .toUpperCase()}`
            : "";
      }

      if (name === "loanNumber") {
        const pattern = /^RR\d{3,}$/;
        if (!isEditing) {
          setValidationErrors((prevErrors) => ({
            ...prevErrors,
            [name]: !pattern.test(newValue),
          }));
        }
        newFormData[name] = newValue;
      } else if (
        name === "mobileNumber1" ||
        (name === "mobileNumber2" && value !== "")
      ) {
        const pattern = /^\d{10}$/;
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: !pattern.test(value),
        }));
      } else if ( name === "landmark") {
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
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [name]: value,
        }));
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

  const selectedSchema = schemas.find(
    (schema) => schema.name === newFormData.schema
  );

  if (!isNaN(principal) && !isNaN(percentage) && selectedSchema) {
    const timePeriod = selectedSchema.timePeriod; // e.g., "3 Months", "1 Year"
    let durationInMonths = 0;

    if (timePeriod.includes("Year")) {
      durationInMonths = parseInt(timePeriod) * 12;
    } else if (timePeriod.includes("Month")) {
      durationInMonths = parseInt(timePeriod);
    }

    const interest = (principal * percentage * durationInMonths) / (12 * 100);
    newFormData.interest = interest.toFixed(0);
  } else {
    newFormData.interest = "";
  }
}


      if (name === "jewelWeight" || name === "jewelList") {
        newFormData.gw = calculateTotalWeight(); // Recalculate total weight
      }
      return newFormData;
    });
  };

  const validateFormData = (formData, files, isEditing, latestLoanNumber) => {
    let errors = {};

    if (formData.loanNumber !== latestLoanNumber) {
      errors.loanNumber = "Loan number does not match the latest loan number";
    }

    for (let key in formData) {
      if (
        [
          "iw",
          "gw",
          "jDetails",
          "quality",
          "quantity",
          "interestbalamount",
          "loanamountbalance",
          "proof",
        ].includes(key)
      ) {
        continue;
      }

      if (key === "otherDetails") {
        continue;
      }

      if (formData[key].trim() === "" && key !== "mobileNumber2") {
        if (key === "lastDateForLoan") {
          errors[key] = "Enter Last date";
        } else if (key === "fatherhusname") {
          errors[key] = "Enter Father Name/Husband";
        } else if (key === "doccharge") {
          errors[key] = "Enter Document charge";
        } else {
          errors[key] = `Enter ${key.replace(/([A-Z])/g, " $1").toLowerCase()}`;
        }
      } else if (key === "mobileNumber1" && !/^\d{10}$/.test(formData[key])) {
        errors[key] = "Enter a valid 10-digit mobile number";
      } else if (
        key === "mobileNumber2" &&
        formData[key] !== "" &&
        !/^\d{10}$/.test(formData[key])
      ) {
        errors[key] = "Enter a valid 10-digit mobile number";
      } else if (
        (key === "landmark") &&
        !/^[a-zA-Z\s]*$/.test(formData[key])
      ) {
        errors[key] = `Enter a valid ${key
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()}`;
      } else if (key === "address" && formData[key].trim().length <= 10) {
        errors[key] = "Address must be longer than 10 characters";
      }
    }
    if (!isEditing) {
      if (!files.proof3 || files.proof3.length === 0) {
        errors.proof3 = "Upload proof 3 ( jewel )";
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

    // Validate form fields
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

    // Clear errors after validation
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

  // Function to calculate total weight
  const calculateTotalWeight = (list) => {
    const totalWeight = list.reduce(
      (total, item) => total + parseFloat(item.iw || 0),
      0
    );
    return totalWeight.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataWithJLNumber = { ...formData };
    const validationErrors = validateFormData(
      formDataWithJLNumber,
      files,
      isEditing,
      latestLoanNumber
    );

    if (Object.keys(validationErrors).length > 0) {
      setValidationErrors(validationErrors);
      const errorMessages = Object.values(validationErrors)
        .map((error) => `<li style="color: red;">${error}</li>`)
        .join("");
      const formattedErrors = `<ul style="color: red; text-align: left; columns: 2;">${errorMessages}</ul>`;
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        html: formattedErrors,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
        customClass: {
          popup: "swal-wide",
        },
      });
      return;
    }

    const formDataToSend = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      formDataToSend.append(key, value);
    }

    formDataToSend.append("jewelList", JSON.stringify(jewelList || []));
    Object.keys(files).forEach((fileType) => {
      if (Array.isArray(files[fileType])) {
        files[fileType].forEach((file) =>
          formDataToSend.append(fileType, file)
        );
      } else if (files[fileType]) {
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
        const errorText = await response.text();
        console.error("Error Response:", errorText);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
        return;
      }

      const data = await response.json();
      console.log("Success:", data);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Ledger entry ${isEditing ? "updated" : "stored"} successfully.`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      }).then(() => {
        setFormData({
          customerId: "",
          loanNumber: "",
          date: "",
          lastDateForLoan: "",

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
          percent: "",
          loanAmount: "",
          interest: "",
          proof1: null,
          proof2: null,
          proof3: [],
          customerSign: null,
          customerPhoto: null,
          thumbImpression: null,
          fatherhusname: "",
          jewelList: [],
          doccharge: "",
          interestbalamount: "",
          loanamountbalance: "",
        });
      });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
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

      console.log("Fetched customer data:", customer);

      setFormData({
        customerId: customer.customerId,
        customerName: customer.customerName,
        mobileNumber1: customer.mobileNumber1,
        mobileNumber2: customer.mobileNumber2,
        landmark: customer.landmark,
        address: customer.address,
        fatherhusname: customer.fatherhusname,
      });

      setFiles({
        proof1: customer.proof1 || [],
        proof2: customer.proof2 || [],
        proof3: [],
        customerSign: customer.customerSign || null,
        customerPhoto: customer.customerPhoto || null,
        thumbImpression: customer.thumbImpression || null,
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
    <Paper
      style={{
        padding: "3%", // Responsive padding
        margin: "auto",
        marginTop: 0,
        marginBottom: "50px",
        width: "103%", // Adjust width dynamically
      }}
      sx={{
        maxWidth: { xs: "100%", sm: "90%", md: "80%", lg: "79%" }, // Responsive width
        boxShadow: 3,
        mb: 5,
        backgroundColor: "#FDFCFF"
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        sx={{ color: "#373A8F", fontWeight: "550" }}
      >
        LEDGER FORM
      </Typography>
      <Grid
        item
        xs={12}
        sm={2}
        style={{ textAlign: "center" }}
        sx={{ mb: 2, mt: 2 }}
      >
        <Button
          variant="contained"
          color="primary"
          className="cate_btns"
          style={{ backgroundColor: "#F8C135" }}
        >
          Next LoanNo:
          <label className="cate ">
            {latestLoanNumber}
          </label>
        </Button>
      </Grid>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="customerId" className="form-label">
              Customer Id
            </label>
            <input
              type="text"
              id="customerId"
              name="customerId"
              className={`form-control ${
                validationErrors.customerId ? "is-invalid" : ""
              }`}
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
            <label htmlFor="loanNumber" className="form-label">
              Loan Number
            </label>
            <input
              type="text"
              id="loanNumber"
              name="loanNumber"
              className={`form-control ${
                validationErrors.loanNumber ? "is-invalid" : ""
              }`}
              value={formData.loanNumber}
              onChange={handleChange}
              placeholder="Enter Loan Number "
            />
            {validationErrors.loanNumber && (
              <div className="invalid-feedback">
                Loan Number must start with 'RR' followed by at least 3 digits
              </div>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="date" className="form-label">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className={`form-control ${
                validationErrors.date ? "is-invalid" : ""
              }`}
              value={formData.date}
              onChange={handleChange}
            />
            {validationErrors.date && (
              <div className="invalid-feedback">Date is required</div>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="customerName" className="form-label">
              Customer Name
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              className={`form-control ${
                validationErrors.customerName ? "is-invalid" : ""
              }`}
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Enter Customer Name"
              readOnly={isReadOnly}
            />
            {validationErrors.customerName && (
              <div className="invalid-feedback">Customer Name is required</div>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="mobileNumber1" className="form-label">
              Mobile Number
            </label>
            <input
              type="text"
              id="mobileNumber1"
              name="mobileNumber1"
              className={`form-control ${
                validationErrors.mobileNumber1 ? "is-invalid" : ""
              }`}
              value={formData.mobileNumber1}
              onChange={handleChange}
              placeholder="Enter Mobile Number"
              readOnly={isReadOnly}
            />
            {validationErrors.mobileNumber1 && (
              <div className="invalid-feedback">
                Mobile Number must be 10 digits
              </div>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="mobileNumber2" className="form-label">
              Alternate Mobile Number
            </label>
            <input
              type="text"
              id="mobileNumber2"
              name="mobileNumber2"
              className={`form-control ${
                validationErrors.mobileNumber2 ? "is-invalid" : ""
              }`}
              value={formData.mobileNumber2}
              onChange={handleChange}
              placeholder="Enter Mobile Number"
              readOnly={isReadOnly}
            />
            {validationErrors.mobileNumber2 && (
              <div className="invalid-feedback">
                Mobile Number must be 10 digits
              </div>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="fatherhusname" className="form-label">
              Father/Husband Name
            </label>
            <input
              type="text"
              id="fatherhusname"
              name="fatherhusname"
              className={`form-control ${
                validationErrors.fatherhusname ? "is-invalid" : ""
              }`}
              value={formData.fatherhusname}
              onChange={handleChange}
              placeholder="Enter Father/Husband Name"
            />
            {validationErrors.fatherhusname && (
              <div className="invalid-feedback">
                Father Name/Husband is required
              </div>
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="landmark" className="form-label">
              Landmark
            </label>
            <input
              type="text"
              id="landmark"
              name="landmark"
              className={`form-control ${
                validationErrors.landmark ? "is-invalid" : ""
              }`}
              value={formData.landmark}
              readOnly={isReadOnly}
              onChange={handleChange}
              placeholder="Enter Landmark"
            />
            {validationErrors.landmark && (
              <div className="invalid-feedback">Landmark must be a string</div>
            )}
          </Grid>

          <Grid item xs={12}>
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className={`form-control ${
                validationErrors.address ? "is-invalid" : ""
              }`}
              value={formData.address}
              readOnly={isReadOnly}
              onChange={handleChange}
              placeholder="Enter Address"
            />
            {validationErrors.address && (
              <div className="invalid-feedback">
                Address must be greater than 10 characters
              </div>
            )}
          </Grid>

          <Grid item xs={12} sm={3}>
            <label htmlFor="schema" className="form-label">
              Schema
            </label>
            <select
              id="schema"
              name="schema"
              className={`form-select ${
                validationErrors.schema ? "is-invalid" : ""
              }`}
              value={formData.schema}
              onChange={handleChange}
              disabled={!formData.date} // Disable if date is not selected
            >
              <option value="">Select Schema</option>
              {schemas.map((schema) => (
                <option key={schema._id} value={schema.name}>
                  {schema.name}
                </option>
              ))}
            </select>
            {validationErrors.schema && (
              <div className="invalid-feedback">Schema is required</div>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            {/* Label */}
            <label htmlFor="percent" className="form-label">
              Percent %
            </label>

            {/* Input Field */}
            <input
              type="text"
              id="percent"
              name="percent"
              className={`form-control ${
                validationErrors.percent ? "is-invalid" : ""
              }`}
              value={formData.percent}
              onChange={handleChange}
              placeholder="Enter percent"
            />

            {/* Validation Error Message */}
            {validationErrors.percent && (
              <div className="invalid-feedback">Percent is required</div>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="loanAmount" className="form-label">
              Loan Amount
            </label>
            <input
              type="number"
              id="loanAmount"
              name="loanAmount"
              className={`form-control ${
                validationErrors.loanAmount ? "is-invalid" : ""
              }`}
              min="0"
              value={formData.loanAmount}
              onChange={handleChange}
              placeholder="Enter Loan Amount"
            />
            {validationErrors.loanAmount && (
              <div className="invalid-feedback">Loan Amount is required</div>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="lastDateForLoan" className="form-label">
              Last Date for Loan
            </label>
            <input
              type="date"
              id="lastDateForLoan"
              name="lastDateForLoan"
              className={`form-control ${
                validationErrors.lastDateForLoan ? "is-invalid" : ""
              }`}
              value={formData.lastDateForLoan}
              onChange={handleChange}
            />
            {validationErrors.lastDateForLoan && (
              <div className="invalid-feedback">
                {validationErrors.lastDateForLoan}
              </div>
            )}
          </Grid>

          <Grid
            item
            xs={12}
            style={{ textAlign: "center" }}
            sx={{ mb: 0, mt: 0 }}
          >
            <Box
              component="span"
              sx={{
                
                color: "rgb(199 1 130)",
                fontWeight: 600,
                padding: "4px 8px",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              ADD Jewellery Detail
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="jDetails" className="form-label">
              Jewel Details
            </label>
            <select
              id="jDetails"
              name="jDetails"
              className={`form-select ${errors.jDetails ? "is-invalid" : ""}`}
              value={formData.jDetails}
              onChange={handleSelectChange}
            >
              <option value="">Select Jewel</option>
              <option value="chain">CHAIN</option>
              <option value="bracelet">BRACELET</option>
              <option value="bangle">BANGLE</option>
              <option value="stud_jimmiki">STUD JIMMIKI</option>
              <option value="stud_thongal">STUD THONGAL</option>
              <option value="stud_drops">STUD DROPS</option>
              <option value="ring">RING</option>
              <option value="anklet">ANKLET</option>
              <option value="coin">COIN</option>
              <option value="dollar">DOLLAR</option>
              <option value="stone_stud">STONE STUD</option>
              <option value="mattal">MATTAL</option>
              <option value="mugaphu_chain">MUGAPHU CHAIN</option>
              <option value="silver">SILVER</option>
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
                <label htmlFor="jewelDetails" className="form-label">
                  Jewel Details
                </label>
                <input
                  type="text"
                  id="jewelDetails"
                  className={`form-control ${
                    validationErrors.customJewelDetail ? "is-invalid" : ""
                  }`}
                  value={customJewelDetail}
                  onChange={(e) => setCustomJewelDetail(e.target.value)}
                  placeholder="Enter jewel details"
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
          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="quality" className="form-label">
              Quality
            </label>
            <select
              id="quality"
              name="quality"
              className={`form-select ${errors.quality ? "is-invalid" : ""}`}
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
            {errors.quality && (
              <div className="invalid-feedback">Quality is required</div>
            )}
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
              <div className="mb-3">
                <label htmlFor="customQuality" className="form-label">
                  Custom Quality
                </label>
                <input
                  type="text"
                  id="customQuality"
                  className={`form-control form-control-sm ${
                    dialogError ? "is-invalid" : ""
                  }`}
                  value={customQuality}
                  onChange={(e) => setCustomQuality(e.target.value)}
                  placeholder="Enter custom quality"
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

          <Grid item xs={12} sm={6} md={3}>
            <label htmlFor="quantity" className="form-label">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
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
            <label htmlFor="iw" className="form-label">
              Item Weight (gms)
            </label>
            <input
              type="number"
              id="iw"
              name="iw"
              className={`form-control ${errors.iw ? "is-invalid" : ""}`}
              step="any"
              value={formData.iw || ""}
              onChange={handleChange}
              placeholder="Enter Item Weight"
            />
            {errors.iw && (
              <div className="invalid-feedback">Item Weight is required</div>
            )}
          </Grid>

          <Grid item xs={12} align="center" sx={{ mb: 0, fontWeight: 600 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddJewel}
              sx={{ fontWeight: 600, fontSize: "13px" }}
            >
              Add Jewel
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={4} className="disables">
            <TextField
              name="interestbalamount"
              label=" interestbalamount"
              size="small"
              fullWidth
              value={formData.interestbalamount}
              onChange={handleChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "black",
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} className="disables">
            <TextField
              name="loanamountbalance"
              label="loanamountbalance"
              size="small"
              fullWidth
              value={formData.loanamountbalance}
              onChange={handleChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "black",
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              name="interest"
              size="small"
              label="Interest"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              className="disables"
              fullWidth
              value={formData.interest}
              onChange={handleChange}
              error={!!validationErrors.interest}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "black",
                  },
                },
              }}
            />
          </Grid>
        </Grid>

        {jewelList.length > 0 && (
          <Grid item xs={12} sx={{ mb: 3 }}>
            <TableContainer
              component={Paper}
              sx={{ maxWidth: 900, margin: "auto" }}
            >
              <Table
                sx={{ border: "1px solid black", borderCollapse: "collapse" }}
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
                        border: "1px solid black",
                        fontWeight: "700",
                        color: "#fff",
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
                        color: "#fff",
                      }}
                    >
                      Quality
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "12px",
                        textAlign: "left",
                        border: "1px solid black",
                        fontWeight: "700",
                        color: "#fff",
                      }}
                    >
                      Quantity
                    </TableCell>
                    <TableCell
                      sx={{
                        padding: "12px",
                        textAlign: "left",
                        border: "1px solid black",
                        fontWeight: "700",
                        color: "#fff",
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
                        color: "#fff",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jewelList.map((item, index) => (
                    <TableRow key={index}>
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
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <label htmlFor="gw" className="form-label">
              Gross Weight (gms)
            </label>
            <input
              type="number"
              id="gw"
              name="gw"
              className={`form-control ${
                validationErrors.gw ? "is-invalid" : ""
              }`}
              step="any"
              value={formData.gw || ""}
              onChange={handleChange}
              placeholder="Enter Gross Weight"
            />
            {validationErrors.gw && (
              <div className="invalid-feedback">Gross Weight is required</div>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <label htmlFor="nw" className="form-label">
              Net Weight (gms)
            </label>
            <input
              type="number"
              id="nw"
              name="nw"
              className={`form-control ${
                validationErrors.nw ? "is-invalid" : ""
              }`}
              step="any"
              value={formData.nw || ""}
              onChange={handleChange}
              placeholder="Enter Net Weight"
            />
            {validationErrors.nw && (
              <div className="invalid-feedback">Net Weight is required</div>
            )}
          </Grid>

          <Grid item xs={12} sm={4}>
            <label htmlFor="doccharge" className="form-label">
              Document Charge
            </label>
            <input
              type="text"
              id="doccharge"
              name="doccharge"
              className={`form-control ${
                validationErrors.doccharge ? "is-invalid" : ""
              }`}
              value={formData.doccharge || ""}
              onChange={handleChange}
              placeholder="Enter Document Charge"
            />
            {validationErrors.doccharge && (
              <div className="invalid-feedback">
                Document Charge is required
              </div>
            )}
          </Grid>
        </Grid>

        <Grid
          container
          spacing={2}
          style={{ marginTop: "20px" }}
          align="center"
        >
          {!hideUploadButtons &&
            [
              { fileType: "proof1", label: "Upload Proof 1 (front)" },
              { fileType: "proof2", label: "Upload Proof 2 (back)" },
              { fileType: "proof3", label: "Jewel Uploads" },
            ].map(({ fileType, label }, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={2}
                >
                  <Button
                    variant="outlined"
                    color="warning"
                    component="label"
                    className="upload-button"
                    fullWidth
                    sx={{ border: "1px dashed #f57f17", mb: 1 }}
                    startIcon={
                      <UploadIcon className="icon-color" sx={{ mr: 0 }} />
                    }
                  >
                    {label}
                    <input
                      type="file"
                      hidden
                      multiple={fileType === "proof3"}
                      onChange={(e) => handleFileChange(e, fileType)}
                    />
                  </Button>
                  {/* "No files selected" shown initially */}
                  <Box>
                    {!files[fileType] ||
                    (Array.isArray(files[fileType]) &&
                      files[fileType].length === 0) ? (
                      <Typography variant="body2" color="textSecondary">
                        No files selected
                      </Typography>
                    ) : Array.isArray(files[fileType]) ? (
                      files[fileType].map((file, idx) => (
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
                            onClick={() => handleFileRemove(fileType, idx)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{ textAlign: "center", marginBottom: "10px" }}
                      >
                        <Typography variant="body2">
                          {files[fileType].name}
                        </Typography>
                        <IconButton
                          style={{
                            background: "rgba(255, 255, 255, 0.7)",
                            marginLeft: "10px",
                          }}
                          onClick={() => handleSingleFileRemove(fileType)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </div>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))}

          {!hideUploadButtons &&
            ["customerSign", "customerPhoto", "thumbImpression"].map(
              (fileType) => (
                <Grid item xs={12} sm={6} md={4} key={fileType}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                  >
                    <Button
                      variant="outlined"
                      color="warning"
                      component="label"
                      className="upload-button"
                      fullWidth
                      sx={{ border: "1px dashed #f57f17", mb: 2 }}
                      startIcon={
                        <UploadIcon className="icon-color" sx={{ mr: 0 }} />
                      }
                    >
                      {fileType === "customerSign"
                        ? "Customer Sign Upload"
                        : fileType === "customerPhoto"
                        ? "Customer Photo Upload"
                        : "Thumb Impression Upload"}
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleFileChange(e, fileType)}
                      />
                    </Button>
                    {/* "No files selected" shown initially */}
                    <Box>
                      {!files[fileType] ? (
                        <Typography variant="body2" color="textSecondary">
                          No files selected
                        </Typography>
                      ) : (
                        <div style={{ textAlign: "center" }}>
                          <Typography variant="body2">
                            {files[fileType].name}
                          </Typography>
                          <IconButton
                            style={{
                              background: "rgba(255, 255, 255, 0.7)",
                              marginLeft: "10px",
                            }}
                            onClick={() => handleSingleFileRemove(fileType)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </div>
                      )}
                    </Box>
                  </Box>
                </Grid>
              )
            )}

          <Grid item xs={12} sx={{ mt: 3 }} align="center">
            <Button
              type="submit"
              className="sub-but sub-green "
              variant="contained"
              color="primary"
              sx={{ ml: 2 }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default Master;
