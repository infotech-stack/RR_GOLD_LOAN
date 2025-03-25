import React, { useState } from 'react';
import { Button, TextField, Box, Paper, Typography } from '@mui/material';
import Swal from 'sweetalert2';

const AddAdminPage = () => {
  const [newAdminId, setNewAdminId] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [loginAdminId, setLoginAdminId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errors, setErrors] = useState({ adminId: '', password: '' });

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/rootadmin/registers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rootAdminId: newAdminId,
            password: newAdminPassword
          })
        });
  
        const data = await response.json();
  
        if (response.ok) {
          Swal.fire('Success', data.message, 'success');
          // Clear form fields
          setNewAdminId('');
          setNewAdminPassword('');
        } else {
          Swal.fire('Error', data.message || 'Failed to create or update root admin.', 'error');
        }
      } catch (error) {
        console.error('Error creating root admin:', error);
        Swal.fire('Error', 'An error occurred while creating or updating root admin.', 'error');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/rootadmin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rootAdminId: loginAdminId,
          password: loginPassword
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Swal.fire('Success', data.message, 'success');
        // Handle successful login (e.g., store the token or redirect)
      } else {
        Swal.fire('Error', data.message || 'Failed to login.', 'error');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Swal.fire('Error', 'An error occurred while logging in.', 'error');
    }
  };

  const validateForm = () => {
    let formIsValid = true;
    let errors = { adminId: '', password: '' };

    if (!newAdminId) {
      formIsValid = false;
      errors.adminId = 'Admin ID is required';
    }

    if (!newAdminPassword) {
      formIsValid = false;
      errors.password = 'Password is required';
    } else if (newAdminPassword.length < 6) {
      formIsValid = false;
      errors.password = 'Password must be at least 6 characters long';
    }

    setErrors(errors);
    return formIsValid;
  };

  return (
  
    <Paper sx={{ padding: 4, maxWidth: 500, width: '100%', boxShadow: 3, margin: 'auto', mt: 20 }} className="paperbg">
    <Typography variant="h6" gutterBottom sx={{ color: '#373A8F', fontWeight: '550', textAlign: 'center',mb:2 }}>
      CHANGE ROOTADMIN PASSWORD
    </Typography>
    <form onSubmit={handleCreateAdmin}>
      {/* Bootstrap Admin ID Input */}
      <div className="mb-3">
        <label htmlFor="newAdminId" className="form-label " style={{fontWeight:"550"}}>Admin ID</label>
        <input
          type="text"
          className={`form-control ${errors.adminId ? 'is-invalid' : ''}`}
          id="newAdminId"
            placeholder="Enter Admin ID"
          value={newAdminId}
          onChange={(e) => setNewAdminId(e.target.value)}
        />
        {errors.adminId && <div className="invalid-feedback">{errors.adminId}</div>}
      </div>
  
      {/* Bootstrap Password Input */}
      <div className="mb-3">
        <label htmlFor="newAdminPassword" className="form-label" style={{fontWeight:"550"}}>Password</label>
        <input
          type="password"
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          id="newAdminPassword"
          placeholder="Enter Password"
          value={newAdminPassword}
          onChange={(e) => setNewAdminPassword(e.target.value)}
        />
        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
      </div>
  
      {/* Submit Button */}
      <Box sx={{ mt: 2 }} align="center">
        <Button type="submit" variant="contained" color="primary" className="sub-green">
          Submit
        </Button>
      </Box>
    </form>
  </Paper>
  
   
  );
};

export default AddAdminPage;
