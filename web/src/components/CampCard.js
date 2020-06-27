import React, { useState } from "react";

import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Image from "react-bootstrap/Image";
import Modal from "react-bootstrap/Modal";
import Tooltip from "react-bootstrap/Tooltip";
import { Link } from "react-router-dom";
import { s3images } from "../definitions.js";

function JoinButton(props) {
  const o = props.o;
  if (o.joinOpen) {
    const popover = (
      <Popover id="popover-basic">
        <Popover.Title as="h3">Join our camp!</Popover.Title>
        <Popover.Content>
          {o.joinMessage}
          {o.joinUrl && (
            <div>
              <hr></hr>
              <a href={o.joinUrl}>Apply</a>
            </div>
          )}
        </Popover.Content>
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
        <a href={"mailto:" + props.email}>{props.email}</a>
      </div>
    );
  } else {
    return null;
  }
}

const Lightbox = (props) => {
  return (
    <Modal
      show={props.show}
      dialogClassName="camp-lightbox "
      onHide={() => props.setShow(false)}
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: 0 }}>
        <Image src={props.image} fluid></Image>
      </Modal.Body>
      {props.about && props.about.length > 0 && (
        <Modal.Footer style={{ justifyContent: "flex-start" }}>
          {props.about}
        </Modal.Footer>
      )}
    </Modal>
  );
};

const CampCard = (props) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const o = props.o;

  return (
    <>
      <Lightbox
        show={showLightbox}
        setShow={setShowLightbox}
        image={`${s3images}/${o.fullSizeImage}`}
        name={o.name}
        about={o.about}
        centered
      ></Lightbox>
      <Card bg="light" border={props.ismine ? "success" : "light"}>
        {o.thumbnail && (
          <Card.Img
            role="button"
            variant="top"
            src={`${s3images}/${o.thumbnail}`}
            onClick={() => {
              setShowLightbox(!!o.fullSizeImage); // only show lightbox if fullSizeImage present
            }}
          />
        )}
        <Card.Header as="h5">
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
            let url = o[s];
            if (s === "twitter" || s === "instagram")
              url = `https://${s}.com/${url}`;
            return (
              <a href={url} key={s}>
                <Image
                  src={require("../assets/social_" + s + ".svg")}
                  style={{ width: "1.8rem", paddingRight: ".35rem" }}
                />
              </a>
            );
          })}
          <h4>
            {o.offerShowers && (
              <OverlayTrigger
                key="shower"
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-shower">Camp provides showers</Tooltip>
                }
              >
                <span role="img" aria-label="Camp provides showers">
                  🚿{" "}
                </span>
              </OverlayTrigger>
            )}
            {o.offerWater && (
              <OverlayTrigger
                key="water"
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-water">Camp provides water</Tooltip>
                }
              >
                <span role="img" aria-label="Camp provides water">
                  🚰{" "}
                </span>
              </OverlayTrigger>
            )}
            {o.offerMeals && (
              <OverlayTrigger
                key="meal"
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-meal">
                    Camp provides some or all meals
                  </Tooltip>
                }
              >
                <span role="img" aria-label="Camp provides some or all meals">
                  🍽{" "}
                </span>
              </OverlayTrigger>
            )}
            {o.campFee && (
              <OverlayTrigger
                key="fee"
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-fee">
                    There is a fee to camp with us
                  </Tooltip>
                }
              >
                <span role="img" aria-label="There is a fee to camp with us">
                  💲{" "}
                </span>
              </OverlayTrigger>
            )}
            {o.virginsWelcome && (
              <OverlayTrigger
                key="virgins"
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-virgins">
                    Burning Man first-timers welcome
                  </Tooltip>
                }
              >
                <span role="img" aria-label="Burning Man first-timers welcome">
                  🦄{" "}
                </span>
              </OverlayTrigger>
            )}
          </h4>
        </Card.Body>
        {props.ismine && (
          <Card.Footer>
            This is your camp - you can&nbsp;
            <Link to={`/edit/${o.year}/?camp=${encodeURIComponent(o.name)}`}>
              edit it!
            </Link>
          </Card.Footer>
        )}
        {!props.ismine && props.isadmin && (
          <Card.Footer>
            <Link to={`/edit/${o.year}/?camp=${encodeURIComponent(o.name)}`}>
              Edit
            </Link>
            {o.contact && o.contact.email && o.contact.name && (
              <div style={{ fontSize: "0.8rem" }}>
                Submitted by {o.contact.name}{" "}
                <a href={`mailto:${o.contact.email}`}>{o.contact.email}</a>
              </div>
            )}
          </Card.Footer>
        )}
      </Card>
    </>
  );
};

export default CampCard;
