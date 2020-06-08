import React from "react";
import logo from "./assets/header_logo.jpg";

import SubmitBody from "./components/SubmitBody.js";
import DirectoryBody from "./components/DirectoryBody.js";

import { Link } from "react-router-dom";

import "./App.css";

const Header = () => (
  <Link to="/">
    <img class="img-fluid w-100" src={logo} alt="placeholder 960" />
  </Link>
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
