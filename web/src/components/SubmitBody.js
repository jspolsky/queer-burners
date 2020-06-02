import React from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import { campIdentifications, streets } from "../definitions.js";
const campErrors = require("shared").campErrors;

export default class SubmitBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //  one for each form field

      // warning - this is not the same data type as our camp info
      // natch
      name: "",
      identifies: campIdentifications[0],
      about: "",
      location: {
        frontage: "",
        intersection: "",
      },
    };
  }

  submitHandler = (event) => {
    const err = campErrors(this.state);
    console.log(err);
    event.preventDefault();
  };

  changeHandler = (event) => {
    // if the name of the form control is a single
    // word like "identifies", this does a normal, simple
    // setState to update the JSON state.

    // if it is composite, like "location.frontage", it
    // only changes location.frontage while preserving
    // the other sub-fields of location.

    // this allows up to two levels of hierarchy in the
    // object.

    const splitname = event.target.name.split(".");
    const x = splitname[0];
    const y =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    if (splitname.length === 1) {
      this.setState((state, props) => {
        return {
          [x]: y,
        };
      });
    } else if (splitname.length === 2) {
      const xx = splitname[1];
      this.setState((state, props) => {
        return {
          [x]: {
            ...state[x],
            [xx]: y,
          },
        };
      });
    }
  };

  render() {
    return (
      <div>
        <Container>
          <Row>
            <Col style={{ marginTop: "2rem", marginBottom: "1rem" }}>
              <h2>Submit your camp to the Queer Burners directory!</h2>
            </Col>
          </Row>
          <Row>
            <Col>
              <p>
                To add your theme camp to this directory, please fill out this
                form.
              </p>
              <Form>
                <Row>
                  <Col xs={7}>
                    <Form.Group controlId="name">
                      <Form.Label>Camp Name</Form.Label>
                      <Form.Control
                        type="input"
                        placeholder="404 Camp Not Found"
                        name="name"
                        value={this.state.name}
                        onChange={this.changeHandler}
                      ></Form.Control>
                      <Form.Text className="text-muted">
                        If your camp is registered with placement, make sure
                        this name matches exactly.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="identifies">
                      <Form.Label>Identification</Form.Label>
                      <Form.Control
                        as="select"
                        name="identifies"
                        value={this.state.identifies}
                        onChange={this.changeHandler}
                      >
                        {campIdentifications.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </Form.Control>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group controlId="about">
                  <Form.Label>About your camp</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="3"
                    placeholder="Max 255 characters"
                    name="about"
                    onChange={this.changeHandler}
                    value={this.state.about}
                  ></Form.Control>
                </Form.Group>

                <Row>
                  <Col>
                    <Form.Group controlId="frmFrontage">
                      <Form.Label>Frontage</Form.Label>
                      <Form.Control
                        name="location.frontage"
                        as="select"
                        onChange={this.changeHandler}
                      >
                        {streets.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </Form.Control>
                      <Form.Text className="text-muted">
                        The street that your camp faces
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="frmIntersection">
                      <Form.Label>Intersection</Form.Label>
                      <Form.Control
                        name="location.intersection"
                        as="select"
                        onChange={this.changeHandler}
                      >
                        {streets.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </Form.Control>
                      <Form.Text className="text-muted">
                        The nearest cross-street
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group controlId="frmURL">
                      <Form.Label>Public web site</Form.Label>
                      <Form.Control
                        type="input"
                        name="url"
                        placeholder="https://www.example.com"
                        onChange={this.changeHandler}
                      />
                      <Form.Text className="text-muted">
                        Your camp's public website, if any. Do not use a
                        Facebook URL here
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="frmFacebook">
                      <Form.Label>Facebook</Form.Label>
                      <Form.Control
                        type="input"
                        name="facebook"
                        placeholder="https://www.facebook.com/campname"
                        onChange={this.changeHandler}
                      />
                      <Form.Text className="text-muted">
                        Your camp's public Facebook page or group, if any.
                        Provide the full URL
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Form.Group controlId="frmEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="input"
                        name="email"
                        placeholder="info@example.com"
                      />
                      <Form.Text className="text-muted">
                        Email address for inquiries
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="frmTwitter">
                      <Form.Label>Twitter</Form.Label>
                      <InputGroup>
                        <InputGroup.Prepend>
                          <InputGroup.Text>@</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          type="input"
                          name="twitter"
                          placeholder="example"
                          onChange={this.changeHandler}
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Your Twitter feed, if any
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="frmInstagram">
                      <Form.Label>Instagram</Form.Label>
                      <InputGroup>
                        <InputGroup.Prepend>
                          <InputGroup.Text>@</InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          type="input"
                          name="instagram"
                          placeholder="example"
                          onChange={this.changeHandler}
                        />
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Your Instagram feed, if any
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group controlId="frmThumbnail">
                  <Form.Label>Upload pictures of your camp here</Form.Label>
                  <Form.File id="frm-file" label="Thumbnail Image" custom />
                  <Form.Text className="text-muted">
                    The first picture will appear on the front of your card on
                    the home page. Others will appear when people click through
                    to read about your camp
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="frmRecruiting">
                  <Form.Label>Are you open to new members?</Form.Label>
                  <Form.Check
                    type="switch"
                    id="custom-switch"
                    name="join.open"
                    label="Yes"
                    onChange={this.changeHandler}
                  />
                </Form.Group>
                <Form.Group controlId="frmRecruitingMessage">
                  <Form.Label>Instructions</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="3"
                    name="join.message"
                    placeholder="Max 255 characters"
                    onChange={this.changeHandler}
                  ></Form.Control>
                  <Form.Text className="text-muted">
                    Provide brief instructions for people who are interested in
                    joining your camp. What should they do next?
                  </Form.Text>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  onClick={this.submitHandler}
                >
                  Submit
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
