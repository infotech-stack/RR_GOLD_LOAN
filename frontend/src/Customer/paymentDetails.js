// src/components/paymentDetails.js
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Paper } from '@mui/material';

const PaymentDetails = ({ paymentEntries }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ border: '1px solid black' }}>
        <TableHead sx={{ backgroundColor: "#E2E2E2" }}>
          <TableRow>
            {[
              "Date",
              "Loan No",
              "Customer ID",
              "No of Days",
              "Principal Paid",
              "Interest Paid",
              "Total Balance",
              "Balance Principal",
            
            ].map((header, index) => (
              <TableCell
                key={index}
                sx={{
                  border: '1px solid black',
                  color: '#2b2a2a',
                  fontWeight: 550,
                  padding: '10px', // Reduced padding
                  textAlign: 'center' // Centered text
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paymentEntries.length > 0 ? (
            paymentEntries.map((entry, index) => (
              <TableRow key={index}>
                <TableCell sx={{ border: '1px solid black', textAlign: 'center' }}>{entry.paymentDate}</TableCell>
                <TableCell sx={{ border: '1px solid black', textAlign: 'center' }}>{entry.loanNo}</TableCell>
                <TableCell sx={{ border: '1px solid black', textAlign: 'center' }}>{entry.customerId}</TableCell>
                <TableCell sx={{ border: '1px solid black', textAlign: 'center' }}>{entry.noOfDays}</TableCell>
                <TableCell sx={{ border: '1px solid black', textAlign: 'center' }}>{entry.interestamount}</TableCell>
                <TableCell sx={{ border: '1px solid black', textAlign: 'center' }}>{entry.interestPrinciple}</TableCell>
                <TableCell sx={{ border: '1px solid black', textAlign: 'center' }}>{entry.balance}</TableCell>
                <TableCell sx={{ border: '1px solid black', textAlign: 'center' }}>{entry.loanamountbalance}</TableCell>

              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} sx={{ textAlign: 'center', border: '1px solid black', padding: '10px' }}>
                No entries available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PaymentDetails;
