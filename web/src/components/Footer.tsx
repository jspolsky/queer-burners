import React, { VFC } from "react";

import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export const Footer: VFC = () => {
  return (
    <Container
      fluid
      className="p-3 p-md-4 qb-footer"
      style={{ marginTop: "2rem" }}
    >
      <Row>
        <Col>
          <p>
            © 2024 Queer Burners. We are grateful to{" "}
            <a href="https://duncan.co">Duncan Rawlinson</a> (CC BY-NC 3.0) and
            Wink Maltman for the header images, and many burners and friends
            throughout the years for their contributions to this site.
          </p>
          <ul>
            <li>
              <Link href="/FAQ">
                <a>FAQ</a>
              </Link>
            </li>
            <li>
              <Link href="/Privacy">
                <a>Privacy Policy</a>
              </Link>
            </li>
            <li>
              <Link href="/501c3">
                <a>About</a>
              </Link>
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
