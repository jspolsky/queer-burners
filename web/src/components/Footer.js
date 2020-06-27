import React from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Link } from "react-router-dom";

export const Footer = (props) => {
  return (
    <Container fluid className="p-3 p-md-4 qb-footer">
      <Row>
        <Col>
          <p>
            A project of Queer Burners: an online community of LGBTQ+ burners
            from around the world.
          </p>
          <ul>
            <li>
              <a href="http://queerburners.com/history">History</a>
            </li>
            <li>
              <a href="http://queerburners.com/go-to-burning-man">
                Going to Burning Man
              </a>
            </li>

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
