import React, { useState, useEffect } from "react";
import axios from "axios";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import SubmitBody from "./SubmitBody";
import { LogonLink } from "./Authenticate";
import { defaultYear, api } from "../definitions.js";

export const Presubmit = (props) => {
  const yearForNewSubmissions = defaultYear === 2020 ? 2021 : defaultYear;
  const [previousCamps, setPreviousCamps] = useState(null);
  const [newCampRequested, setNewCampRequested] = useState(false);
  const [copyCampRequested, setCopyCampRequested] = useState(false);

  useEffect(() => {
    // find out if current logged on user has submitted
    // camps previously

    const fetchPreviousCamps = async () => {
      if (props.userData.isLoggedOn)
        try {
          const result = await axios.get(`${api}/mycamps`, {
            auth: {
              username: props.userData.idToken,
              password: "",
            },
          });
          setPreviousCamps(result.data);
        } catch (e) {
          console.log(e);
          setPreviousCamps(null);
        }
    };

    fetchPreviousCamps();
  }, [props.userData.idToken, props.userData.isLoggedOn]);

  const NotLoggedIn = () => {
    return (
      <Container>
        <Row>
          <Col>
            <h2>Submit your camp to the Queerburners directory!</h2>
            <p>
              Welcome! We’re building a comprehensive list of LGBTQIA+ and ally
              theme camps that will participate in Burning Man in{" "}
              {yearForNewSubmissions}.
            </p>

            <p>
              To add your theme camp to this directory, please start by signing
              in with Google.
            </p>
            <p
              style={{
                textAlign: "center",
              }}
            >
              <LogonLink useIcon={true} />
            </p>
            <p>
              We will save your email address in case we need to contact you.
              You{"'"}ll be able to edit your camp directory listing at any time
              by logging in again. Your email address will <strong>not</strong>{" "}
              be shown publicly.
            </p>
          </Col>
        </Row>
      </Container>
    );
  };

  if (!props.userData.isLoggedOn) {
    return NotLoggedIn();
  }

  //
  // we got here via a request to edit a particular camp
  //
  if (props.userData.isLoggedOn && props.year && props.camp) {
    return (
      <SubmitBody
        userData={props.userData}
        year={props.year}
        camp={props.camp}
      />
    );
  }

  //
  // show a loading indicator while waiting to find out if
  // user has previous camps
  //
  if (!previousCamps) {
    return (
      <Container>
        {" "}
        <Row>
          <Col>
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  //
  // user has no previous camps - let them submit a new one
  //

  if (previousCamps && previousCamps.length === 0) {
    return <SubmitBody userData={props.userData} year={null} camp={null} />;
  }

  //
  // If we made it this far, you are logged on and you have a previous camp!
  //

  const sortedCamps = previousCamps.sort((a, b) => b.year - a.year); // sort with latest camp first

  //
  // You already submitted a camp for this year. All you can do is edit it
  // as we only allow one camp per account
  //
  if (sortedCamps[0].year === yearForNewSubmissions) {
    return (
      <SubmitBody
        userData={props.userData}
        year={sortedCamps[0].year}
        camp={sortedCamps[0].name}
      />
    );
  }

  //
  // You have a camp for a PREVIOUS year, but you are requesting to create a NEW camp for this year
  //
  if (newCampRequested) {
    return <SubmitBody userData={props.userData} year={null} camp={null} />;
  }

  //
  // You have a camp for a PREVIOUS year, and you are requesting to resubmit it (copy it) to this year
  //
  if (copyCampRequested) {
    return (
      <SubmitBody
        userData={props.userData}
        year={sortedCamps[0].year}
        camp={sortedCamps[0].name}
        saveCopyAsYear={yearForNewSubmissions}
      />
    );
  }

  //
  // You have a camp for a previous year, but we don't know yet how you want to handle it
  //
  return (
    <Container>
      <Row>
        <Col>
          <h2>Welcome back!</h2>
          <p>
            Is <strong>{sortedCamps[0].name}</strong> coming back in{" "}
            {yearForNewSubmissions}?
          </p>
          <Button variant="primary" onClick={() => setCopyCampRequested(true)}>
            Yes, resubmit this camp
          </Button>{" "}
          <Button variant="secondary" onClick={() => setNewCampRequested(true)}>
            No, submit a new camp
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Presubmit;
