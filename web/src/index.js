import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import DirectoryBody from "./components/DirectoryBody.js";
import SubmitBody from "./components/SubmitBody.js";
import Header from "./components/Header.js";
import Footer from "./components/Footer.js";
import { PostAuthenticate } from "./components/Authenticate.js";
import ScrollToTop from "./components/ScrollToTop.js";
import * as serviceWorker from "./serviceWorker";
import "./custom.scss";
import { BrowserRouter as Router } from "react-router-dom";
import { Route, Switch } from "react-router-dom";
import EditPosts from "./components/EditPosts";
import EditPost from "./components/EditPost";
import ViewPost from "./components/ViewPost";
import Presubmit from "./components/Presubmit";
import { HomePage } from "./components/HomePage";

const Analytics = () => {
  useEffect(() => {
    window.location.href =
      "https://app.usefathom.com/share/fuivzexd/queerburners.org";
  }, []);

  return (
    <div>
      <h1>Loading Analytics...</h1>
    </div>
  );
};

const TopLevelComponent = (props) => {
  const [userData, setUserData] = useState({ isLoggedOn: false });

  return (
    <Router>
      <ScrollToTop />
      <Header
        userData={userData}
        OnUserDataChange={(newUserData) => {
          setUserData(newUserData);
        }}
      />
      <Switch>
        <Route
          exact
          path="/"
          render={(props) => (
            <ViewPost userData={userData} post="greetersStation" />
          )}
        />

        <Route
          path="/submit/:year"
          render={(props) => {
            return (
              <Presubmit
                userData={userData}
                year={props.match.params.year}
                camp={new URLSearchParams(props.location.search).get("camp")}
              />
            );
          }}
        />

        <Route
          path="/submit"
          render={(props) => (
            <Presubmit userData={userData} year={null} camp={null} />
          )}
        />

        <Route
          path="/year/:year"
          render={(props) => (
            <DirectoryBody
              {...props}
              year={props.match.params.year}
              search={new URLSearchParams(props.location.search).get("s")}
              userData={userData}
            />
          )}
        />
        <Route
          path="/directory"
          render={(props) => (
            <DirectoryBody {...props} year="" userData={userData} />
          )}
        />
        <Route
          path="/editPosts"
          render={(props) => <EditPosts userData={userData} />}
        />
        <Route
          path="/editPost/:post+"
          render={(props) => (
            <EditPost userData={userData} post={props.match.params.post} />
          )}
        />
        <Route
          path="/newPost"
          render={(props) => <EditPost userData={userData} post={null} />}
        />

        <Route
          path="/edit/:year"
          render={(props) => {
            return (
              <SubmitBody
                userData={userData}
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

        <Route path="/analytics" render={(props) => <Analytics />} />

        <Route
          path="/headeronly"
          render={() => <React.Fragment></React.Fragment>}
        />

        <Route path="/org" render={() => <HomePage></HomePage>} />

        <Route
          path="/:post+"
          render={(props) => (
            <ViewPost userData={userData} post={props.match.params.post} />
          )}
        />
      </Switch>
      <Footer />
    </Router>
  );
};

ReactDOM.render(<TopLevelComponent />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
