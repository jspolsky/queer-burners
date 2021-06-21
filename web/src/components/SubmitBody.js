import React from "react";
import { Redirect } from "react-router";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { LogonLink } from "./Authenticate.js";
import { ImageUploader } from "./ImageUploader.js";
import DeleteButton from "./DeleteButton.js";

import { defaultYear, api, s3images } from "../definitions.js";
import { fieldError, emptyCamp } from "shared";

import axios from "axios";

const campIdentifications = [...require("shared").campIdentifications];
const campAlternateLocations = [...require("shared").campAlternateLocations];
const streets = [...require("shared").streets];
const crossStreets = require("shared").crossStreets;

export default class SubmitBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // The state object is just a standard
      // camp directory object, which can be submitted to the
      // API and stored in the database.
      ...emptyCamp,
      year: defaultYear === 2020 ? 2021 : defaultYear,

      // state keys starting with '_' are Component state
      // and form metadata which will never be submitted to the API
      _validated: false,
      _error_name: null,
      _error_about: null,
      _error_url: null,
      _error_facebook: null,
      _error_email: null,
      _error_twitter: null,
      _error_instagram: null,
      _error_joinMessage: null,
      _error_joinUrl: null,
      _error_submit: null,
      _submit_in_progress: false,
      _submit_successful: false,
      _ready_to_show_form: false,
      _submit_disabled: false,
    };
  }

  submitHandler = async (event) => {
    event.preventDefault();
    this.setState({
      _validated: true,
      _error_submit: null,
      _submit_in_progress: true,
    });

    let camp = {};
    for (var key in this.state) {
      if (!key.startsWith("_")) {
        camp[key] = this.state[key];
        if (typeof camp[key] === "string") {
          camp[key] = camp[key].trim();
        }
      }
    }

    var fieldsToValidate = [
      "name",
      "about",
      "url",
      "facebook",
      "email",
      "twitter",
      "instagram",
    ];
    if (this.state.joinOpen) {
      fieldsToValidate.push("joinMessage", "joinUrl");
    }

    for (var x of fieldsToValidate) {
      if (!this.fieldValidator(x, camp[x])) {
        this.setState({ _submit_in_progress: false });
        return null;
      }
    }

    if (this.props.saveCopyAsYear) {
      camp["year"] = this.props.saveCopyAsYear;
    }

    try {
      await axios.post(`${api}/camps`, camp, {
        auth: {
          username: this.props.userData.idToken,
          password: "",
        },
      });
      this.setState({ _submit_successful: true, _submit_in_progress: false });
    } catch (error) {
      let msg = "";
      if (error.response) {
        // server returned error
        msg = `Error ${error.response.status}: ${error.response.data}`;
      } else if (error.request) {
        msg = "Error: Network error (no response received)";
      } else {
        msg = error.message;
      }
      console.error(msg);
      console.error(error);
      this.setState({ _error_submit: msg, _submit_in_progress: false });
    }
  };

  fieldValidator = (key, value) => {
    const err = fieldError(key, value);

    this.setState({ ["_error_" + key]: err });
    document.getElementById(key).setCustomValidity(err);
    return err === "";
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
    let y;
    switch (event.target.type) {
      case "checkbox":
        y = event.target.checked;
        break;
      default:
        y = event.target.value;
    }

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

    this.fieldValidator(event.target.name, y);
  };

  NotLoggedIn() {
    return (
      <Container>
        <Row>
          <Col>
            <h2>Submit your camp to the Queerburners directory!</h2>
            <p>
              Welcome! We’re building a comprehensive list of LGBTQIA+ and ally
              theme camps that will participate in Burning Man in{" "}
              {this.state.year}.
            </p>

            <p>
              To add your theme camp to this directory, please start by logging
              in using a Google Account.
            </p>
            <p
              style={{
                textAlign: "center",
                fontSize: "1.3rem",
                fontWeight: "600",
              }}
            >
              <LogonLink />
            </p>
            <p>
              We will save your email address in case we need to contact you.
              You'll be able to edit your camp directory listing at any time by
              logging in again. Your email address will <strong>not</strong> be
              shown publically.
            </p>
          </Col>
        </Row>
      </Container>
    );
  }

  Instructions() {
    if (this.props.year && this.props.camp) {
      const destinationYear = this.props.saveCopyAsYear
        ? this.props.saveCopyAsYear
        : this.props.year;

      return (
        <div>
          <h2>{this.props.camp}</h2>
          <p>
            Edit any changes in the information for your camp in{" "}
            {destinationYear} and hit Submit.
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <h2>Submit your camp to the Queerburners directory!</h2>
          <p>
            Welcome! We're building a comprehensive list of LGBTQIA+ and ally
            theme camps that will participate in Burning Man in{" "}
            {this.state.year}.
          </p>
          <p>
            To add your theme camp to this directory, please fill out this form.
          </p>
        </div>
      );
    }
  }

  async fetchData() {
    if (!this.props.camp || this.props.camp.length === 0) {
      return;
    }

    try {
      const response = await axios.get(
        `${api}/camps/${this.props.year}/${encodeURIComponent(
          this.props.camp
        )}`,
        {
          auth: {
            username: this.props.userData.idToken,
            password: "",
          },
        }
      );
      const data = response.data[0];

      this.setState({
        ...data,
        originalName: data.name,
        _ready_to_show_form: true,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async componentDidUpdate(prevProps) {
    if (
      prevProps.userData.isAdmin !== this.props.userData.isAdmin ||
      prevProps.year !== this.props.year ||
      prevProps.camp !== this.props.camp
    )
      await this.fetchData();
  }

  async componentDidMount() {
    if (!this.props.camp || this.props.camp.length === 0) {
      this.setState({ _ready_to_show_form: true });
      return;
    }

    await this.fetchData();
  }

  render() {

    const getAltLocationFromState = (s) => {
      if (!this.state.altlocation) 
        return false;
      if (!this.state.altlocation[s])
        return false;
      return this.state.altlocation[s];
    };
  
    if (this.state._submit_successful) {
      //
      // after a submit, we are going to redirect them to the directory,
      // set up with a filter to show just their camp.
      //

      const yearToBounce = this.props.saveCopyAsYear
        ? this.props.saveCopyAsYear
        : this.state.year;

      return (
        <Redirect
          to={`/year/${yearToBounce}?s=${encodeURIComponent(this.state.name)}`}
        />
      );
    } else if (!this.props.userData.isLoggedOn) {
      return this.NotLoggedIn();
    } else if (!this.state._ready_to_show_form) {
      return (
        <Container>
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </Container>
      );
    } else
      return (
        <Form
          noValidate
          validated={this.state._validated}
          onSubmit={this.submitHandler}
        >
          <Container fluid="lg" className="pl-4 pr-4 pb-4">
            <Row>
              <Col>{this.Instructions()}</Col>
            </Row>
            <Row>
              <Col xs={12} md={8}>
                <Form.Group controlId="name">
                  <Form.Label>Camp Name</Form.Label>
                  <Form.Control
                    type="input"
                    placeholder="404 Camp Not Found"
                    name="name"
                    value={this.state.name}
                    onChange={this.changeHandler}
                  ></Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {this.state._error_name}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    If your camp is registered with placement, make sure this
                    name matches exactly.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="identifies">
                  <Form.Label>Primary Identification</Form.Label>
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

            <Row>
              <Col>
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
                  <Form.Control.Feedback type="invalid">
                    {this.state._error_about}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Label>Where can we find you in 2021?</Form.Label>
                {campAlternateLocations.map((loc) => {
                  return (
                    <Form.Group
                      controlId={`altlocation.${loc.code}`}
                      key={loc.code}
                      style={{marginBottom: "0"}}
                    >
                      <Form.Check
                        inline
                        type="switch"
                        name={`altlocation.${loc.code}`}
                        checked={getAltLocationFromState(loc.code)}
                        label={loc.fullname}
                        onChange={this.changeHandler}
                      />
                      {
                        loc.linktext &&
                          <a href={loc.link} target="_blank" rel="noopener noreferrer">{loc.linktext}</a>
                      }
                    </Form.Group>
                  );
                })}
              </Col>
            </Row>
            <Row><Col>&nbsp;</Col></Row>

            <Row>
              <Col>
                <Form.Group controlId="location.frontage">
                  <Form.Label>
                    2019 Black Rock City Location (if any)
                  </Form.Label>
                  <Form.Control
                    name="location.frontage"
                    as="select"
                    onChange={this.changeHandler}
                    value={this.state.location.frontage}
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
                <Form.Group controlId="location.intersection">
                  <Form.Label>Intersection</Form.Label>
                  <Form.Control
                    name="location.intersection"
                    as="select"
                    onChange={this.changeHandler}
                    value={this.state.location.intersection}
                  >
                    {crossStreets(this.state.location.frontage).map((s) => (
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
              <Col xs={12} md={6}>
                <Form.Group controlId="url">
                  <Form.Label>Public web site</Form.Label>
                  <Form.Control
                    type="input"
                    name="url"
                    value={this.state.url}
                    placeholder="https://www.example.com"
                    onChange={this.changeHandler}
                  />
                  <Form.Control.Feedback type="invalid">
                    {this.state._error_url}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Your camp's public website, if any. Do not use a Facebook
                    URL here
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group controlId="facebook">
                  <Form.Label>Facebook</Form.Label>
                  <Form.Control
                    type="input"
                    name="facebook"
                    value={this.state.facebook}
                    placeholder="https://www.facebook.com/campname"
                    onChange={this.changeHandler}
                  />
                  <Form.Control.Feedback type="invalid">
                    {this.state._error_facebook}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Your camp's public Facebook page or group, if any. Provide
                    the full URL
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs={12} md={4}>
                <Form.Group controlId="email">
                  <Form.Label>Public Email</Form.Label>
                  <Form.Control
                    type="input"
                    name="email"
                    value={this.state.email}
                    placeholder="info@example.com"
                    onChange={this.changeHandler}
                  />
                  <Form.Control.Feedback type="invalid">
                    {this.state._error_email}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Public email address for inquiries (this will be visible in
                    the directory to anyone!)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="twitter">
                  <Form.Label>Twitter</Form.Label>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>@</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      type="input"
                      name="twitter"
                      value={this.state.twitter}
                      placeholder="example"
                      onChange={this.changeHandler}
                    />
                    <Form.Control.Feedback type="invalid">
                      {this.state._error_twitter}
                    </Form.Control.Feedback>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Your Twitter feed, if any
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={12} md={4}>
                <Form.Group controlId="instagram">
                  <Form.Label>Instagram</Form.Label>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>@</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      type="input"
                      name="instagram"
                      value={this.state.instagram}
                      placeholder="example"
                      onChange={this.changeHandler}
                    />
                    <Form.Control.Feedback type="invalid">
                      {this.state._error_instagram}
                    </Form.Control.Feedback>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Your Instagram feed, if any
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group controlId="thumbnail">
                  <Form.Label>Upload a picture of your camp here</Form.Label>
                  <ImageUploader
                    thumbnail={this.state.thumbnail}
                    onChange={(thumbnail) => {
                      this.setState({ thumbnail: thumbnail });
                    }}
                    s3images={s3images}
                    api={api}
                    onSubmitInProgress={(inProgress) => {
                      this.setState({ _submit_disabled: inProgress });
                    }}
                  />
                  <Form.Text className="text-muted">
                    This picture will appear in the Queerburners directory.
                    Submit a picture of your campers, your frontage, or
                    something else fun, but please keep it SFW!
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group controlId="offerMeals">
                  <Form.Label>Features</Form.Label>
                  <Form.Check
                    type="switch"
                    name="offerMeals"
                    checked={this.state.offerMeals}
                    label="Camp provides some or all meals"
                    onChange={this.changeHandler}
                  />
                </Form.Group>
                <Form.Group controlId="offerWater">
                  <Form.Check
                    type="switch"
                    name="offerWater"
                    checked={this.state.offerWater}
                    label="Camp provides water"
                    onChange={this.changeHandler}
                  />
                </Form.Group>
                <Form.Group controlId="offerShowers">
                  <Form.Check
                    type="switch"
                    name="offerShowers"
                    checked={this.state.offerShowers}
                    label="Camp provides showers"
                    onChange={this.changeHandler}
                  />
                </Form.Group>
                <Form.Group controlId="campFee">
                  <Form.Check
                    type="switch"
                    name="campFee"
                    checked={this.state.campFee}
                    label="There is a fee to camp with us"
                    onChange={this.changeHandler}
                  />
                </Form.Group>
                <Form.Group controlId="virginsWelcome">
                  <Form.Check
                    type="switch"
                    name="virginsWelcome"
                    checked={this.state.virginsWelcome}
                    label="Burning Man first-timers welcome"
                    onChange={this.changeHandler}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col>
                <Form.Group controlId="joinOpen">
                  <Form.Label>Are you open to new members?</Form.Label>
                  <Form.Check
                    type="switch"
                    name="joinOpen"
                    checked={this.state.joinOpen}
                    label="Yes"
                    onChange={this.changeHandler}
                  />
                </Form.Group>
                {this.state.joinOpen && (
                  <div>
                    <Form.Group controlId="joinMessage">
                      <Form.Label>Instructions</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows="3"
                        name="joinMessage"
                        value={this.state.joinMessage}
                        placeholder="Max 255 characters"
                        onChange={this.changeHandler}
                      ></Form.Control>
                      <Form.Control.Feedback type="invalid">
                        {this.state._error_joinMessage}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Provide brief instructions for people who are interested
                        in joining your camp. What should they do next?
                      </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="joinUrl">
                      <Form.Label>URL for application form</Form.Label>
                      <Form.Control
                        type="input"
                        name="joinUrl"
                        value={this.state.joinUrl}
                        placeholder="https://www.example.com"
                        onChange={this.changeHandler}
                      ></Form.Control>{" "}
                      <Form.Control.Feedback type="invalid">
                        {this.state._error_joinUrl}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Provide a link to an application form or information
                        about joining.
                      </Form.Text>
                    </Form.Group>
                  </div>
                )}
              </Col>
            </Row>

            {this.state.contact &&
              this.state.contact.email &&
              this.state.contact.name &&
              this.props.userData.isAdmin && (
                <Row style={{ border: "3px solid #f7f7f7" }}>
                  <Col xs={12} md={4} style={{ backgroundColor: "#f7f7f7" }}>
                    Administrators Only
                    <br />
                    <Form.Text className="text-muted">
                      You are logged on as an administrator so you can edit who
                      owns this camp.{" "}
                      <strong>This private info is not shown to users.</strong>
                    </Form.Text>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group controlId="contact.email">
                      <Form.Label>Private Email</Form.Label>
                      <Form.Control
                        type="input"
                        placeholder="a@example.com"
                        name="contact.email"
                        value={this.state.contact.email}
                        onChange={this.changeHandler}
                      ></Form.Control>
                      <Form.Text className="text-muted">
                        The private email address of the person who submitted
                        this camp. This controls who can edit the camp.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={4}>
                    <Form.Group controlId="contact.name">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="input"
                        placeholder="Pat Burner"
                        name="contact.name"
                        value={this.state.contact.name}
                        onChange={this.changeHandler}
                      ></Form.Control>
                      <Form.Text className="text-muted">
                        The name of the person who submitted this camp.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              )}

            <Row>
              <Col>
                {this.state._error_submit && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => this.setState({ _error_submit: null })}
                  >
                    <Alert.Heading>Error</Alert.Heading>
                    <p>
                      An error occurred and your camp information was not
                      submitted.
                    </p>
                    <p>
                      <strong>{this.state._error_submit}</strong>
                    </p>
                  </Alert>
                )}

                {this.state._submit_in_progress ? (
                  <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                  </Spinner>
                ) : (
                  <span>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={this.state._submit_disabled}
                    >
                      Submit
                    </Button>{" "}
                    {this.props.year && this.props.camp && (
                      <DeleteButton
                        message="Delete this camp?"
                        longMessage="Are you sure you want to permanently delete this theme camp from the Queerburners directory?"
                        apiToDelete={`${api}/camps/${
                          this.state.year
                        }/${encodeURIComponent(this.state.name)}`}
                        redirectOnSuccess={`/year/${this.state.year}`}
                        userData={this.props.userData}
                      />
                    )}
                  </span>
                )}
              </Col>
            </Row>
          </Container>
        </Form>
      );
  }
}
