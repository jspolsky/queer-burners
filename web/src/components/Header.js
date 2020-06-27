import React from "react";
import banner from "../assets/header.jpg";
import { Authenticate } from "./Authenticate.js";

import { Link } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { LinkContainer } from "react-router-bootstrap";

class Header extends React.Component {
  render() {
    // TODO the navbar styles are a little strange. Past Years dropdown highlighting for example
    return (
      <div>
        <Navbar collapseOnSelect expand="md" bg="dark" variant="dark">
          <Navbar.Brand href="http://queerburners.com/">
            Queer Burners
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
              <LinkContainer to="/">
                <Nav.Link>Directory</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/submit">
                <Nav.Link>Submit</Nav.Link>
              </LinkContainer>
              <NavDropdown title="Other Years" id="collasible-nav-dropdown">
                <LinkContainer to="/year/2019">
                  <NavDropdown.Item>2019 Metamorphoses</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/year/2020">
                  <NavDropdown.Item>2020 The Multiverse</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/year/2021">
                  <NavDropdown.Item>2021</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            </Nav>
            <Nav>
              <Authenticate
                userData={this.props.userData}
                OnUserDataChange={this.props.OnUserDataChange}
              />
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Link to="/">
          <img
            className="img-fluid w-100"
            src={banner}
            alt="Queer Burners"
            style={{ marginBottom: "2rem" }}
          />
        </Link>
      </div>
    );
  }
}

export default Header;
