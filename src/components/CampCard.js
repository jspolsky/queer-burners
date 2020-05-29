import React from "react";

import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Image from "react-bootstrap/Image";

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

export default CampCard;
