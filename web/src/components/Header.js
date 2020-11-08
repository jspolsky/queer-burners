import React from "react";
import banner0 from "../assets/banner0.jpg";
import banner1 from "../assets/banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";
import banner4 from "../assets/banner4.jpg";
import { Authenticate } from "./Authenticate.js";

import { Link } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import { LinkContainer } from "react-router-bootstrap";

export const HeaderImage = () => {
  const rgImages = [banner0, banner1, banner2, banner3, banner4];
  // rotate every five seconds:
  const ixImage = Math.floor(new Date() / 5000) % rgImages.length;

  console.log(ixImage);

  return (
    <img
      className="img-fluid w-100"
      src={rgImages[ixImage]}
      alt="Queer Burners"
      style={{ marginBottom: "2rem" }}
    />
  );
};

export const Header = (props) => {
  return (
    <>
      <Navbar collapseOnSelect expand="md" bg="dark" variant="dark" sticky="top">
        <Navbar.Brand href="/">Queer Burners</Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <LinkContainer to="/directory">
              <Nav.Link>Camp Directory</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/go-to-burning-man">
              <Nav.Link>Going to Burning Man</Nav.Link>
            </LinkContainer>
            <LinkContainer title="Events" to="/all-of-us-event">
              <Nav.Link>Events</Nav.Link>
            </LinkContainer>
            <NavDropdown title="History" id="collasible-nav-dropdown">
              <LinkContainer to="/history">
                <NavDropdown.Item>
                  Queer Burner History at Black Rock City
                </NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/history/2012">
                <NavDropdown.Item>2012 Fertility 2.0</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/history/2013">
                <NavDropdown.Item>2013 Cargo Cult</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/history/2014">
                <NavDropdown.Item>2014 Caravansary</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/history/2015">
                <NavDropdown.Item>2015 Carnival of Mirrors</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/history/2016">
                <NavDropdown.Item>2016 da Vinci's Workshop</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/history/2017">
                <NavDropdown.Item>2017 Radical Ritual</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/history/2018">
                <NavDropdown.Item>2018 iRobot</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/year/2019">
                <NavDropdown.Item>2019 Metamorphoses</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/history/2020">
                <NavDropdown.Item>2020 The Multiverse</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/year/2021">
                <NavDropdown.Item>2021</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
          </Nav>
          <Nav>
            <Authenticate
              userData={props.userData}
              OnUserDataChange={props.OnUserDataChange}
            />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Link to="/">
        <HeaderImage />
      </Link>
    </>
  );
};

export default Header;
