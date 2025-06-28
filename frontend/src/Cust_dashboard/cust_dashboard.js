import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./cust_dashboard.css";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DiamondIcon from '@mui/icons-material/Diamond';


import {
  fetchCustomerDetails,
  fetchPaymentEntries,
} from "../actions/customerActions";
import {
  makeSelectCustomerDetails,
  makeSelectPaymentEntries,
} from "../selectors/customerSelectors";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import logo from "../Navbar/RR Gold Loan Logo.jpeg";

function CustomerDashboard() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const dispatch = useDispatch();
  const customerId = location.state?.customerId;
  const selectCustomerDetails = makeSelectCustomerDetails();
  const customerDetails = useSelector(selectCustomerDetails);
  const paymentEntries = useSelector(makeSelectPaymentEntries());
  const [openProof, setOpenProof] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [selectedLoanNumber, setSelectedLoanNumber] = useState(null);
  // Define loanNumber, assuming it's part of customerDetails
  const loanNumber = customerDetails?.loanNumber; // Adjust according to your data structure

  const handleClickOpenProof = (customer) => {
    setCurrentCustomer(customer);
    setOpenProof(true);
  };

  const handleClickCloseProof = () => setOpenProof(false);

  const handleClickOpenPayment = (loanNumber) => {
    console.log("Clicked loanNumber:", loanNumber); // Logs the correct loan number when clicked
    setSelectedLoanNumber(loanNumber);
    setOpenPayment(true);
  };

  const handleClickClosePayment = () => {
    setOpenPayment(false);
    setSelectedLoanNumber(null); // Reset the selected loan number when the dialog is closed
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  // const loanNumber = customerDetails?.loanNumber;

  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerDetails(customerId));
    }
  }, [dispatch, customerId]);
  useEffect(() => {
    if (selectedLoanNumber) {
      dispatch(fetchPaymentEntries(selectedLoanNumber));
    }
  }, [selectedLoanNumber, dispatch]);
  
  // Filter payment entries to match the selected loan number
  const filteredPaymentEntries = paymentEntries.filter(
    (entry) => entry.loanNo === selectedLoanNumber
  );

  useEffect(() => {
    if (Array.isArray(customerDetails) && customerDetails.length > 0) {
      const loanNumber = customerDetails[0]?.loanNumber;
      if (loanNumber) {
        setSelectedLoanNumber(loanNumber); // Set the selected loan number
        dispatch(fetchPaymentEntries(loanNumber));
        console.log("selectedloannumber:", selectedLoanNumber);
      }
    }
  }, [customerDetails, dispatch]);
 
  if (!Array.isArray(customerDetails) || customerDetails.length === 0) {
    return ;
  }

  const numberOfLoanEntries = customerDetails.length;
  const formattedDate = time.toLocaleDateString();
  const formattedDay = time.toLocaleDateString("en-US", { weekday: "long" });
  const formatJewelDetails = (jewelList) => {
    if (Array.isArray(jewelList) && jewelList.length > 0) {
      return jewelList.map((jewel, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <div><strong>Quality:</strong> {jewel.quality || 'N/A'}</div>
          <div><strong>Quantity:</strong> {jewel.quantity || 'N/A'}</div>
          <div><strong>Item Weight:</strong> {jewel.iw || 'N/A'}</div>
          <div><strong>Jewel Details:</strong> {jewel.jDetails || 'N/A'}</div>
          <hr />
        </div>
      ));
    } else {
      return <div>No jewel details available</div>;
    }
  };

  const itemWeight = customerDetails?.jewelList?.length > 0 ? customerDetails.jewelList[0].iw : 'N/A';
  
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <img src={logo} alt="Logo" className="dashboard-logo" />
          <div className="header-text">
            <h1 className="dashboard-title">RR Gold Finance</h1>
          </div>
          <div className="header-time">
            <div className="time-display">
              <span className="time">{time.toLocaleTimeString()}</span>
              <span className="date">{formattedDate}, {formattedDay}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
          <PeopleIcon fontSize="large"/>
          </div>
          <div className="stat-content">
            <span className="stat-value">{numberOfLoanEntries}</span>
            <span className="stat-label">Active Loans</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
          <AttachMoneyIcon fontSize="large"/>
          </div>
          <div className="stat-content">
            <span className="stat-value">
              ₹{customerDetails.reduce((sum, customer) => {
                // Convert to number first, then add
                const amount = Number(customer.loanAmount) || 0;
                return sum + amount;
              }, 0).toLocaleString('en-IN')}
            </span>
            <span className="stat-label">Total Loan Amount</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
          <DiamondIcon fontSize="large"/>  
          </div>
          <div className="stat-content">
            <span className="stat-value">
              {customerDetails.reduce((sum, customer) => sum + (customer.gw || 0), 0)}g
            </span>
            <span className="stat-label">Total Gold Weight</span>
          </div>
        </div>
      </section>

      {/* Customer Loans Section */}
      <main className="customer-loans">
        {customerDetails.map((customer, index) => (
          <div className="loan-card" key={index}>
            <div className="loan-card-header">
              <h3 className="loan-title">Loan No - {customer.loanNumber}</h3>
              <span className={`loan-status ${customer.loanamountbalance === '0' || customer.loanamountbalance === 0 ? 'Closed' : 'Active'}`}>
                {customer.loanamountbalance === '0' || customer.loanamountbalance === 0 ? 'Closed' : 'Active'}
              </span>
            </div>
            
            <div className="loan-card-body">
              <div className="customer-info">
                <div className="info-group">
                  <span className="info-label">Customer ID</span>
                  <span className="info-value">{customer.customerId}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Customer Name</span>
                  <span className="info-value">{customer.customerName}</span>
                </div>
                <div className="info-group">
                  <span className="info-label">Due Date</span>
                  <span className="info-value highlight">
                    {new Date(customer.lastDateForLoan).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="loan-details">
                <div className="detail-card">
                  <h4 className="detail-title">Loan Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Amount</span>
                      <span className="detail-value">₹{customer.loanAmount}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Interest Rate</span>
                      <span className="detail-value">{customer.interest}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Gross Weight</span>
                      <span className="detail-value">{customer.gw}g</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Net Weight</span>
                      <span className="detail-value">{customer.nw}g</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Scheme</span>
                      <span className="detail-value">{customer.schema}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Percent</span>
                      <span className="detail-value">{customer.percent}</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-card">
                  <h4 className="detail-title">Contact Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">Mobile 1</span>
                      <span className="detail-value">{customer.mobileNumber1}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Mobile 2</span>
                      <span className="detail-value">{customer.mobileNumber2}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Landmark</span>
                      <span className="detail-value">{customer.landmark}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Address</span>
                      <span className="detail-value">{customer.address}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="jewelry-section">
                <h4 className="section-title">Jewelry Details</h4>
                <div className="jewelry-grid">
                  {customer.jewelList.map((jewel, idx) => (
                    <div className="jewelry-card" key={idx}>
                      <div className="jewelry-header">
                        <span className="jewelry-id">Item {idx + 1}</span>
                        <span className="jewelry-purity">{jewel.quality}</span>
                      </div>
                      <div className="jewelry-details">
                        <div className="jewelry-detail">
                          <span>Quantity:</span>
                          <span>{jewel.quantity}</span>
                        </div>
                        <div className="jewelry-detail">
                          <span>Weight:</span>
                          <span>{jewel.iw}g</span>
                        </div>
                        <div className="jewelry-detail full-width">
                          <span>Description:</span>
                          <span>{jewel.jDetails}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="loan-card-footer">
              <button 
                className="btn-payment"
                onClick={() => handleClickOpenPayment(customer.loanNumber)}
              >
                <i className="bi bi-cash-coin"></i> View Payments
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Payment Details Modal */}
      {openPayment && (
        <div className="modal-overlay">
          <div className="modal-container">
          <div className="modal-header">
        <Typography variant="h5" component="h3" sx={{ flexGrow: 1, pl: 2 }}>
          Payment History
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClickClosePayment}
          sx={{
            color: 'white',
            mr: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </div>
            <div className="modal-content">
              {filteredPaymentEntries.length > 0 ? (
                <div className="payment-table-container">
                  <div className="payment-table">
                    <div className="table-header">
                      <div className="header-cell">Date</div>
                      <div className="header-cell">Loan No</div>
                      <div className="header-cell">Days</div>
                      <div className="header-cell">Principal</div>
                      <div className="header-cell">Interest</div>
                      <div className="header-cell">Total</div>
                    </div>
                    <div className="table-body">
                      {filteredPaymentEntries.map((entry) => (
                        <div className="table-row" key={entry._id}>
                        <div className="table-cell" data-label="Date">{entry.paymentDate}</div>
                        <div className="table-cell" data-label="Loan No">{entry.loanNo}</div>
                        <div className="table-cell" data-label="Days">{entry.noOfDays}</div>
                        <div className="table-cell" data-label="Principal">₹{entry.interestPrinciple}</div>
                        <div className="table-cell" data-label="Interest">₹{entry.interestamount}</div>
                        <div className="table-cell total" data-label="Total">
                          ₹{entry.interestPrinciple + entry.interestamount}
                        </div>
                      </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-payments">
                  <i className="bi bi-wallet2"></i>
                  <p>No payment records found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
