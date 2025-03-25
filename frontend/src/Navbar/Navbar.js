import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import logo from '../Navbar/RR Gold Loan Logo.jpeg';
import './Navbar.css';

const AppNavbar = ({ handleShowSidebar }) => {
  return (
    <Navbar className='nav_bar d-lg-none' expand="lg" fixed="top">
      <Container fluid className="d-flex align-items-center justify-content-between">
        <Nav className="d-flex align-items-center">
          <Nav.Link onClick={handleShowSidebar} className="menu-icon d-flex align-items-center">
            <FontAwesomeIcon icon={faBars} />
          </Nav.Link>
        </Nav>
        <Navbar.Brand>
          <img
            src={logo}
            alt="Logo"
            className="logo"
            style={{ height: '30px', width: '60px' }}
          />
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;