import React from "react";
import logo from "./assets/header_logo.jpg";

import SubmitBody from "./components/SubmitBody.js";
import DirectoryBody from "./components/DirectoryBody.js";
import PrivacyBody from "./components/PrivacyBody.js";

import { Link } from "react-router-dom";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import Container from "react-bootstrap/Container";

import "./App.css";

const Header = () => (
  <Link to="/">
    <img className="img-fluid w-100" src={logo} alt="placeholder 960" />
  </Link>
);

const googleLoginSuccess = (response) => {
  console.log("Google Login Success");
  console.log(response);
};

const googleLoginFailure = (response) => {
  console.log("Google Login Failure");
  console.log(response);
};

const googleLogout = () => {
  console.log("Google logout");
};

export function Directory(props) {
  return (
    <div className="App">
      <Header />
      <DirectoryBody year={props.year} />
      <Container>
        <GoogleLogin
          clientId="1091094241484-ve5hbpa496m6d1k21m8r5ni16kvrkifi.apps.googleusercontent.com"
          buttonText="Login"
          onSuccess={googleLoginSuccess}
          onFailure={googleLoginFailure}
          cookiePolicy={"single_host_origin"}
          isSignedIn={true}
        />
        <GoogleLogout
          clientId="1091094241484-ve5hbpa496m6d1k21m8r5ni16kvrkifi.apps.googleusercontent.com"
          buttonText="Logout"
          onSuccess={googleLogout}
        />
      </Container>
    </div>
  );
}

export function Submit() {
  return (
    <div className="App">
      <Header />
      <SubmitBody />
    </div>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="App">
      <Header />
      <PrivacyBody />
    </div>
  );
}
