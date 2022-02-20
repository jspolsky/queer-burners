import React, { useState, useEffect, useContext, VFC } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import axios from "axios";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Spinner from "react-bootstrap/Spinner";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {
  googleClientId,
  oauthEndpoint,
  api,
  frontendUrl,
} from "../definitions.js";
import NavDropdown from "react-bootstrap/NavDropdown";

import { hashEmail } from "shared";
import UserContext, { UserContextProps } from "./UserContext";

export const LogonLink: VFC<{ useIcon: boolean }> = (props) => {
  if (typeof window === "undefined") {
    return null;
  }

  if (props.useIcon) {
    return (
      <a href={LogonLinkAddress()}>
        <img
          src="/assets/btn_google_signin_dark_normal_web.png"
          alt="Sign in with Google"
        ></img>
      </a>
    );
  }

  return <a href={LogonLinkAddress()}>Login</a>;
};

const LogonLinkAddress = () => {
  const router = useRouter();
  let link =
    oauthEndpoint +
    "?state=" +
    encodeURIComponent(router.asPath) +
    "&client_id=" +
    googleClientId +
    "&redirect_uri=" +
    encodeURIComponent(`${frontendUrl}/postauthenticate`) +
    "&response_type=code" +
    "&scope=openid%20email%20profile" +
    "&access_type=offline" +
    "&include_granted_scopes=true";

  if (localStorage.getItem("oauthPrompt")) {
    link += `&prompt=${localStorage.getItem("oauthPrompt")}`;
  }

  return link;
};

const refreshToken = async (params: {
  setUserData: UserContextProps["setUserData"];
}) => {
  const { setUserData } = params;

  const localUserData = localStorage.getItem("userData");

  let tmpUserData = localUserData ? JSON.parse(localUserData) : undefined;

  if (tmpUserData && tmpUserData.isLoggedOn && tmpUserData.refreshToken) {
    try {
      const result = await axios.post(`${api}/refreshexpiredtoken`, {
        refreshToken: tmpUserData.refreshToken,
      });

      console.log("Token refreshed");

      tmpUserData.expires = new Date(
        new Date().valueOf() + 1000 * Number(result.data.expires_in)
      );

      tmpUserData.idToken = result.data.id_token;
      localStorage.setItem("userData", JSON.stringify(tmpUserData));

      setUserData((prev: any) => ({
        ...prev,
        expires: tmpUserData.expires,
        idToken: tmpUserData.idToken,
      }));
    } catch (e) {
      console.log("Token refresh failed");
      localStorage.removeItem("userData");
      setUserData({ isLoggedOn: false });
    }
  } else {
    console.log("Unable to refresh token");
    localStorage.removeItem("userData");
    setUserData({ isLoggedOn: false });
  }
};

export const Authenticate = () => {
  const { userData, setUserData } = useContext(UserContext);
  // User first arrives, checked if they are supposed to be logged on

  useEffect(() => {
    if (!userData.isLoggedOn) {
      // user isn't logged on. Do they want to be?

      const localUserData = localStorage.getItem("userData");

      let tmpUserData = localUserData ? JSON.parse(localUserData) : undefined;
      if (tmpUserData && tmpUserData.isLoggedOn) {
        // yes. Is their token still good?
        if (new Date(tmpUserData.expires).valueOf() > new Date().valueOf()) {
          // Yes! Log them on
          setUserData(tmpUserData);
        } else {
          refreshToken({ setUserData });
        }
      }
    }
  }, [userData, setUserData]);

  // every 10 seconds, we check if the user login token is expiring.
  // If so, we try to refresh your token.
  //
  // If that doesn't work, we force a logout, so the UI doesn't appear to show
  // you that you are logged on.
  //
  useEffect(() => {
    let interval = setInterval(async () => {
      if (
        userData.isLoggedOn &&
        new Date(userData.expires).valueOf() - 10000 < new Date().valueOf()
      ) {
        // user token expired.

        await refreshToken({ setUserData });
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  });

  if (userData && userData.isLoggedOn) {
    return (
      <>
        <Image
          roundedCircle
          src={userData.imageUrl}
          className="GoogleUserPicture"
        ></Image>
        <NavDropdown
          id={userData.fullName}
          alignRight
          title={userData.fullName}
        >
          <NavDropdown.Item>
            Logged on as {userData.email}
            {userData.isAdmin && <em> (admin)</em>}
          </NavDropdown.Item>
          <Link href="/editPosts" passHref>
            <NavDropdown.Item>Edit Posts</NavDropdown.Item>
          </Link>
          <Link href="/analytics" passHref>
            <NavDropdown.Item>Site analytics</NavDropdown.Item>
          </Link>
          <NavDropdown.Item
            onClick={() => {
              localStorage.removeItem("userData");
              localStorage.setItem("oauthPrompt", "consent");
              setUserData({ isLoggedOn: false });
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

export const PostAuthenticate = () => {
  const { setUserData } = useContext(UserContext);
  const router = useRouter();
  const [status, setStatus] = useState("Logging you on...");
  const [isLoggedOn, setIsLoggedOn] = useState(false);

  useEffect(() => {
    const { code } = router.query;
    if (code) {
      const fetchData = async () => {
        try {
          console.log(`authcode is ${code}`);

          const result = await axios.post(`${api}/googleidtokenfromauthcode`, {
            code,
            redirect_uri: `${frontendUrl}/postauthenticate`,
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
            refreshToken: result.data.refreshToken,
          };

          localStorage.setItem("userData", JSON.stringify(userData));
          localStorage.removeItem("oauthPrompt");
          setUserData(userData);
        } catch (err: any) {
          console.error("Error logging on");
          console.error(err.response.data);
          setStatus("An error occurred logging you on.");
        }
      };

      fetchData();
    }
  }, [router.query, setUserData]);

  if (isLoggedOn) {
    router.push(
      typeof router.query.state === "string" ? router.query.state : "/"
    );
    return null;
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
