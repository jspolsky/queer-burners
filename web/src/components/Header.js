import React from "react";
import logo from "../assets/header_logo.jpg";

import { Link } from "react-router-dom";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Image from "react-bootstrap/Image";

import { api } from "../definitions.js";

import axios from "axios";

const noUser = {
  loggedin: false,
  username: "",
  user_image: null,
  googleId: null,
  tokenId: null,
  hashEmail: "",
};

class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = noUser;
  }

  googleLoginSuccess = async (response) => {
    let isadmin = false;
    try {
      const adminRes = await axios.get(`${api}/isadmin`, {
        auth: { username: response.tokenId, password: "" },
      });
      if (adminRes.data) isadmin = true;
    } catch (error) {
      console.log(error);
    }

    const newState = {
      loggedin: true,
      username: response.profileObj.name,
      email: response.profileObj.email,
      user_image: response.profileObj.imageUrl,
      googleId: response.profileObj.googleId,
      tokenId: response.tokenId,
      hashEmail: require("shared").hashEmail(response.profileObj.email),
      isadmin: isadmin,
    };
    this.setState(newState);
    this.props.onUserChange && this.props.onUserChange(newState);
  };

  googleLoginFailure = (response) => {
    this.setState(noUser);
    this.props.onUserChange && this.props.onUserChange(noUser);
  };

  googleLogout = () => {
    this.setState(noUser);
    this.props.onUserChange && this.props.onUserChange(noUser);
  };

  googleAutoloadFinished = () => {
    this.props.onUserChange && this.props.onUserChange(noUser);
  };

  render() {
    return (
      <div>
        <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
          <Navbar.Brand href="http://queerburners.com/">
            Queer Burners
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
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
                onAutoLoadFinished={this.googleAutoloadFinished}
              />
            )}
            {this.state.loggedin && (
              <Nav>
                <Image
                  roundedCircle
                  src={this.state.user_image}
                  className="GoogleUserPicture"
                ></Image>
                <NavDropdown alignRight title={this.state.username}>
                  <NavDropdown.Item>
                    Logged on as {this.state.email}
                  </NavDropdown.Item>
                  <NavDropdown.Item>
                    <GoogleLogout
                      clientId="1091094241484-ve5hbpa496m6d1k21m8r5ni16kvrkifi.apps.googleusercontent.com"
                      buttonText="Logout"
                      onLogoutSuccess={this.googleLogout}
                    />
                  </NavDropdown.Item>
                  {this.state.loggedin && this.state.isadmin && (
                    <NavDropdown.Item>(admin)</NavDropdown.Item>
                  )}
                </NavDropdown>
              </Nav>
            )}
          </Navbar.Collapse>
        </Navbar>
        <Link to="/">
          <img
            className="img-fluid w-100"
            src={logo}
            alt="placeholder 960"
            style={{ marginBottom: "2rem" }}
          />
        </Link>
      </div>
    );
  }
}

export default Header;
