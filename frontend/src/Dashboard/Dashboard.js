import React, { useState ,useEffect} from 'react';
import { Card, Container, Row, Col, Offcanvas } from 'react-bootstrap';
import Sidebar from '../Sidebar/Sidebar';
import AppNavbar from '../Navbar/Navbar';
import { Grid, Paper, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faUsers, faMoneyBill, faCreditCard, faWallet, faClipboardList, faUserPlus, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { BalanceContext } from "../Reminders/BalanceContext";
import  { useContext} from "react";
import './Dashboard.css'
const Dashboard = () => {
  const { openingBalance, closingBalance } = useContext(BalanceContext);


  const [filteredEntries, setFilteredEntries] = useState([]);
 
  const { adminId, logout } = useAuth();

  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [expensesCount, setExpensesCount] = useState(0);
  const [loanEntriesCount, setLoanEntriesCount] = useState(0);
  const [currentMonth, setCurrentMonth] = useState('');
const[numberOfEntries,setNumberOfEntries]=useState('0');
const[numberOfEntries1,setNumberOfEntries1]=useState('0');
  const [totalRupees, setTotalRupees] = useState(0); 
  const [lglCount, setLglCount] = useState(0);
  const [mglCount, setMglCount] = useState(0);
  const [hglCount, setHglCount] = useState(0);
  const[liveCount,setLiveCount]=useState('0');
  const[closedCount,setClosedCount]=useState('0');
const [salaryamt, setSalaryAmt ] = useState(0);
  const [voucheramt, setVoucherAmt] = useState(0);
  const [appraisalamt, setAppraisalAmt ] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vouchersRes, expensesRes, loanEntriesRes, salaryRes, customerEntriesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/vouchers/all`),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/expenses`),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/loanEntry/all`),
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/salary`), // Separate salary API
          axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/ledger/all`), // Add customer entries API
        ]);
  
        // Get current month and year
        const today = new Date();
        const currentMonth = today.getMonth(); // Current month (0-11)
        const currentYear = today.getFullYear(); // Current year
  
        // 1. Calculate day-to-day expenses for the current month
        const monthlyExpenses = expensesRes.data.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });
        const totalRupeesForMonth = monthlyExpenses.reduce((total, entry) => total + (entry.totalRupees || 0), 0);
        setTotalRupees(totalRupeesForMonth);
  
        // 2. Calculate total salary for the current month
        const totalSalaryForMonth = salaryRes.data.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        }).reduce((total, entry) => total + (entry.salaryAmount || 0), 0);
        setSalaryAmt(totalSalaryForMonth);
  
        // 3. Calculate voucher amounts for the current month
        const monthlyVouchers = vouchersRes.data.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });
        const totalVouchersForMonth = monthlyVouchers.reduce((total, entry) => total + Number(entry.amount || 0), 0);
        setVoucherAmt(totalVouchersForMonth);
  
// Filter loan entries for the current month
const monthlyLoanEntries = loanEntriesRes.data.filter(entry => {
  const entryDate = new Date(entry.paymentDate);
  return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
});

// Initialize counters and totals
let liveCount = 0;
let closedCount = 0;
let totalAppraisalForMonth = 0;

// Iterate through the filtered entries
monthlyLoanEntries.forEach(entry => {
  const interestAmount = Number(entry.interestamount) || 0; // Assuming interestAmount is the correct field
  const interestPrinciple = Number(entry.interestPrinciple) || 0;

  // Add to the total appraisal
  totalAppraisalForMonth += interestAmount + interestPrinciple;

  // Check balance to determine if it's live or closed
  const lastBalance = Number(entry.balance) || 0; // Assuming balance is a property in your entries
  if (lastBalance === 0) {
    closedCount += 1; // Increment closed count
  } else {
    liveCount += 1; // Increment live count
  }
});

// Set states for display
setLiveCount(liveCount);     // Assuming you have this state
setClosedCount(closedCount); // Assuming you have this state
setAppraisalAmt(totalAppraisalForMonth); // Set the total appraisal amount

console.log("Total Number of Live Entries:", liveCount);
console.log("Total Number of Closed Entries:", closedCount);
console.log("Total Appraisal for the Month:", totalAppraisalForMonth);


  
// 5. Count total customer entries for the current month
const monthlyCustomerEntries = customerEntriesRes.data.filter(entry => {
  const entryDate = new Date(entry.date); // Ensure this is the correct date field
  return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
});

// Initialize counts for each schema
let lglCount = 0;
let mglCount = 0;
let hglCount = 0;

// Count entries based on schema
monthlyCustomerEntries.forEach(entry => {
  if (entry.schema === 'LGL') {
    lglCount++;
  } else if (entry.schema === 'MGL') {
    mglCount++;
  } else if (entry.schema === 'HGL') {
    hglCount++;
  }
});

// Set state or log the counts
setNumberOfEntries1(monthlyCustomerEntries.length);
setLglCount(lglCount); // Set the LGL count
setMglCount(mglCount); // Set the MGL count
setHglCount(hglCount); 
console.log("Total Number of Customer Entries for Current Month:", monthlyCustomerEntries.length);



      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);
  
  
  
  
  



  useEffect(() => {
    const today = new Date();
    const options = { month: 'long', year: 'numeric' };
    setCurrentMonth(today.toLocaleDateString('en-US', options)); // e.g., "September 2024"
  }, []);
  
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/ledger/all`)
      .then((response) => {
        const formattedData = response.data.reverse(); 
        setLedgerEntries(formattedData); 
        setFilteredEntries(formattedData); 
      
        const entriesCount = formattedData.length;
        setNumberOfEntries(entriesCount); // Update the state with the number of entries
      })
      .catch((error) => {
        console.error("Error fetching ledger entries:", error);
      });
  }, []);
  


  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString();
  const formattedDay = time.toLocaleDateString('en-US', { weekday: 'long' });
  
    
  return (
    <div>
     
     <Container className='dashboard-container '>
        <Row>
          <Col lg={2} className="d-none d-lg-block sidebar-wrapper">
            <Sidebar isOpen={false} />
          </Col>
          <Col lg={15} className="main-content">
          <Row className="g-3 mb-4">
  {/* Time Component */}
  <Col xs={12} md={4}>
    <Card className="text-center shadow-sm border-0" style={{ backgroundColor: '#E3F2FD' }}>
      <Card.Body>
        <Card.Title className="mb-3" style={{ color: '#0D47A1', fontWeight: '600' }}>
          Time
        </Card.Title>
        <Card.Text
          className="p-3 bg-white rounded"
          style={{
            border: '1px solid #BBDEFB',
            color: '#1565C0',
            fontWeight: '500',
          }}
        >
          {time.toLocaleTimeString()}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>

  {/* Date Component */}
  <Col xs={12} md={4}>
    <Card className="text-center shadow-sm border-0" style={{ backgroundColor: '#FFF3E0' }}>
      <Card.Body>
        <Card.Title className="mb-3" style={{ color: '#E65100', fontWeight: '600' }}>
          Date
        </Card.Title>
        <Card.Text
          className="p-3 bg-white rounded"
          style={{
            border: '1px solid #FFCC80',
            color: '#EF6C00',
            fontWeight: '500',
          }}
        >
          {formattedDate}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>

  {/* Day Component */}
  <Col xs={12} md={4}>
    <Card className="text-center shadow-sm border-0" style={{ backgroundColor: '#FBE9E7' }}>
      <Card.Body>
        <Card.Title className="mb-3" style={{ color: '#C62828', fontWeight: '600' }}>
          Day
        </Card.Title>
        <Card.Text
          className="p-3 bg-white rounded"
          style={{
            border: '1px solid #FF8A80',
            color: '#D32F2F',
            fontWeight: '500',
          }}
        >
          {formattedDay}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
</Row>
           <Row className="g-3 mb-4">
      {/* Dashboard Summary Card */}
      <Col xs={12} sm={6} md={3}>
        <Card className="text-center shadow-sm border-0 dash_card1" style={{ height: '200px' }}>
          <Card.Body className="d-flex flex-column justify-content-center">
            <FontAwesomeIcon icon={faChartBar} size="3x" className="mb-3 dashb-icon" />
            <Card.Title className="mb-2" style={{ color: '#0D47A1', fontWeight: '600' }}>
              Admin
            </Card.Title>
            <Card.Text style={{ color: '#1565C0', fontWeight: '500' }}>
              {adminId}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      {/* Customer Summary Card */}
      <Col xs={12} sm={6} md={3}>
        <Card className="text-center shadow-sm border-0 dash_card2" style={{ height: '200px' }}>
          <Card.Body className="d-flex flex-column justify-content-center">
            <FontAwesomeIcon icon={faUsers} size="3x" className="mb-3 dashb-icon3" />
            <Card.Title className="mb-2" style={{ color: '#C62828', fontWeight: '600' }}>
              Customer
            </Card.Title>
            <Card.Text style={{ color: '#D32F2F', fontWeight: '500' }}>
              {numberOfEntries}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      {/* Opening Account Summary Card */}
      <Col xs={12} sm={6} md={3}>
        <Card className="text-center shadow-sm border-0 dash_card3" style={{ height: '200px' }}>
          <Card.Body className="d-flex flex-column justify-content-center">
            <FontAwesomeIcon icon={faMoneyBill} size="3x" className="mb-3 dashb-icon1" />
            <Card.Title className="mb-2" style={{ color: '#2E7D32', fontWeight: '600' }}>
              Opening Account
            </Card.Title>
            <Card.Text style={{ color: '#388E3C', fontWeight: '500' }}>
              {openingBalance !== null ? `₹${openingBalance}` : "Loading..."}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      {/* Closing Account Summary Card */}
      <Col xs={12} sm={6} md={3}>
        <Card className="text-center shadow-sm border-0 dash_card4" style={{ height: '200px' }}>
          <Card.Body className="d-flex flex-column justify-content-center">
            <FontAwesomeIcon icon={faCreditCard} size="3x" className="mb-3 dashb-icon2" />
            <Card.Title className="mb-2" style={{ color: '#6A1B9A', fontWeight: '600' }}>
              Closing Account
            </Card.Title>
            <Card.Text style={{ color: '#7B1FA2', fontWeight: '500' }}>
              {closingBalance !== null ? `₹${closingBalance}` : "Loading..."}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
          </Col>
        </Row>
        <Container>
        <Row className="mb-4">
  <Col xs={12}>
    <div className="text-center py-3" style={{ 
      backgroundColor: 'rgba(246, 246, 255, 0.92)', 
      borderRadius: '8px', 
      border: '1px solid rgba(0, 0, 0, 0.1)', 
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)' 
    }}>
      <h5 className="mb-0" style={{ 
        color: '#373A8F', 
        fontWeight: '600', 
        fontFamily: 'Inter' 
      }}>
        {currentMonth}
      </h5>
    </div>
  </Col>
