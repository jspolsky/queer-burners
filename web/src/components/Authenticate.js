import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Redirect } from "react-router";
import { useLocation } from "react-router-dom";

import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import Nav from "react-bootstrap/Nav";

import { googleClientId, oauthEndpoint, api } from "../definitions.js";
import NavDropdown from "react-bootstrap/NavDropdown";
import { hashEmail } from "shared";

export const Authenticate = (props) => {
  let location = useLocation();

  if (props.userData && props.userData.isLoggedOn) {
    //
    // TODO Logout link
    // TODO beautify the Logged On dropdown menu it's ugggggli
    //

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
          </NavDropdown.Item>
          <NavDropdown.Item>LOGOUT GOES HERE</NavDropdown.Item>
          {props.userData.isAdmin && (
            <NavDropdown.Item>You are an admin.</NavDropdown.Item>
          )}
        </NavDropdown>
      </>
    );
  } else {
    const link =
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

    return <Nav.Link href={link}>Login</Nav.Link>;
  }
};

export const PostAuthenticate = (props) => {
  const [status, setStatus] = useState("Logging you on...");
  const [isLoggedOn, setIsLoggedOn] = useState(false);
  const [idToken, setIdToken] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(`${api}/googleidtokenfromauthcode`, {
          code: new URLSearchParams(props.location.search).get("code"),
          redirect_uri: `${window.location.origin}/postauthenticate`,
        });

        setIdToken(result.data.idToken);
        setFullName(result.data.name);
        setEmail(result.data.email);
        setIsAdmin(result.data.isadmin);
        setImageUrl(result.data.imageUrl);
        setDuration(Number(result.data.duration));
        setStatus("Success");
        setIsLoggedOn(true);
        props.OnUserDataChange({
          isLoggedOn: true,
          idToken: result.data.idToken,
          fullName: result.data.name,
          email: result.data.email,
          hashEmail: hashEmail(result.data.email),
          isAdmin: result.data.isadmin,
          imageUrl: result.data.imageUrl,
          duration: Number(result.data.duration),
        });
      } catch (err) {
        console.error("Error logging on");
        console.error(err.response.data);
        setStatus("An error occurred logging you on.");
      }
    };

    fetchData();
  }, [props.location.search, props]);

  const queryParams = new URLSearchParams(props.location.search); // call get on that to get individual bits

  if (isLoggedOn) {
    // TODO call a callback from the props so the state is remembered
    return <Redirect to={queryParams.get("state")} />;
  } else {
    return (
      <div className="App">
        {status}
        <Container>
          <Row>
            <Col>isLoggedOn</Col>
            <Col>{isLoggedOn ? "t" : "f"}</Col>
          </Row>
          <Row>
            <Col>idToken</Col>
            <Col>{idToken}</Col>
          </Row>
          <Row>
            <Col>Full Name</Col>
            <Col>{fullName}</Col>
          </Row>
          <Row>
            <Col>Email</Col>
            <Col>{email}</Col>
          </Row>
          <Row>
            <Col>isAdmin</Col>
            <Col>{isAdmin ? "t" : "f"}</Col>
          </Row>
          <Row>
            <Col>imageUrl</Col>
            <Col>
              <img alt="Joel" src={imageUrl}></img>
            </Col>
          </Row>
          <Row>
            <Col>Duration</Col>
            <Col>{duration}</Col>
          </Row>
          <Row>
            <Col>Origin</Col>
            <Col>{window.location.origin}</Col>
          </Row>
          <Row>
            <Col>window.location.href</Col>
            <Col>{window.location.href}</Col>
          </Row>
          <Row>
            <Col>Search Params</Col>
            <Col>{props.location.search}</Col>
          </Row>
          <Row>
            <Col>State</Col>
            <Col>{queryParams.get("state")}</Col>
          </Row>
          <Row>
            <Col>A link to State</Col>
            <Col>
              <Link to={queryParams.get("state")}>Link</Link>
            </Col>
          </Row>
          <Row>
            <Col>Code</Col>
            <Col>{queryParams.get("code")}</Col>
          </Row>
          <Row>
            <Col>Error</Col>
            <Col>{queryParams.get("error")}</Col>
          </Row>
          <Row>
            <Col>Hash</Col>
            <Col>{props.location.hash}</Col>
          </Row>
          <Row>
            <Col>Done?</Col>
            <Col>
              <a href="/">Home</a>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
};
