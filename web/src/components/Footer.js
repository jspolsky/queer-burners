import React from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";

export const Footer = (props) => {
  return (
    <Container
      fluid
      className="p-3 p-md-4 qb-footer"
      style={{ marginTop: "2rem" }}
    >
      <Row>
        <Col>
          <p>
            A project of Queerburners: an online community of LGBTQIA+ burners
            from around the world. We are grateful to{" "}
            <a href="https://duncan.co">Duncan Rawlinson</a> (CC BY-NC 3.0) and
            Wink Maltman for the
            header images, and many burners and friends throughout the years for their
            contributions to this site.
          </p>
          <ul>
            <li>
              <Link to="/FAQ">FAQ</Link>
            </li>
            <li>
              <Link to="/Privacy">Privacy Policy</Link>
            </li>

            <li>
              <a href="mailto:info@queerburners.com">info@queerburners.com</a>
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default Footer;
