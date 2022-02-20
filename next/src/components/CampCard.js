import React, { useState } from "react";

import Link from "next/link";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Image from "react-bootstrap/Image";
import Modal from "react-bootstrap/Modal";
import Tooltip from "react-bootstrap/Tooltip";
import { s3images } from "../definitions.js";
import { campAlternateLocations } from "shared";

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
      <OverlayTrigger
        rootClose
        trigger="click"
        placement="top"
        overlay={popover}
      >
        <Badge
          variant="primary"
          as="a"
          size="sm"
          style={{ cursor: "pointer", color: "white" }}
        >
          Join Us!
        </Badge>
      </OverlayTrigger>
    );
  } else return null;
}

const DisplaySocialLink = ({ linkType, raw }) => {
  // valid linkTypes: url, email, facebook, instagram, twitter
  // raw is the way it is stored in the database in the field of the same name

  if (!raw) return null;

  let href = raw;
  let display = raw;

  switch (linkType) {
    case "url":
      display = raw
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "")
        .replace(/^www\./, "");
      break;

    case "email":
      href = `mailto:${raw}`;
      break;

    case "facebook":
      display = raw
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "")
        .replace(/^www\./, "");
      break;

    case "instagram":
      href = `https://instagram.com/${raw}`;
      break;

    case "twitter":
      href = `https://twitter.com/${raw}`;
      display = `@${raw}`;
      break;

    default:
  }

  return (
    <div>
      <Image
        src={require(`../../public/assets/social_${linkType}.svg`)}
        style={{ width: "1.2rem", paddingRight: ".35rem" }}
      />
      <a
        style={{ fontSize: "0.85rem" }}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {display}
      </a>
    </div>
  );
};

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

const AlternateLocations = (props) => {
  const toSentence = (arr) =>
    arr.slice(0, -2).join(", ") +
    (arr.slice(0, -2).length ? ", " : "") +
    arr.slice(-2).join(" and ");

  if (!props.altlocation) return <></>;

  var fullNameAltLocations = [];

  campAlternateLocations.forEach((x) => {
    if (props.altlocation[x.code]) {
      fullNameAltLocations.push(x.fullname);
    }
  });

  if (fullNameAltLocations.length === 0) return <></>;

  return (
    <Card.Text className="font-weight-light">
      <em>
        This year we will be attending {toSentence(fullNameAltLocations)}.
      </em>
    </Card.Text>
  );
};

const CampCard = (props) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const o = props.o;

  const displayLocation =
    o.location && o.location.string && o.location.string !== "Unknown" ? (
      <div>{o.location.string}</div>
    ) : (
      ""
    );

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
        </Card.Header>
        <Card.Body>
          <Card.Subtitle className="mb-2 text-muted">
            {o.identifies}
            {displayLocation}
          </Card.Subtitle>
          <Card.Text>
            {o.about} <JoinButton o={o} />
          </Card.Text>

          <AlternateLocations altlocation={o.altlocation} />

          {["url", "facebook", "email", "instagram", "twitter"].map((s) => {
            return <DisplaySocialLink key={s} linkType={s} raw={o[s]} />;
          })}
          <h4 style={{ marginTop: "0.7rem" }}>
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
            <Link href={`/edit/${o.year}/?camp=${encodeURIComponent(o.name)}`}>
              edit it!
            </Link>
          </Card.Footer>
        )}
        {!props.ismine && props.isadmin && (
          <Card.Footer>
            <Link href={`/edit/${o.year}/?camp=${encodeURIComponent(o.name)}`}>
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
