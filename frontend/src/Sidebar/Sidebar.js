import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, faCogs, faUser, faMoneyBillWave, 
  faRedo, faBook, faBell, faTools, faCoins, 
  faChartBar, faReceipt, faUserShield, faKey, faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Add useNavigate
import { useAuth } from '../AuthContext';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Swal from 'sweetalert2';
import './Sidebar.css';
import profileImage from "./usericon.png";
import logo from '../Home/RR Gold Finance Full Logo.jpeg';

const Sidebar = ({ isOpen, handleClose  }) => {
  const { permissions, logout, adminId  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate(); // Use useNavigate for programmatic navigation

  const [subMenuOpen, setSubMenuOpen] = useState({});

  const toggleSubMenu = (menu) => {
    setSubMenuOpen((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleItemClick = (item) => {
    if (item.submodules) {
      // If the item has submodules, toggle the submenu
      toggleSubMenu(item.path);
    }
    // Navigate to the item's path regardless of whether it has submodules
    navigate(item.path);
    if (typeof handleClose === "function" && window.innerWidth < 992) {
      handleClose();
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to log out!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/');//new_root
      }
    });
  };
  const navItems = [
    { path: '/dashboard', icon: faHome, label: 'Dashboard', permission: 'Dashboard' },
    { 
      path: '/master', icon: faCogs, label: 'Ledger Entry', permission: 'Ledger Entry', 
      submodules: [
        { path: '/master/loan', icon: faCoins, label: 'Gold Loan Schema', permission: 'Ledger Entry' },
      ]
    },
    { path: '/customer', icon: faUser, label:'Customer Management', permission: 'Customer Management' },
    { path: '/branch', icon: faMoneyBillWave, label:'Branch Management', permission: 'Branch Management' },
    { path: '/voucher', icon: faReceipt, label: 'Voucher', permission: 'Voucher' },
    { path: '/repledge', icon: faRedo, label: 'Repledge', permission: 'Repledge' },
    { 
      path: '/expenses', icon: faBook, label: 'Expenses', permission: 'Expenses',
      submodules: [
        { path: '/expenses/salary-payment', icon: faMoneyBillWave, label: 'Salary Payment', permission: 'Expenses' },
      ] 
    },
    { path: '/reminders', icon: faBell, label: 'Day Book', permission: 'Day Book' },
    { path: '/tools', icon: faTools, label: 'MD Voucher', permission: 'MD Voucher' },
    { path: '/books', icon: faBook, label: 'Bill Book', permission: 'Bill Book' },
    { path: '/added_admin', icon: faUserShield, label: 'Added Admin', permission: 'Added Admin' },
    { path: '/new_root', icon: faKey, label: 'RootAdmin Password', permission: 'Added Root' },
    { path:'/cust_dashboard', icon: faHome, label:'Customer Dashboard', permission:'cust_dashboard' },
  ];

  return (
    <Nav className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar-logo">
        <img src={logo} alt="Logo" className="logo" />
      </div>

      {/* User Profile Section */}
      <div className="user-profile">
        <img src={profileImage} alt="User Profile" className="profile-pic" />
        <div className="user-info">
          <div className="user-name">RR Gold Finance</div>
          <div className="user-role">{adminId}</div>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="nav-items-container mt-1">
        {navItems.map(item => {
          if (!permissions.includes(item.permission)) return null;

          const isActive = location.pathname.startsWith(item.path);
          const isSubMenuOpen = subMenuOpen[item.path];

          return (
            <React.Fragment key={item.path}>
              <div 
                className={`nav-link ${isActive ? 'active' : ''} ${isSubMenuOpen ? 'submenu-open' : ''}`} 
                onClick={() => handleItemClick(item)} // Use handleItemClick
              >
                <FontAwesomeIcon icon={item.icon} className="icon" /> {item.label}
                {item.submodules && (
                  <span className="dropdown-icon">
                    {isSubMenuOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                  </span>
                )}
              </div>
              {item.submodules && isSubMenuOpen && (
                <Nav className="sub-menu open">
                  {item.submodules.map(sub => (
                    <Link key={sub.path} to={sub.path} className={`sub-link ${location.pathname.startsWith(sub.path) ? 'active' : ''}`}>
                      <FontAwesomeIcon icon={sub.icon} className="sub-icon" /> {sub.label}
                    </Link>
                  ))}
                </Nav>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Logout Section */}
      <div className="logout-section">
        <Link className="logout-link" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" /> Logout
        </Link>
      </div>
    </Nav>
  );
};

export default Sidebar;