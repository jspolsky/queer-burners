import React from "react";

import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Image from "react-bootstrap/Image";

function JoinButton(props) {
  const o = props.o;
  if (o.join && o.join.open) {
    const popover = (
      <Popover id="popover-basic">
        <Popover.Title as="h3">Join our camp!</Popover.Title>
        <Popover.Content>{o.join.message}</Popover.Content>
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

const CampCard = (props) => {
  const o = props.o;
  return (
    <Card style={{ width: "20rem" }} bg="light">
      {
        // UNDONE THE IMAGE IS PROBABLY NOT THERE
        // <Card.Img variant="top" src={require("../camp_images/" + o.image)} />
      }
      <Card.Header>
        <span style={{ fontSize: "1.2rem", fontWeight: "bolder" }}>
          {o.name}
        </span>
        <JoinButton o={o} />
      </Card.Header>
      <Card.Body>
        <Card.Subtitle className="mb-2 text-muted">
          {o.identifies}
          {o.location && o.location.string && <div>{o.location.string}</div>}
        </Card.Subtitle>
        <Card.Text>{o.about}</Card.Text>
        <DisplayURL url={o.url} />
        <DisplayEmail email={o.email} />
        {["facebook", "instagram", "twitter"].map((s) => {
          if (!o[s]) return null;
          return (
            <a href={o[s]} key={s}>
              <Image
                src={require("../assets/social_" + s + ".svg")}
                style={{ width: "1.8rem", paddingRight: ".35rem" }}
              />
            </a>
          );
        })}
      </Card.Body>
    </Card>
  );
};

export default CampCard;