</Row>
<Row className="g-3 mb-4">
  {/* Outgoing Amount Card */}
  <Col xs={12} sm={6} md={3}>
    <Card className="text-center shadow-sm border-0 dash_card5" style={{ height: '200px' }}>
      <Card.Body className="d-flex flex-column justify-content-center">
        <div
          style={{
            backgroundColor: 'rgb(255, 250, 250)',
            borderRadius: '50%',
            padding: '10px',
            width: '60px',
            margin: 'auto',
          }}
        >
          <FontAwesomeIcon icon={faWallet} size="2x" color="#ff6f61" />
        </div>
        <Card.Title className="mt-3" style={{ color: '#ff6f61', fontWeight: '600' }}>
          Outgoing Amount
        </Card.Title>
        <Card.Text style={{ color: '#ff6f61', fontWeight: '500' }}>
          Day to Day: ₹{totalRupees}
          <br />
          Salary Payment: ₹{salaryamt}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>

  {/* Incoming Amount Card */}
  <Col xs={12} sm={6} md={3}>
    <Card className="text-center shadow-sm border-0 dash_card8" style={{ height: '200px' }}>
      <Card.Body className="d-flex flex-column justify-content-center">
        <div
          style={{
            backgroundColor: 'rgb(255, 250, 250)',
            borderRadius: '50%',
            padding: '10px',
            width: '60px',
            margin: 'auto',
          }}
        >
          <FontAwesomeIcon icon={faClipboardList} size="2x" color="#913B00" />
        </div>
        <Card.Title className="mt-3" style={{ color: '#913B00', fontWeight: '600' }}>
          Incoming Amount
        </Card.Title>
        <Card.Text style={{ color: '#913B00', fontWeight: '500' }}>
          Appraisal Payment: ₹{appraisalamt}
          <br />
          MD Voucher: ₹{voucheramt}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>

  {/* Total Customer Entry Card */}
  <Col xs={12} sm={6} md={3}>
    <Card className="text-center shadow-sm border-0 dash_card6" style={{ height: '200px' }}>
      <Card.Body className="d-flex flex-column justify-content-center">
        <div
          style={{
            backgroundColor: 'rgb(255, 250, 250)',
            borderRadius: '50%',
            padding: '10px',
            width: '60px',
            margin: 'auto',
          }}
        >
          <FontAwesomeIcon icon={faUserPlus} size="2x" color="#00796b" />
        </div>
        <Card.Title className="mt-3" style={{ color: '#00796b', fontWeight: '600' }}>
          Total Customer Entry
        </Card.Title>
        
        <Card.Text style={{ color: '#00796b', fontWeight: '500' }}>
          {numberOfEntries1} 
          <br/>
          <br/>
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>

  {/* Customer Entry Breakdown Card */}
  <Col xs={12} sm={6} md={3}>
    <Card className="text-center shadow-sm border-0 dash_card7" style={{ height: '200px' }}>
      <Card.Body className="d-flex flex-column justify-content-center">
        <div
          style={{
            backgroundColor: 'rgb(255, 250, 250)',
            borderRadius: '50%',
            padding: '10px',
            width: '60px',
            margin: 'auto',
          }}
        >
          <FontAwesomeIcon icon={faUsers} size="2x" color="#E65100" />
        </div>
        <Card.Title className="mt-3" style={{ color: '#E65100', fontWeight: '600' }}>
          Customer Entry Breakdown
        </Card.Title>
        <Card.Text style={{ color: '#E65100', fontWeight: '500' }}>
          LGL: {lglCount}, MGL: {mglCount}, HGL: {hglCount}
          <br />
          Live: {liveCount}, Closed: {closedCount}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
</Row>


    </Container>
      </Container>
    </div>
  );
};

export default Dashboard;