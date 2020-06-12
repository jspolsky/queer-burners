import React from "react";

import SubmitBody from "./components/SubmitBody.js";
import DirectoryBody from "./components/DirectoryBody.js";
import PrivacyBody from "./components/PrivacyBody.js";
import Header from "./components/Header.js";

import { Redirect } from "react-router";

import "./App.css";

export function Year(props) {
  return <Directory year={props.match.params.year} />;
}

export class Directory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  userChange = (newUserState) => {
    this.setState(newUserState);
  };

  render() {
    return (
      <div className="App">
        <Header onUserChange={(x) => this.userChange(x)} />
        <DirectoryBody
          year={this.props.year}
          loggedin={this.state.loggedin}
          hashEmail={this.state.hashEmail}
        />
      </div>
    );
  }
}

export class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  userChange = (newUserState) => {
    this.setState(newUserState);
  };

  render() {
    const camp = new URLSearchParams(this.props.location.search).get("camp");

    if (!camp) return <Redirect to="/" />;

    return (
      <div className="App">
        <Header onUserChange={(x) => this.userChange(x)} />
        <div>
          <SubmitBody
            loggedin={this.state.loggedin}
            tokenId={this.state.tokenId}
            year={this.props.match.params.year}
            camp={camp}
          />
        </div>
      </div>
    );
  }
}

export class Submit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  userChange = (newUserState) => {
    this.setState(newUserState);
  };

  render() {
    return (
      <div className="App">
        <Header onUserChange={(x) => this.userChange(x)} />
        <SubmitBody
          loggedin={this.state.loggedin}
          tokenId={this.state.tokenId}
          year={null}
          camp={null}
        />
      </div>
    );
  }
}

export function PrivacyPolicy() {
  return (
    <div className="App">
      <Header />
      <PrivacyBody />
    </div>
  );
}
