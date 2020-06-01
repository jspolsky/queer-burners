import React from "react";
import logo from "./assets/header_logo.png";

import SubmitBody from "./components/SubmitBody.js";
import DirectoryBody from "./components/DirectoryBody.js";

import { Link } from "react-router-dom";

import "./App.css";

const Header = () => (
  <header className="App-header">
    <Link to="/">
      <img src={logo} className="App-logo" alt="logo" />
    </Link>
  </header>
);

export function Directory(props) {
  return (
    <div className="App">
      <Header />
      <DirectoryBody year={props.year} />
    </div>
  );
}

export function Submit() {
  return (
    <div className="App">
      <Header />
      <SubmitBody />
    </div>
  );
}
