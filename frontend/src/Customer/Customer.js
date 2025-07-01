import React, { useState, useEffect } from "react";
import axios from "axios";
import Tooltip from "@mui/material/Tooltip";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  SvgIcon,
  useTheme,
  useMediaQuery,
  Dialog,
  Box,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Popover,
  Grid,
  IconButton,
} from "@mui/material";
import Form from "react-bootstrap/Form";
import CloseIcon from "@mui/icons-material/Close";
import { Visibility, Delete } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useDispatch, useSelector } from "react-redux";
import { openDialog, closeDialog } from "../reducers/customerSlice";
import CustomerDialog from "./CustomerDialog";
import { fetchPaymentEntries } from "../actions/customerActions";
import AddLoan from "../Customer/addLoan";
import Swal from "sweetalert2";
const Customer = ({ entry }) => {
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentEntries, setPaymentEntries] = useState([]);
  const [totals, setTotals] = useState({
    LGL: 0,
    MGL: 0,
    HGL: 0,
    Live: 0,
    Closed: 0,
  });
  const [loanTotals, setLoanTotals] = useState({ Live: 0, Closed: 0 });
  const [liveAccounts, setLiveAccounts] = useState(0);
  const [closedAccounts, setClosedAccounts] = useState(0);
  const [openAddLoanDialog, setOpenAddLoanDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const { isDialogOpen, selectedEntry } = useSelector(
    (state) => state.customer
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleViewClick = async (entry) => {
    try {
      const fetchedEntries = await dispatch(
        fetchPaymentEntries(entry.loanNumber)
      );
      setPaymentEntries(fetchedEntries);
      dispatch(openDialog(entry));
    } catch (error) {
      console.error("Error fetching payment entries:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 because getMonth() returns 0-based value
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}/${month}/${day}`;
  };
  const groupedEntries = ledgerEntries.reduce((acc, entry) => {
    if (!acc[entry.customerId]) {
      acc[entry.customerId] = [];
    }
    acc[entry.customerId].push(entry);
    return acc;
  }, {});
  const convertPaddedToNonPadded = (number) => number.replace(/^0+/, "");
  const [filteredTotals, setFilteredTotals] = useState({
    LGL: 0,
    MGL: 0,
    HGL: 0,
    Live: 0,
    Closed: 0,
  });
  const isOverdue = (dateString) => new Date(dateString) < new Date();
const filteredEntries = Object.keys(groupedEntries).reduce(
  (acc, customerId) => {
    const customerEntries = groupedEntries[customerId];
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    const isMatch = customerEntries.filter((entry) => {
      // Handle schema search separately to avoid partial matches
      const schemaMatch = lowerSearchTerm === "hgl" 
        ? entry.schema.toLowerCase() === "hgl"
        : entry.schema.toLowerCase().includes(lowerSearchTerm);

      const matchesSearchTerm =
        entry.customerId.toLowerCase().includes(lowerSearchTerm) ||
        entry.loanNumber.toLowerCase().includes(lowerSearchTerm) ||
        entry.customerName.toLowerCase().includes(lowerSearchTerm) ||
        (entry.mobileNumber1 && entry.mobileNumber1.toLowerCase().includes(lowerSearchTerm)) ||
        (entry.lastDateForLoan && entry.lastDateForLoan.toLowerCase().includes(lowerSearchTerm)) ||
        (entry.date && entry.date.toLowerCase().includes(lowerSearchTerm)) ||
        schemaMatch ||
        entry.loanAmount.toString().includes(lowerSearchTerm);

      const matchesStatus = entry.status &&
        entry.status.toLowerCase().includes(lowerSearchTerm);

      return matchesSearchTerm || matchesStatus;
    });

    if (isMatch.length > 0) {
      acc[customerId] = isMatch;
    }

    return acc;
  },
  {}
);
useEffect(() => {
    const totalFilteredEntries = Object.values(filteredEntries).flat();

    // Initialize counts for filtered totals
    let liveAccountsCount = 0;
    let closedAccountsCount = 0;
    let lglCount = 0;
    let mglCount = 0;
    let hglCount = 0;
    let hglspclCount = 0;

    // Calculate live and closed accounts based on the filtered entries
    totalFilteredEntries.forEach((entry) => {
        if (!entry.status || !entry.schema) return;

        const status = entry.status.toLowerCase();
        const schema = entry.schema.toUpperCase();

        // Increment status counts
        if (status === "closed") closedAccountsCount++;
        if (status === "live") liveAccountsCount++;

        // Increment schema counts
        switch (schema) {
            case "LGL":
                lglCount++;
                break;
            case "MGL":
                mglCount++;
                break;
            case "HGL":
                hglCount++;
                break;
            case "HGL-SPCL":
                hglspclCount++;
                break;
            default:
                break;
        }
    });

    // Initialize totals with all counts
    let totals = {
        LGL: lglCount,
        MGL: mglCount,
        HGL: hglCount,
        HGLSPCL: hglspclCount,
        Live: liveAccountsCount,
        Closed: closedAccountsCount,
    };

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    // Handle search term filters
    if (lowerSearchTerm === "lgl") {
        totals = {
            ...totals,
            MGL: 0,
            HGL: 0,
            HGLSPCL: 0
        };
    } else if (lowerSearchTerm === "mgl") {
        totals = {
            ...totals,
            LGL: 0,
            HGL: 0,
            HGLSPCL: 0
        };
    } else if (lowerSearchTerm === "hgl") {
        totals = {
            ...totals,
            LGL: 0,
            MGL: 0,
            HGLSPCL: 0
        };
    } else if (lowerSearchTerm === "hgl-spcl") {
        totals = {
            ...totals,
            LGL: 0,
            MGL: 0,
            HGL: 0
        };
    } else if (lowerSearchTerm === "live") {
        totals = {
            ...totals,
            Closed: 0
        };
    } else if (lowerSearchTerm === "closed") {
        totals = {
            ...totals,
            Live: 0
        };
    }

    // Only set totals if there is a change
    setTotals((prevTotals) => {
        const hasChanged = Object.keys(prevTotals).some(
            key => prevTotals[key] !== totals[key]
        );
        return hasChanged ? totals : prevTotals;
    });
}, [searchTerm, filteredEntries]);

useEffect(() => {
  const fetchLoanData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/ledger/merged-loan-data`);
      setLoanData(response.data);
    } catch (err) {
      console.error("API Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchLoanData();
}, []);

const fetchLedgers = async () => {
  try {
    // Fetch ledger entries
    const ledgerResponse = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/ledger/all`
    );
    const formattedLedgerEntries = ledgerResponse.data
      .reverse()
      .map((entry) => ({
        ...entry,
        date: formatDate(entry.date),
        lastDateForLoan: formatDate(entry.lastDateForLoan),
      }));

    // Fetch loan entries
    const loanResponse = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/all`
    );
    const loanData = loanResponse.data;

    // Group loans by loanNo, sort by paymentDate, and get the latest entry for each loan
    const loansByNumber = loanData.reduce((acc, loan) => {
      if (!acc[loan.loanNo]) {
        acc[loan.loanNo] = [];
      }
      acc[loan.loanNo].push(loan);
      return acc;
    }, {});

    // Sort loan entries by date and get the latest entry
    const latestLoans = Object.keys(loansByNumber).reduce((acc, loanNo) => {
      const sortedEntries = loansByNumber[loanNo].sort(
        (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
      );
      acc[loanNo] = sortedEntries[0]; // Pick the latest payment entry
      return acc;
    }, {});

    const enrichedLedgerEntries = formattedLedgerEntries.map(
      (ledgerEntry) => {
        const matchingLoan = latestLoans[ledgerEntry.loanNumber];
        return {
          ...ledgerEntry,
          status:
            matchingLoan && matchingLoan.balance === 0 ? "Closed" : "Live",
            interestAmount: matchingLoan ? matchingLoan.interestamount : "N/A",
            balance: matchingLoan ? matchingLoan.interestPrinciple : "N/A",
      
      };
      }
    );

    // Set the enriched ledger entries to state
    setLedgerEntries(enrichedLedgerEntries);

    // Calculate totals and account counts
    const totalLedgerEntries = enrichedLedgerEntries.length;

    const ledgerTotals = enrichedLedgerEntries.reduce(
      (acc, entry) => {
        acc.LGL += entry.schema === "LGL" ? 1 : 0;
        acc.MGL += entry.schema === "MGL" ? 1 : 0;
        acc.HGL += entry.schema === "HGL" ? 1 : 0;
        acc.HGLSPCL+=entry.schema === "HGL-SPCL" ? 1:0;
        return acc;
      },
      { LGL: 0, MGL: 0, HGL: 0 ,HGLSPCL:0}
    );

    // Calculate closed and live accounts
    const closedAccountsCount = Object.values(latestLoans).filter(
      (entry) => entry.balance === 0
    ).length;

    const liveAccountsCount = totalLedgerEntries - closedAccountsCount;

    // Update totals state
    setTotals({
      LGL: ledgerTotals.LGL,
      MGL: ledgerTotals.MGL,
      HGL: ledgerTotals.HGL,
      HGLSPCL:ledgerTotals.HGLSPCL,
      Live: liveAccountsCount,
      Closed: closedAccountsCount,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

useEffect(() => {
  fetchLedgers(); // Only call once when component mounts
}, []);



  const handleAddLoanClick = (customerId) => {
    setSelectedCustomerId(customerId);
    setOpenAddLoanDialog(true);
  };

  const handleCloseAddLoanDialog = () => {
    setOpenAddLoanDialog(false);
    setSelectedCustomerId(null);
  };

  const calculateTotals = (entries) => {
    return entries.reduce(
      (acc, entry) => {
        acc.totalLoanAmount += entry.loanamountbalance !== null 
  ? Number(entry.loanamountbalance) || 0 
  : Number(entry.loanAmount) || 0;

        acc.totalInterest += Number(entry.interest) || 0;
        return acc;
      },
      { totalLoanAmount: 0, totalInterest: 0 }
    );
  };
  const totals2 = calculateTotals(Object.values(filteredEntries).flat());

  const combinedTotal = totals2.totalLoanAmount ;
  const TotalLoanAmount = totals2.totalLoanAmount; // Corrected to use totals
 
  // Assuming `filteredEntries` contains all ledger entries
  const allEntries = Object.values(filteredEntries).flat();
  
  // Calculate totals for MGL, LGL, and HGL
  const mglEntries = allEntries.filter(entry => entry.schema === 'MGL');
  const hglEntries = allEntries.filter(entry => entry.schema === 'HGL');
  const lglEntries = allEntries.filter(entry => entry.schema === 'LGL');
  const hglspclEntries = allEntries.filter(entry => entry.schema ==='HGL-SPCL');
  
  const mglTotals = calculateTotals(mglEntries);
  const hglTotals = calculateTotals(hglEntries);
  const lglTotals = calculateTotals(lglEntries);
  const hglspclTotals = calculateTotals(hglspclEntries);
  
  // Now you can use the totals
  const MGLTotalAmount = mglTotals.totalLoanAmount;

  const HGLTotalAmount = hglTotals.totalLoanAmount;

  const LGLTotalAmount = lglTotals.totalLoanAmount;

  const HGLSPCLTotalAmount = hglspclTotals.totalLoanAmount;

  
  // Combined totals for each schema
  const MGLCombinedTotal = MGLTotalAmount ;
  const HGLCombinedTotal = HGLTotalAmount ;
  const LGLCombinedTotal = LGLTotalAmount;
  const HGLSPCLCombinedTotal = HGLSPCLTotalAmount;
  
 
  

  const handleDelete = async (entry) => {
    const { loanNumber } = entry;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this ledger entry? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      input: "checkbox",
      inputValue: 0, // initial state for checkbox (unchecked)
      inputPlaceholder: "I understand the consequences of this action",
    });

    if (result.isConfirmed && result.value) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_BACKEND_URL}/api/ledger/${loanNumber}`
        );
        fetchLedgers();
        Swal.fire("Deleted!", "The ledger entry has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting ledger entry:", error);
        Swal.fire(
          "Error!",
          "There was an error deleting the ledger entry.",
          "error"
        );
      }
    } else if (result.isConfirmed && !result.value) {
      Swal.fire("Cancelled", "You need to confirm the action.", "info");
    }
  };
  const [showPopover, setShowPopover] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const isPopoverOpen = Boolean(anchorEl);



  
  return (
    <Paper
      elevation={4}
      className="paperbg"
      sx={{
        padding: theme.spacing(3),
        margin: "auto",
        mt: 1,
        maxWidth: "100%",
        borderRadius: theme.shape.borderRadius,
        backgroundColor:"#FDFCFF"
      }}
    >
      <Grid
        container
        spacing={2}
        justifyContent="flex-start"
        alignItems="center"
      >
        <Grid item xs={7}>
          <Typography
            variant="h6"
            align="right"
            gutterBottom
            sx={{ color: "#373A8F", fontWeight: "550", mt: 2, mb: 1 }}
          >
            CUSTOMER ENTRY DETAILS
          </Typography>
        </Grid>

        <Grid item xs={3} container justifyContent="flex-end">
          <Form className="d-flex search_box">
            <Form.Control
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline-success" className="search_button">
              Search
            </Button>
          </Form>
        </Grid>
      </Grid>

      <div
        style={{
          marginTop:"10px",
          marginBottom: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
           <div className="d-flex align-items-center justify-content-center w-50 p-2 bg-light rounded shadow-sm" style={{ border: "1px solid #1a75e4" }}>
              <Typography
                variant="subtitle2"
                className="mb-0 fw-bold text-primary"
              >
                LGL: {totals.LGL}
              </Typography>
            </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
            <div className="d-flex align-items-center justify-content-center w-50 p-2 bg-light rounded shadow-sm" style={{ border: "1px solid #6f6a6a" }} >
              <Typography
                variant="subtitle2"
                className="mb-0 fw-bold text-secondary"
              >
                MGL: {totals.MGL}
              </Typography>
            </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
        <div className="d-flex align-items-center justify-content-center w-50 p-2 bg-light rounded shadow-sm" style={{ border: "1px solid rgb(81, 190, 192)" }}>
              <Typography
                variant="subtitle2"
                className="mb-0 fw-bold text-info"
              >
                HGL: {totals.HGL}
              </Typography>
            </div>
        </div>
          <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
        <div className="d-flex align-items-center justify-content-center w-50 p-2 bg-light rounded shadow-sm" style={{ border: "1px solid rgb(89, 91, 92)" }}>
              <Typography
                variant="subtitle2"
                className="mb-0 fw-bold text-dark"
              >
                HGL-SPCL: {totals.HGLSPCL}
              </Typography>
            </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="d-flex align-items-center justify-content-center w-50 p-2 bg-light rounded shadow-sm" style={{ border: "1px solid rgb(18, 163, 54)" }}>
              <CheckCircleIcon
                className="text-success me-2"
                style={{ fontSize: "16px" }}
              />
              <Typography
                variant="subtitle2"
                className="mb-0 fw-bold text-success"
              >
                Live: {totals.Live}
              </Typography>
            </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom:"30px"
          }}
        >
         <div className="d-flex align-items-center  mt-3 justify-content-center p-2 w-50 bg-light rounded shadow-sm" style={{ border: "1px solid rgb(194, 43, 43)" }}>
              <CancelIcon
                className="text-danger me-2"
                style={{ fontSize: "16px" }}
              />
              <Typography
                variant="subtitle2"
                className="mb-0 fw-bold text-danger"
              >
                Closed: {totals.Closed}
              </Typography>
            </div>
        </div>
      </div>
      <TableContainer
        component={Paper}
        sx={{
   
          maxHeight: "70vh",
          overflowX: "auto",
         
        }}
      >
        <Table stickyHeader className="table_headerrem" sx={{
    border: "1px solid #8F8F8F",
    borderCollapse: "collapse", // Ensures no gaps between borders
  }} >
          <TableHead    >
            <TableRow>
              {[
                "Sl.No",
                "Customer ID",
                "Customer Name",
                "Mobile Number",
                "Add Loan",
                "Loan Number",
                "Date",
                "Schema",
                "Loan Amount",
                "Last Date",
                "Status",
                "Actions",
              ].map((header) => (
                <TableCell
                  key={header}
                  align="center"
                  sx={{
                    border: "1px solid #8F8F8F",
                    color:"black",
                    backgroundColor: "#CBECFF",
                    color: theme.palette.common.black,
                    fontWeight: "bold",
                    fontSize: isMobile ? "0.75rem" : "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.04rem",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(filteredEntries).map((customerId, idx) => {
              const customerEntries = filteredEntries[customerId];
              const overdue = entry ? isOverdue(entry.lastDateForLoan) : false;

              return customerEntries.map((entry, entryIdx) => (
                <TableRow key={entry._id}>
                  {entryIdx === 0 && (
                    <>
                      <TableCell
                        rowSpan={customerEntries.length}
                        align="center"
                        sx={{
                          border: "1px solid #8f8f8f",
                          fontSize: "12px",
                          backgroundColor: "#fff",
                        }}
                      >
                        {idx + 1}
                      </TableCell>
                      <TableCell
                        rowSpan={customerEntries.length}
                        align="center"
                        sx={{
                          border: "1px solid #8f8f8f",
                          fontSize: "13px",
                          backgroundColor: "#fff",
                        }}
                      >
                        {entry.customerId}
                      </TableCell>
                      <TableCell
                        rowSpan={customerEntries.length}
                        align="center"
                        sx={{
                          border: "1px solid #8f8f8f",
                          fontSize: "13px",
                          backgroundColor: "#fff",
                        }}
                      >
                        {entry.customerName}
                      </TableCell>
                      <TableCell
                        rowSpan={customerEntries.length}
                        align="center"
                        sx={{
                          border: "1px solid #8f8f8f",
                          fontSize: "13px",
                          backgroundColor: "#fff",
                        }}
                      >
                        {entry.mobileNumber1}
                      </TableCell>
                      <TableCell
                        rowSpan={customerEntries.length}
                        align="center"
                        sx={{
                          border: "1px solid #8f8f8f",
                          fontSize: "13px",
                          backgroundColor: "#fff",
                          width: 116,
                        }}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          color="info"
                          sx={{ textTransform: "capitalize" ,backgroundColor:"#107f7a"}}
                          onClick={() => handleAddLoanClick(customerId)}
                        >
                          AddLoan
                        </Button>
                      </TableCell>
                    </>
                  )}

                  {/* Loan Details */}
                  <TableCell
                    align="center"
                    sx={{
                      border: "1px solid #8f8f8f",
                      fontSize: "13px",
                      backgroundColor: "#F5F5F5",
                    }}
                  >
                    {entry.loanNumber}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      border: "1px solid #8f8f8f",
                      fontSize: "13px",
                      backgroundColor: "#F5F5F5",
                    }}
                    
                  >
                    {entry.date}
                    </TableCell>
                    <TableCell
  align="center"
  sx={{
    border: "1px solid #8f8f8f",
    fontSize: "13px",
    color: entry.isSchemaUpdated ? "#FF5F1F" : "black",
    fontWeight: entry.isSchemaUpdated ? "bold" : "normal",
    backgroundColor: "#F5F5F5",
  }}
>
  {entry.isSchemaUpdated ? (
    <Tooltip title="Schema Changed" arrow>
      <span>{entry.schema}</span>
    </Tooltip>
  ) : (
    entry.schema
  )}
</TableCell>


<TableCell
  align="center"
  sx={{
    border: "1px solid #8f8f8f",
    fontSize: "13px",
    backgroundColor: "#F5F5F5",
  }}
>
₹ {entry.loanamountbalance === null 
      ? entry.loanAmount  
      : entry.loanamountbalance === "0" || entry.loanamountbalance === 0 
      ? "0"              
      : entry.loanamountbalance}
</TableCell>
                 
                 
                 
                  <TableCell
                    align="center"
                    sx={{
                      border: "1px solid #8f8f8f",
                      fontSize: "13px",
                      backgroundColor: "#F5F5F5",
                      color:
                        entry.lastDateForLoan === searchTerm
                          ? "red"
                          : "inherit",
                      cursor:
                        entry.lastDateForLoan === searchTerm
                          ? "pointer"
                          : "default", 
                    }}
                    onMouseEnter={
                      entry.lastDateForLoan === searchTerm
                        ? handlePopoverOpen
                        : null
                    } 
                    onMouseLeave={handlePopoverClose} 
                  >
                    {entry.lastDateForLoan}
                  </TableCell>

                  <Popover
                    id="mouse-over-popover"
                    sx={{
                      pointerEvents: "none",
                    }}
                    open={isPopoverOpen}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    onClose={handlePopoverClose}
                    disableRestoreFocus
                  >
                    <Typography sx={{ p: 1 }}>
                      
                      
                      <span style={{ color: "red" }}>
                         Loan Expiry Date
                      </span>
                    </Typography>
                  </Popover>

               
                  <TableCell
                    align="center"
                    sx={{
                      border: "1px solid #8f8f8f",
                      fontSize: "13px",
                      backgroundColor: "#F5F5F5",
                      width: 80,
                    }}
                  >
                    <div className="loanStatusContainer">
                      <span
                        className="loanStatuss"
                        style={{
                          backgroundColor:
                            entry.status === "Closed" ? "red" : "green",
                        }}
                      >
                        <div className="statusDot"></div>
                        {entry.status}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    align="center"
                    sx={{
                      border: "1px solid #8f8f8f",
                      fontSize: "13px",
                      backgroundColor: "#F5F5F5",
                      width: 320,
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      color="info"
                      sx={{ mr: 1, textTransform: "capitalize" }}
                      onClick={() => handleViewClick(entry)}
                    >
                      <SvgIcon
                        component={Visibility}
                        sx={{ fontSize: 14, mr: 0.2 }}
                      />
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      sx={{ textTransform: "capitalize" }}
                      onClick={() => handleDelete(entry)}
                    >
                      <SvgIcon
                        component={Delete}
                        sx={{ fontSize: 14, mr: 0.2 }}
                      />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
  display="flex"
  flexDirection="row"
  justifyContent="center"
  alignItems="center"
  margin="1px 0"
  sx={{
    mt: 5,
    mb: 2,
  }}
>
  {[
    { label: "Loan Amt Total", value: TotalLoanAmount },

    { label: "LGL  Amt", value: LGLCombinedTotal.toLocaleString() },
    { label: "MGL  Amt", value: MGLCombinedTotal.toLocaleString() },
    { label: "HGL Amt", value: HGLCombinedTotal.toLocaleString() },
    {label: "HGL-SPCL Amt",value:HGLSPCLCombinedTotal.toLocaleString()}
  ].map(({ label, value }, index) => (
    <Box
      key={index}
      display="flex"
      justifyContent="center"
      alignItems="center"
      className="typo_box"
      sx={{
        backgroundColor: "#63982C",
        color: "white",
        borderRadius: "7px",
        fontWeight: 800,
        width: "290px",
        padding: "4px",
        boxShadow: 1,
        mr: index < 5 ? 7 : 0, 
      }}
    >
      <Typography className="typo_total" sx={{ fontWeight: "600" }}>
        {label}: {value}
      </Typography>
    </Box>
  ))}
</Box>




      <Dialog
        open={openAddLoanDialog}
        onClose={handleCloseAddLoanDialog}
        fullWidth
        maxWidth="xl"
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "8px",
            position: "relative",
            overflow: "visible",
          },
        }}
      >
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleCloseAddLoanDialog}
          aria-label="close"
          sx={{
            position: "absolute",
            top: -17,
            right: -2,
            backgroundColor: "#D32521",
            color: "white",
            "&:hover": {
              backgroundColor: "#D32521",
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent>
          <AddLoan
            customerId={selectedCustomerId}
            onClose={handleCloseAddLoanDialog}
          />
        </DialogContent>
      </Dialog>

      {isDialogOpen && (
        <CustomerDialog
          open={isDialogOpen}
          onClose={() => dispatch(closeDialog())}
          entry={selectedEntry}
          paymentEntries={paymentEntries}
          customerId={selectedEntry?.customerId}
          loanNumber={selectedEntry?.loanNumber}
        />
      )}
    </Paper>
  );
};

export default Customer;
