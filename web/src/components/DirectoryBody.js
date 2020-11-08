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
import Card from "react-bootstrap/Card";

import CampCard from "./CampCard.js";

import { Link } from "react-router-dom";
import { defaultYear, api } from "../definitions.js";

import axios from "axios";
const CancelToken = axios.CancelToken;

const campIdentifications = [...require("shared").campIdentifications];

const neighborhood = (camp) => {
  const s430 = ["4:00", "4:15", "4:30", "4:45", "5:00", "5:15", "5:30"];
  const s730 = ["6:30", "6:45", "7:00", "7:15", "7:30", "7:45", "8:00"];

  if (
    s430.includes(camp.location.frontage) ||
    s430.includes(camp.location.intersection)
  )
    return "East Village";
  if (
    s730.includes(camp.location.frontage) ||
    s730.includes(camp.location.intersection)
  )
    return "West Village";

  return "Elsewhere";
};

export default class DirectoryBody extends React.Component {
  constructor(props) {
    super(props);

    let y;
    if (this.props.year >= 1996 && this.props.year < 3000) {
      y = this.props.year;
    } else if (defaultYear === 2020) {
      y = 2019; // there was no burning man in 2020 :(
    } else {
      y = defaultYear;
    }

    this.state = {
      filter: "all",
      search: this.props.search ? this.props.search : "",
      data: null,
      cancelFn: null,
      year: y,
    };
  }

  async fetchData(clearFirst) {
    if (this.state.cancelFn) {
      this.state.cancelFn();
      this.setState({ cancelFn: null });
    }

    const  year = this.state.year;

    if (clearFirst) {
      this.setState({ data: null });
    }
    try {
      const response = await axios.get(`${api}/camps/${year}`, {
        auth: { username: this.props.userData.idToken, password: "" },
        cancelToken: new CancelToken((c) => {
          this.setState({ cancelFn: c });
        }),
      });
      this.setState({ cancelFn: null, data: response.data });
    } catch (e) {
      if (!axios.isCancel(e)) {
        console.error(e);
      }
    }
  }

  async componentDidMount() {
    await this.fetchData(false);
  }

  async componentDidUpdate(prevProps) {
    // if user turns out to be admin, reload because the admin gets to see
    // more stuff

    if (this.props.userData.isAdmin && !prevProps.userData.isAdmin) {
      await this.fetchData(false);
    } else if (this.props.year !== prevProps.year) {
      this.setState({ search: "" });
      await this.fetchData(true);
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

    const submitCard = (
      <Card bg="success" text="white">
        <Card.Header>
          <strong>Don't see your camp here?</strong>
        </Card.Header>
        <Card.Body>
          <p>
            Please{" "}
            <Link
              to="/submit"
              className="text-reset"
              style={{ textDecoration: "underline" }}
            >
              submit it
            </Link>
            !
          </p>
        </Card.Body>
      </Card>
    );

    return (
      <div>
        <Container fluid className="pl-4 pr-4">
          <Row className="pb-4">
            <Col>
              <h1>Theme Camp Directory {this.state.year}</h1>
            </Col>
            <Col md="auto">
              <Form inline={1}>
                {/* this fake submit button is here to block Enter "submitting" the search (which does nothing) */}
                <Button
                  type="submit"
                  disabled
                  style={{ display: "none" }}
                  aria-hidden="true"
                />
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
                    onClick={() => this.setState({ filter: "East Village" })}
                  >
                    East Village
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => this.setState({ filter: "West Village" })}
                  >
                    West Village
                  </Dropdown.Item>
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
          {!this.state.data ? (
            <Row>
              <Col>
                <div className="spinner-border" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </Col>
            </Row>
          ) : (
            <>
              <Row>
                <Col>
                  <CardColumns>
                    {this.state.data
                      .filter(
                        (onecamp) =>
                          (this.state.filter === "all" ||
                            (this.state.filter === "Seeking new members" &&
                              onecamp.joinOpen) ||
                            (this.state.filter === "West Village" &&
                              neighborhood(onecamp) === this.state.filter) ||
                            (this.state.filter === "East Village" &&
                              neighborhood(onecamp) === this.state.filter) ||
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
                          ismine={
                            (this.props.userData.hashEmail &&
                              this.props.userData.hashEmail ===
                                onecamp.hashEmail) ||
                            (this.props.userData.email &&
                              onecamp.contact &&
                              onecamp.contact.email &&
                              this.props.userData.email ===
                                onecamp.contact.email)
                          }
                          isadmin={this.props.userData.isAdmin}
                        />
                      ))}
                    {this.props.search ? (
                      <Card bg="success" text="white">
                        <Card.Header>
                          <strong>Thank you!</strong>
                        </Card.Header>
                        <Card.Body>
                          <p>
                            <strong>{this.props.search}</strong> will now appear
                            in the Queerburners Directory for {this.props.year}
                            .
                          </p>
                          <p>
                            You can edit this listing, change the picture, and
                            add more information at any time. Just come back to
                            queerburnersdirectory.com and log on again using
                            your Google account.
                          </p>
                          <p>
                            This directory is a service of{" "}
                            <a
                              href="http://queerburners.com/"
                              className="text-reset"
                              style={{ textDecoration: "underline" }}
                            >
                              Queerburners
                            </a>
                            , an online community of LGBTQIA+ burners from around
                            the world. Check out our website for galleries, the
                            history of LGBTQIA+ participants at Burning Man, and
                            more. We also have{" "}
                            <a
                              href="https://www.facebook.com/groups/queer.burners/"
                              className="text-reset"
                              style={{ textDecoration: "underline" }}
                            >
                              an active Facebook group
                            </a>{" "}
                            to keep in touch and hope you will join!
                          </p>
                          <Button
                            onClick={() => {
                              this.setState({ search: "" });
                            }}
                          >
                            Ok
                          </Button>
                        </Card.Body>
                      </Card>
                    ) : submitCard}
                  </CardColumns>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>
    );
  }
}
