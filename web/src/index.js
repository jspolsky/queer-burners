import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import PrivacyBody from "./components/PrivacyBody.js";
import DirectoryBody from "./components/DirectoryBody.js";
import SubmitBody from "./components/SubmitBody.js";
import Header from "./components/Header.js";
import { PostAuthenticate } from "./components/Authenticate.js";
import * as serviceWorker from "./serviceWorker";
import "./custom.scss";
import { BrowserRouter as Router } from "react-router-dom";
import { Route } from "react-router-dom";

const TopLevelComponent = (props) => {
  const [userData, setUserData] = useState({ isLoggedOn: false });

  return (
    <Router>
      <Header userData={userData} />
      <Route
        exact
        path="/"
        render={(props) => (
          <DirectoryBody
            {...props}
            year=""
            loggedin={userData.isLoggedOn}
            hashEmail={userData.hashEmail}
            isadmin={userData.isAdmin}
            idToken={userData.idToken}
          />
        )}
      />
      <Route
        path="/submit"
        render={(props) => (
          <SubmitBody
            loggedin={userData.isLoggedOn}
            idToken={userData.idToken}
            year={null}
            camp={null}
          />
        )}
      />
      <Route
        path="/year/:year"
        render={(props) => (
          <DirectoryBody
            {...props}
            year={props.match.params.year}
            loggedin={userData.isLoggedOn}
            hashEmail={userData.hashEmail}
            isadmin={userData.isAdmin}
            idToken={userData.idToken}
          />
        )}
      />
      <Route path="/privacy" component={PrivacyBody} />
      <Route
        path="/edit/:year"
        render={(props) => {
          return (
            <SubmitBody
              loggedin={userData.isLoggedOn}
              idToken={userData.idToken}
              year={props.match.params.year}
              camp={new URLSearchParams(props.location.search).get("camp")}
            />
          );
        }}
      />
      <Route
        path="/postauthenticate"
        render={(props) => (
          <PostAuthenticate
            {...props}
            OnUserDataChange={(newUserData) => {
              setUserData(newUserData);
            }}
          />
        )}
      />
    </Router>
  );
};

ReactDOM.render(<TopLevelComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
