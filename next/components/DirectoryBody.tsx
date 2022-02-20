import React, { useContext, useState, VFC } from "react";

import Link from "next/link";
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

import { CampData } from "../lib/api.js";
import UserContext from "./UserContext";

const campIdentifications = [...require("../../shared").campIdentifications];

const neighborhood = (camp: CampData) => {
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

type DirectoryBodyProps = {
  initialSearchString?: string;
  search?: string;
  camps: CampData[];
  year: number;
};

export const DirectoryBody: VFC<DirectoryBodyProps> = ({
  initialSearchString,
  camps,
  year,
  ...props
}) => {
  const { userData } = useContext(UserContext);
  const [searchString, setSearchString] = useState<string>(
    initialSearchString ?? ""
  );
  const [filter, setFilter] = useState<string>("all");

  let filterButtonString = filter;
  if (filter === "all") {
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
          <Link href="/submit">
            <a className="text-reset" style={{ textDecoration: "underline" }}>
              submit it
            </a>
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
            <h1>Theme Camp Directory {year}</h1>
          </Col>
          <Col md="auto">
            <Form inline>
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
                  <Dropdown.Item key={s} onClick={() => setFilter(s)}>
                    {s}
                  </Dropdown.Item>
                ))}
                <Dropdown.Item onClick={() => setFilter("East Village")}>
                  East Village
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter("West Village")}>
                  West Village
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter("Seeking new members")}>
                  Seeking new members
                </Dropdown.Item>
              </DropdownButton>
              {filter !== "all" ? (
                <Button
                  size="sm"
                  variant="outline-primary"
                  style={{ marginRight: "2rem" }}
                  onClick={() => setFilter("all")}
                >
                  Clear Filter
                </Button>
              ) : null}
              <InputGroup size="sm" style={{ width: "20rem" }}>
                <FormControl
                  autoFocus
                  placeholder="Search"
                  aria-label="Search"
                  onChange={({ target }) => setSearchString(target.value)}
                  value={searchString}
                />
                {searchString.length > 0 && (
                  <InputGroup.Append>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setSearchString("")}
                    >
                      Clear
                    </Button>
                  </InputGroup.Append>
                )}
              </InputGroup>
            </Form>
          </Col>
        </Row>
        {camps.length === 0 ? (
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
                  {camps
                    .filter(
                      (onecamp) =>
                        (filter === "all" ||
                          (filter === "Seeking new members" &&
                            onecamp.joinOpen) ||
                          (filter === "West Village" &&
                            neighborhood(onecamp) === filter) ||
                          (filter === "East Village" &&
                            neighborhood(onecamp) === filter) ||
                          filter === onecamp.identifies) &&
                        (searchString.length === 0 ||
                          (searchString.length === 1 &&
                            onecamp.name
                              .toLowerCase()
                              .startsWith(searchString.toLowerCase())) ||
                          (searchString.length > 1 &&
                            onecamp.name
                              .toLowerCase()
                              .includes(searchString.toLowerCase())))
                    )
                    .map((onecamp) => (
                      <CampCard
                        o={onecamp}
                        key={onecamp.year + " " + onecamp.name}
                        ismine={
                          (userData.hashEmail &&
                            userData.hashEmail === onecamp.hashEmail) ||
                          (userData.email &&
                            onecamp.contact &&
                            onecamp.contact.email &&
                            userData.email === onecamp.contact.email)
                        }
                        isadmin={userData.isAdmin}
                      />
                    ))}
                  {props.search ? (
                    <Card bg="success" text="white">
                      <Card.Header>
                        <strong>Thank you!</strong>
                      </Card.Header>
                      <Card.Body>
                        <p>
                          <strong>{searchString}</strong> will now appear in the
                          Queerburners Directory for {year}.
                        </p>
                        <p>
                          You can edit this listing, change the picture, and add
                          more information at any time. Just come back to
                          queerburners.org and log on again using your Google
                          account.
                        </p>
                        <p>
                          This directory is a service of Queerburners, an online
                          community of LGBTQIA+ burners from around the world.
                          We also have{" "}
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
                            setSearchString("");
                          }}
                        >
                          Ok
                        </Button>
                      </Card.Body>
                    </Card>
                  ) : (
                    submitCard
                  )}
                </CardColumns>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};
