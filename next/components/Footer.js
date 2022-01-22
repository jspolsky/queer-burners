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
            We are grateful to <a href="https://duncan.co">Duncan Rawlinson</a>{" "}
            (CC BY-NC 3.0) and Wink Maltman for the header images, and many
            burners and friends throughout the years for their contributions to
            this site.
          </p>
          <ul>
            <li>
              <Link to="/FAQ">FAQ</Link>
            </li>
            <li>
              <Link to="/Privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/501c3">About</Link>
            </li>

            <li>
              <a href="mailto:info@queerburners.org">info@queerburners.org</a>
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
};

export default Footer;
