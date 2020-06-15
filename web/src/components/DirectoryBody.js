import React from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CardColumns from "react-bootstrap/CardColumns";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

import CampCard from "./CampCard.js";

import { Link } from "react-router-dom";
import { defaultYear, api } from "../definitions.js";

import axios from "axios";

const campIdentifications = [...require("shared").campIdentifications];

export default class DirectoryBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: "all",
      search: "",
      data: null,
      year:
        props.year && props.year >= 1996 && props.year < 3000
          ? props.year
          : defaultYear,
    };
  }

  async componentDidMount() {
    try {
      const response = await axios.get(`${api}/camps/${this.state.year}`, {
        auth: { username: this.props.tokenId, password: "" },
      });
      this.setState({ data: response.data });
    } catch (error) {
      console.log(error);
    }
  }

  async componentDidUpdate(prevProps) {
    // if user turns out to be admin, reload because the admin gets to see
    // more stuff

    //
    // TODO find out why user logging out doesn't trigger this?
    // (logging in DOES)
    if (this.props.isadmin !== prevProps.isadmin) {
      this.componentDidMount();
    }
  }

  onSearchChange = (event) => {
    this.setState({ search: event.target.value });
  };

  render() {
    let filterButtonString = this.state.filter;
    if (this.state.filter === "all") {
      filterButtonString = "Filter";
    }

    return (
      <div>
        <Container>
          <Row>
            <Col>
              <h2>Camp Directory {this.state.year}</h2>
            </Col>
            <Col md="auto">
              <Form inline={1}>
                <DropdownButton
                  as={ButtonGroup}
                  id="dropdown-basic-button"
                  title={filterButtonString}
                  size="sm"
                  style={{ marginRight: "2rem" }}
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
                    style={{ marginRight: "2rem" }}
                    onClick={() => this.setState({ filter: "all" })}
                  >
                    Clear Filter
                  </Button>
                )}
                <InputGroup size="sm" style={{ width: "20rem" }}>
                  <FormControl
                    autoFocus
                    placeholder="Search"
                    aria-label="Search"
                    onChange={this.onSearchChange}
                    value={this.state.search}
                  />
                  {this.state.search.length > 0 && (
                    <InputGroup.Append>
                      <Button
                        variant="outline-secondary"
                        onClick={() => this.setState({ search: "" })}
                      >
                        Clear
                      </Button>
                    </InputGroup.Append>
                  )}
                </InputGroup>
              </Form>
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
                        (this.state.filter === "all" ||
                          (this.state.filter === "Seeking new members" &&
                            onecamp.joinOpen) ||
                          this.state.filter === onecamp.identifies) &&
                        (this.state.search.length === 0 ||
                          (this.state.search.length === 1 &&
                            onecamp.name
                              .toLowerCase()
                              .startsWith(this.state.search.toLowerCase())) ||
                          (this.state.search.length > 1 &&
                            onecamp.name
                              .toLowerCase()
                              .includes(this.state.search.toLowerCase())))
                    )
                    .map((onecamp) => (
                      <CampCard
                        o={onecamp}
                        key={onecamp.year + " " + onecamp.name}
                        ismine={this.props.hashEmail === onecamp.hashEmail}
                        isadmin={this.props.isadmin}
                      />
                    ))
                )}
              </CardColumns>
            </Col>
          </Row>
          <Row style={{ marginBottom: "4rem" }}>
            Don't see your camp here?&nbsp; <Link to="/submit">Submit it!</Link>
          </Row>
        </Container>
      </div>
    );
  }
}
