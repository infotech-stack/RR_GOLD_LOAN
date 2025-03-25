import React from "react";
import { Container, Grid, Button, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faUserShield } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import logo from "./RR Gold Finance Full Logo.jpeg";
import "./Home.css";

const ContentBox = styled(Box)(({ theme }) => ({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: theme.spacing(3),
}));

const InnerBox = styled(Box)(({ theme }) => ({
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "20px",
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  padding: theme.spacing(4),
  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
  width: "90%", 
  maxWidth: "850px", 
  [theme.breakpoints.up("sm")]: {
    width: "90%",
  },
  [theme.breakpoints.up("md")]: {
    width: "97%", 
  },
  [theme.breakpoints.up("lg")]: {
    width: "120%",
  },
}));

const Home = () => {
  const navigate = useNavigate();

  const goToSignup = () => {
    navigate("/signup");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="home_bg">
      <Container
        maxWidth="lg"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: { xs: 2, sm: 3, md: 4 }, // Responsive padding
        }}
      >
        <Grid container justifyContent="center" className="home-cont">
          <Grid item xs={12} sm={8} md={6} lg={5}>
            <InnerBox>
              <img
                src={logo}
                alt="Logo"
                className="logo"
                style={{ maxWidth: "97%", height: "auto" }}
              />
              <ContentBox>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={
                    <FontAwesomeIcon icon={faUserShield} className="icon" />
                  }
                  className="button1"
                  onClick={goToLogin}
                  sx={{ mb: 2, mt: 2, }} // Responsive button width
                >
                  Admin Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FontAwesomeIcon icon={faUser} className="icon" />}
                  className="button2"
                  onClick={goToSignup}
                  sx={{ mt: 1, }} // Responsive button width
                >
                  User Login
                </Button>
              </ContentBox>
            </InnerBox>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Home;