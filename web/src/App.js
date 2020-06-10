import React from "react";
import logo from "./assets/header_logo.jpg";

import SubmitBody from "./components/SubmitBody.js";
import DirectoryBody from "./components/DirectoryBody.js";
import PrivacyBody from "./components/PrivacyBody.js";

import { Link } from "react-router-dom";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Image from "react-bootstrap/Image";

import "./App.css";

const noUser = {
  loggedin: false,
  username: "",
  user_image: null,
  googleId: null,
  tokenId: null,
};

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = noUser;
  }

  googleLoginSuccess = (response) => {
    console.log("Google Login Success");
    console.log(response);
    const newState = {
      loggedin: true,
      username: response.profileObj.name,
      user_image: response.profileObj.imageUrl,
      googleId: response.profileObj.googleId,
      tokenId: response.tokenId,
    };
    this.setState(newState);
    this.props.onUserChange(newState);
    // TODO this ^^ is making errors on fresh loads
    // the prop must not be set or something, or it is not set yet
  };

  googleLoginFailure = (response) => {
    console.log("Google Login Failure");
    console.log(response);
    this.setState(noUser);
    this.props.onUserChange(noUser);
  };

  googleLogout = () => {
    console.log("Google logout");
    this.setState(noUser);
    this.props.onUserChange(noUser);
  };

  render() {
    return (
      <div>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="http://queerburners.com/">
            Queer Burners
          </Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="/">Directory</Nav.Link>
            <Nav.Link href="/submit">Submit</Nav.Link>
            <NavDropdown title="Past Years" id="collasible-nav-dropdown">
              <NavDropdown.Item href="/year/2019">
                2019 Metamorphoses
              </NavDropdown.Item>
              <NavDropdown.Item href="/year/2020">
                2020 The Multiverse
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          {!this.state.loggedin && (
            <GoogleLogin
              clientId="1091094241484-ve5hbpa496m6d1k21m8r5ni16kvrkifi.apps.googleusercontent.com"
              buttonText="Login"
              onSuccess={this.googleLoginSuccess}
              onFailure={this.googleLoginFailure}
              cookiePolicy={"single_host_origin"}
              isSignedIn={true}
            />
          )}
          {this.state.loggedin && (
            <Nav>
              <Image
                roundedCircle
                src={this.state.user_image}
                style={{ maxHeight: "2rem" }}
              ></Image>
              <NavDropdown title={this.state.username}>
                <NavDropdown.Item>
                  <GoogleLogout
                    clientId="1091094241484-ve5hbpa496m6d1k21m8r5ni16kvrkifi.apps.googleusercontent.com"
                    buttonText="Logout"
                    onLogoutSuccess={this.googleLogout}
                  />
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          )}
        </Navbar>
        <Link to="/">
          <img className="img-fluid w-100" src={logo} alt="placeholder 960" />
        </Link>
      </div>
    );
  }
}

export function Year(props) {
  return <Directory year={props.match.params.year} />;
}

export function Directory(props) {
  return (
    <div className="App">
      <Header />
      <DirectoryBody year={props.year} />
    </div>
  );
}

export class Submit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  userChange = (newUserState) => {
    this.setState(newUserState);
  };

  render() {
    return (
      <div className="App">
        <Header onUserChange={(x) => this.userChange(x)} />
        <SubmitBody
          loggedin={this.state.loggedin}
          tokenId={this.state.tokenId}
        />
      </div>
    );
  }
}

export function PrivacyPolicy() {
  return (
    <div className="App">
      <Header />
      <PrivacyBody />
    </div>
  );
}
