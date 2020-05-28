import React from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import CardColumns from "react-bootstrap/CardColumns";
import Button from "react-bootstrap/Button";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Image from "react-bootstrap/Image";

import { Link } from "react-router-dom";
import { campIdentifications, testData } from "../definitions.js";

export default class DirectoryBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: "all",
    };
  }
  render() {
    let filterButtonString = this.state.filter;
    if (this.state.filter === "all") {
      filterButtonString = "Filter";
    }

    return (
      <div>
        <Container>
          <Row>
            <Col style={{ marginTop: "2rem", marginBottom: "1rem" }}>
              <h2>
                Camp Directory 2021
                <Link to="/submit">
                  <Button
                    size="sm"
                    variant="outline-success"
                    style={{ marginLeft: "2rem" }}
                  >
                    Submit your camp!
                  </Button>
                </Link>
                <DropdownButton
                  id="dropdown-basic-button"
                  title={filterButtonString}
                  size="sm"
                  as="ButtonGroup"
                  style={{ marginLeft: "2rem" }}
                >
                  {campIdentifications.map((s) => (
                    <Dropdown.Item
                      as="button"
                      onClick={() => this.setState({ filter: s })}
                    >
                      {s}
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Item
                    as="button"
                    onClick={() =>
                      this.setState({ filter: "Seeking new members" })
                    }
                  >
                    Seeking new members
                  </Dropdown.Item>
                </DropdownButton>
                {this.state.filter !== "all" && (
                  <Button
                    size="sm"
                    variant="outline-primary"
                    style={{ marginLeft: ".5rem" }}
                    onClick={() => this.setState({ filter: "all" })}
                  >
                    Clear Filter
                  </Button>
                )}
              </h2>
            </Col>
          </Row>
          <Row>
            <Col>
              <CardColumns>
                {testData
                  .filter(
                    (onecamp) =>
                      this.state.filter === "all" ||
                      (this.state.filter === "Seeking new members" &&
                        onecamp.join &&
                        onecamp.join.open) ||
                      this.state.filter === onecamp.identifies
                  )
                  .map((onecamp) => (
                    <CampCard o={onecamp} />
                  ))}
              </CardColumns>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

function JoinButton(props) {
  if (props.o.join && props.o.join.open) {
    const popover = (
      <Popover id="popover-basic">
        <Popover.Title as="h3">Join our camp!</Popover.Title>
        <Popover.Content>{props.o.join.message}</Popover.Content>
      </Popover>
    );

    return (
      <OverlayTrigger trigger="click" placement="top" overlay={popover}>
        <Button variant="outline-info" size="sm" style={{ marginLeft: "1rem" }}>
          Join Us!
        </Button>
      </OverlayTrigger>
    );
  } else return null;
}

function DisplayURL(props) {
  if (props.url) {
    const strippedURL = props.url
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    return (
      <div>
        <Image
          src={require("../assets/social_www.svg")}
          style={{ width: "1.3rem", paddingRight: ".35rem" }}
        />
        <a href={props.url}>{strippedURL}</a>
      </div>
    );
  } else {
    return null;
  }
}

function DisplayEmail(props) {
  if (props.email) {
    return (
      <div style={{ marginBottom: "1rem" }}>
        <Image
          src={require("../assets/social_email.svg")}
          style={{ width: "1.3rem", paddingRight: ".35rem" }}
        />
        <a href="mailto:{props.email}">{props.email}</a>
      </div>
    );
  } else {
    return null;
  }
}

const CampCard = (props) => (
  <Card style={{ width: "20rem" }} bg="light">
    <Card.Img variant="top" src={require("../camp_images/" + props.o.image)} />
    <Card.Header>
      <span style={{ fontSize: "1.2rem", fontWeight: "bolder" }}>
        {props.o.name}
      </span>
      <JoinButton o={props.o} />
    </Card.Header>
    <Card.Body>
      <Card.Subtitle className="mb-2 text-muted">
        {props.o.identifies}
        <br />
        {props.o.location.string}
      </Card.Subtitle>
      <Card.Text>{props.o.about}</Card.Text>
      <DisplayURL url={props.o.url} />
      <DisplayEmail email={props.o.email} />
      <Image
        src={require("../assets/social_facebook.svg")}
        style={{ width: "1.8rem", paddingRight: ".35rem" }}
      />
      <Image
        src={require("../assets/social_twitter.svg")}
        style={{ width: "1.8rem", paddingRight: ".35rem" }}
      />
      <Image
        src={require("../assets/social_instagram.svg")}
        style={{ width: "1.8rem", paddingRight: ".35rem" }}
      />
    </Card.Body>
  </Card>
);
