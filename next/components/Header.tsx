import React, { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import banner0 from "../assets/banner0.jpg";
import banner1 from "../assets/banner1.jpg";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";
import banner4 from "../assets/banner4.jpg";
import banner5 from "../assets/banner5.jpg";
import banner6 from "../assets/banner6.jpg";
import banner7 from "../assets/banner7.jpg";
import banner8 from "../assets/banner8.jpg";
import banner9 from "../assets/banner9.jpg";
import { Authenticate } from "./Authenticate.js";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Carousel from "react-bootstrap/Carousel";
import UserContext from "./UserContext";

const HEADER_IMAGES = [
  banner0,
  banner1,
  banner2,
  banner3,
  banner4,
  banner5,
  banner6,
  banner7,
  banner8,
  banner9,
];

export const HeaderImage = () => {
  return (
    <Carousel controls={false} fade={true} interval={8000}>
      {HEADER_IMAGES.map((src, index) => (
        <Carousel.Item key={index} style={{ marginBottom: "2rem" }}>
          <Image className="img-fluid w-100" src={src} alt="Queerburners" />
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export const Header = () => {
  const { userData, setUserData } = useContext(UserContext);

  return (
    <>
      <Navbar
        collapseOnSelect
        expand="md"
        bg="dark"
        variant="dark"
        sticky="top"
      >
        <Navbar.Brand href="https://queerburners.org">
          Queerburners
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Link href="/directory">
              <Nav.Link>Camp&nbsp;Directory</Nav.Link>
            </Link>
            <Link href="/go-to-burning-man">
              <Nav.Link>Going&nbsp;to&nbsp;Burning&nbsp;Man</Nav.Link>
            </Link>
            <Link href="/events">
              <Nav.Link>Events</Nav.Link>
            </Link>
            <Link href="/calendar">
              <Nav.Link>Calendar</Nav.Link>
            </Link>
            <a className="nav-link" href="https://blog.queerburners.com/">
              Blog
            </a>
            <NavDropdown title="History" id="collasible-nav-dropdown">
              <Link href="/history">
                <NavDropdown.Item>
                  Queer Burner History at Black Rock City
                </NavDropdown.Item>
              </Link>
              <Link href="/year/2021">
                <NavDropdown.Item>2021 The Great Unknown</NavDropdown.Item>
              </Link>
              <Link href="/history/2020">
                <NavDropdown.Item>2020 The Multiverse</NavDropdown.Item>
              </Link>
              <Link href="/year/2019">
                <NavDropdown.Item>2019 Metamorphoses</NavDropdown.Item>
              </Link>
              <Link href="/history/2018">
                <NavDropdown.Item>2018 iRobot</NavDropdown.Item>
              </Link>
              <Link href="/history/2017">
                <NavDropdown.Item>2017 Radical Ritual</NavDropdown.Item>
              </Link>
              <Link href="/history/2016">
                <NavDropdown.Item>2016 da Vinci's Workshop</NavDropdown.Item>
              </Link>
              <Link href="/history/2015">
                <NavDropdown.Item>2015 Carnival of Mirrors</NavDropdown.Item>
              </Link>
              <Link href="/history/2014">
                <NavDropdown.Item>2014 Caravansary</NavDropdown.Item>
              </Link>
              <Link href="/history/2013">
                <NavDropdown.Item>2013 Cargo Cult</NavDropdown.Item>
              </Link>
              <Link href="/history/2012">
                <NavDropdown.Item>2012 Fertility 2.0</NavDropdown.Item>
              </Link>
            </NavDropdown>
          </Nav>
          <Nav>
            {typeof window !== "undefined" ? (
              <Authenticate
                userData={userData}
                OnUserDataChange={setUserData}
              />
            ) : null}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Link href="/">
        <HeaderImage />
      </Link>
    </>
  );
};

export default Header;
