import React from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CardColumns from "react-bootstrap/CardColumns";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import CampCard from "./CampCard.js";

import { Link } from "react-router-dom";
import { defaultYear } from "../definitions.js";

import axios from "axios";

const campIdentifications = [...require("shared").campIdentifications];

export default class DirectoryBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: "all",
      data: null,
      year:
        props.year && props.year >= 1996 && props.year < 3000
          ? props.year
          : defaultYear,
    };
  }

  async componentDidMount() {
    try {
      const response = await axios.get(
        "https://l374cc62kc.execute-api.us-east-2.amazonaws.com/Prod/camps/" +
          this.state.year
      );
      this.setState({ data: response.data });
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    let filterButtonString = this.state.filter;
    if (this.state.filter === "all") {
      filterButtonString = "Filter";
    }

    return (
      <div>
        <Container>
          <Row>
            <Col style={{ marginTop: "2rem", marginBottom: "1rem" }}>
              <h2>
                Camp Directory {this.state.year}
                <Link to="/submit">
                  <Button
                    size="sm"
                    variant="outline-success"
                    style={{ marginLeft: "2rem" }}
                  >
                    Submit your camp!
                  </Button>
                </Link>
                <DropdownButton
                  as={ButtonGroup}
                  id="dropdown-basic-button"
                  title={filterButtonString}
                  size="sm"
                  style={{ marginLeft: "2rem" }}
                >
                  {campIdentifications.map((s) => (
                    <Dropdown.Item
                      key={s}
                      onClick={() => this.setState({ filter: s })}
                    >
                      {s}
                    </Dropdown.Item>
                  ))}
                  <Dropdown.Item
                    onClick={() =>
                      this.setState({ filter: "Seeking new members" })
                    }
                  >
                    Seeking new members
                  </Dropdown.Item>
                </DropdownButton>
                {this.state.filter !== "all" && (
                  <Button
                    size="sm"
                    variant="outline-primary"
                    style={{ marginLeft: ".5rem" }}
                    onClick={() => this.setState({ filter: "all" })}
                  >
                    Clear Filter
                  </Button>
                )}
              </h2>
            </Col>
          </Row>
          <Row>
            <Col>
              <CardColumns>
                {!this.state.data ? (
                  <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                ) : (
                  this.state.data
                    .filter(
                      (onecamp) =>
                        this.state.filter === "all" ||
                        (this.state.filter === "Seeking new members" &&
                          onecamp.join &&
                          onecamp.join.open) ||
                        this.state.filter === onecamp.identifies
                    )
                    .map((onecamp) => (
                      <CampCard
                        o={onecamp}
                        key={onecamp.year + " " + onecamp.name}
                      />
                    ))
                )}
              </CardColumns>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
