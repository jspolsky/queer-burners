import React, { useState, useEffect } from "react";
import { Redirect } from "react-router";
import { useLocation } from "react-router-dom";

import axios from "axios";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Nav from "react-bootstrap/Nav";
import Spinner from "react-bootstrap/Spinner";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { googleClientId, oauthEndpoint, api } from "../definitions.js";
import NavDropdown from "react-bootstrap/NavDropdown";
import { hashEmail } from "shared";

export const LogonLink = () => {
  return <a href={LogonLinkAddress()}>Login</a>;
};

const LogonLinkAddress = () => {
  let location = useLocation();

  let link =
    oauthEndpoint +
    "?state=" +
    encodeURIComponent(location.pathname + location.search) +
    "&client_id=" +
    googleClientId +
    "&redirect_uri=" +
    encodeURIComponent(window.location.origin + "/postauthenticate") +
    "&response_type=code" +
    "&scope=openid%20email%20profile" +
    "&access_type=offline" +
    "&include_granted_scopes=true";

  if (localStorage.getItem("oauthPrompt")) {
    link += `&prompt=${localStorage.getItem("oauthPrompt")}`;
  }

  return link;
};

export const Authenticate = (props) => {
  useEffect(() => {
    if (!props.userData.isLoggedOn) {
      // user isn't logged on. Do they want to be?

      let tmpUserData = JSON.parse(localStorage.getItem("userData"));
      if (tmpUserData && tmpUserData.isLoggedOn) {
        // yes. Is their token still good?
        if (new Date(tmpUserData.expires).valueOf() > new Date().valueOf()) {
          // Yes! Log them on
          props.OnUserDataChange(tmpUserData);
        } else {
          // No! This would be a good time to redirect through google TODO!
        }
      }
    }
  }, [props.userData, props]);

  // every 10 seconds, we check if the user login token is expiring.
  // If so, we kinda force a logout, so the UI doesn't appear to show
  // you that you are logged on.
  useEffect(() => {
    let interval = setInterval(() => {
      if (
        props.userData.isLoggedOn &&
        new Date(props.userData.expires).valueOf() - 10000 <
          new Date().valueOf()
      ) {
        // user token expired.
        localStorage.removeItem("userData");
        props.OnUserDataChange({ isLoggedOn: false });
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  });

  if (props.userData && props.userData.isLoggedOn) {
    return (
      <>
        <Image
          roundedCircle
          src={props.userData.imageUrl}
          className="GoogleUserPicture"
        ></Image>
        <NavDropdown alignRight title={props.userData.fullName}>
          <NavDropdown.Item>
            Logged on as {props.userData.email}
            {props.userData.isAdmin && <em> (admin)</em>}
          </NavDropdown.Item>
          <NavDropdown.Item
            onClick={() => {
              localStorage.removeItem("userData");
              localStorage.setItem("oauthPrompt", "consent");
              props.OnUserDataChange({ isLoggedOn: false });
            }}
          >
            Logout
          </NavDropdown.Item>
        </NavDropdown>
      </>
    );
  } else {
    return <Nav.Link href={LogonLinkAddress()}>Login</Nav.Link>;
  }
};

export const PostAuthenticate = (props) => {
  const [status, setStatus] = useState("Logging you on...");
  const [isLoggedOn, setIsLoggedOn] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(`${api}/googleidtokenfromauthcode`, {
          code: new URLSearchParams(props.location.search).get("code"),
          redirect_uri: `${window.location.origin}/postauthenticate`,
        });

        setStatus("Success");
        setIsLoggedOn(true);

        const userData = {
          isLoggedOn: true,
          idToken: result.data.idToken,
          fullName: result.data.name,
          email: result.data.email,
          hashEmail: hashEmail(result.data.email),
          isAdmin: result.data.isadmin,
          imageUrl: result.data.imageUrl,
          expires: new Date(
            new Date().valueOf() + 1000 * Number(result.data.duration)
          ),
        };

        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.removeItem("oauthPrompt");
        props.OnUserDataChange(userData);
      } catch (err) {
        console.error("Error logging on");
        console.error(err.response.data);
        setStatus("An error occurred logging you on.");
      }
    };

    fetchData();
  }, [props.location.search, props]);

  const queryParams = new URLSearchParams(props.location.search);

  if (isLoggedOn) {
    return <Redirect to={queryParams.get("state")} />;
  } else {
    return (
      <Container>
        <Row>
          <Col>
            <Spinner animation="border" role="status">
              <span className="sr-only"></span>
            </Spinner>
            <h2>{status}</h2>
          </Col>
        </Row>
      </Container>
    );
  }
};
