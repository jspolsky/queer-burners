import React from "react";
import logo from "../assets/header_logo.jpg";

import { Link } from "react-router-dom";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Image from "react-bootstrap/Image";

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

  googleLoginSuccess = (response) => {
    console.log("Google Login Success");
    const newState = {
      loggedin: true,
      username: response.profileObj.name,
      user_image: response.profileObj.imageUrl,
      googleId: response.profileObj.googleId,
      tokenId: response.tokenId,
      hashEmail: require("shared").hashEmail(response.profileObj.email),
    };
    this.setState(newState);
    this.props.onUserChange && this.props.onUserChange(newState);
  };

  googleLoginFailure = (response) => {
    console.log("Google Login Failure");
    this.setState(noUser);
    this.props.onUserChange && this.props.onUserChange(noUser);
  };

  googleLogout = () => {
    console.log("Google logout");
    this.setState(noUser);
    this.props.onUserChange && this.props.onUserChange(noUser);
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

export default Header;