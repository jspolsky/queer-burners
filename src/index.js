import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Directory, Submit } from "./App";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Route } from "react-router-dom";

ReactDOM.render(
  <Router>
    <Route exact path="/" component={Directory} />
    <Route exact path="/submit" component={Submit} />
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
