import React, { useState } from "react";
import { Redirect } from "react-router";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import ProgressBar from "react-bootstrap/ProgressBar";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";

import { defaultYear, api, s3images } from "../definitions.js";
import { fieldError, emptyCamp } from "shared";

import axios from "axios";

const campIdentifications = [...require("shared").campIdentifications];
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
      year: defaultYear,

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
      _upload_progress: null,
      _thumbnail_user_filename: "",
      _thumbnail_object_url: null,
      _submit_in_progress: false,
      _submit_successful: false,
    };

    // if the "camp" prop is present, we are editing an existing camp and camp has
    // the name and year. Let the current data override defaults.
    if (props.camp) {
      this.state = {
        ...this.state,
        ...props.camp,
      };
    }
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

    camp.tokenId = this.props.tokenId;

    // console.log(JSON.stringify(camp));

    try {
      await axios.post(`${api}/camps`, camp, {
        auth: {
          username: this.props.tokenId,
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

  fileUploader = async (event) => {
    if (event.target.files.length === 0) {
      // no picture.
      this.setState({
        thumbnail: "",
        _thumbnail_object_url: null,
        _thumbnail_user_filename: "",
      });
      return;
    }

    const actualFile = event.target.files[0];
    let ext = "";

    if (actualFile.type === "image/jpeg" || actualFile.type === "image/jpg") {
      ext = "jpg";
    } else if (actualFile.type === "image/png") {
      ext = "png";
    } else {
      // TODO ERROR MESSAGE PLZ
      this.setState({
        thumbnail: "",
        _thumbnail_object_url: null,
        _thumbnail_user_filename: "",
      });
      return;
    }

    const fileName = event.target.files[0].name;
    this.setState({
      _thumbnail_user_filename: fileName,
    });

    try {
      const uploader = await axios.get(`${api}/camps/pictureuploadurl/${ext}`);

      let image;
      let reader = new FileReader();
      reader.onload = async (e) => {
        image = e.target.result;

        let binary = atob(image.split(",")[1]);
        let array = [];
        for (var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
        }
        let blobData = new Blob([new Uint8Array(array)], {
          type: uploader.data.contentType,
        });

        await axios.put(uploader.data.url, blobData, {
          headers: {
            "Content-Type": uploader.data.contentType,
          },
          onUploadProgress: (pe) => {
            this.setState({
              _upload_progress: pe.lengthComputable
                ? Math.floor((pe.loaded * 100) / pe.total)
                : null,
            });
          },
        });

        this.setState({
          _thumbnail_object_url: URL.createObjectURL(actualFile),
          thumbnail: uploader.data.fileName,
          _upload_progress: null,
        });
      };

      reader.readAsDataURL(actualFile);
    } catch (error) {
      console.error(error);
      console.error(error.response.request.response);
    }

    // TODO bug! if user submits too fast, the image is lost. Need to disable Submit while uploading
    // TODO throw away files when the user never submits the form, or general s3 garbage collection
    // TODO consider s3 based thumbnailing - reduce size of images to, I think, 318 pixels wide. (but maybe more for retina?)
    //           here is how ---> https://docs.aws.amazon.com/lambda/latest/dg/with-s3-example.html
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

    if (x === "location") {
      if (splitname[1] === "frontage") {
        // constrain intersections to valid cross streets
      }
    }

    this.fieldValidator(event.target.name, y);
  };

  NotLoggedIn() {
    return (
      <Container>
        <Row>
          <Col>
            <h2>Submit your camp to the Queer Burners directory!</h2>
            <p>
              Welcome! We're building a comprehensive list of queer and ally
              theme camps that will participate in Burning Man in {defaultYear}.
            </p>

            <p>
              To add your theme camp to this directory, please start by logging
              in using a Google Account.
            </p>
            <p>
              We will use the email address associated with your Google Account
              to contact you in case of difficulty, but it won't appear in the
              directory. Later if you need to make changes or remove your camp's
              listing, you can do so by logging in again.
            </p>
          </Col>
        </Row>
      </Container>
    );
  }

  Instructions() {
    if (this.props.year && this.props.camp) {
      return (
        <div>
          <h2>{this.props.camp.name}</h2>
          <p>
            Edit any changes in the information for your camp in{" "}
            {this.props.year} and hit Submit.
          </p>
        </div>
      );
    } else {
      return (
        <div>
          <h2>Submit your camp to the Queer Burners directory!</h2>
          <p>
            Welcome! We're building a comprehensive list of queer and ally theme
            camps that will participate in Burning Man in {defaultYear}.
          </p>
          <p>
            To add your theme camp to this directory, please fill out this form.
          </p>
        </div>
      );
    }
  }

  async componentDidMount() {
    if (this.state.name.length === 0) {
      return;
    }
    try {
      // TODO when user is editing a camp, the submit form initially
      // appears empty and then flashes. Try to prevent that.

      const response = await axios.get(
        `${api}/camps/${this.state.year}/${encodeURIComponent(this.state.name)}`
      );
      const data = response.data[0];
      this.setState({ ...data, originalName: data.name });
      if (data.thumbnail && data.thumbnail.length > 0) {
        this.setState({
          _thumbnail_object_url: `${s3images}/${data.thumbnail}`,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    if (this.state._submit_successful) {
      return (
        <Redirect
          to={`/${
            defaultYear !== this.state.year ? "year/" + this.state.year : ""
          }`}
        />
      );
    } else if (!this.props.loggedin) {
      return this.NotLoggedIn();
    } else
      return (
        <Container>
          <Row>
            <Col>
              {this.Instructions()}

              <Form
                noValidate
                validated={this.state._validated}
                onSubmit={this.submitHandler}
              >
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
                      <Form.Control.Feedback type="invalid">
                        {this.state._error_name}
                      </Form.Control.Feedback>
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
                  <Form.Control.Feedback type="invalid">
                    {this.state._error_about}
                  </Form.Control.Feedback>
                </Form.Group>
                <Row>
                  <Col>
                    <Form.Group controlId="location.frontage">
                      <Form.Label>Frontage</Form.Label>
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
                  <Col>
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
                        Your camp's public website, if any. Do not use a
                        Facebook URL here
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col>
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
                        Your camp's public Facebook page or group, if any.
                        Provide the full URL
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Form.Group controlId="email">
                      <Form.Label>Email</Form.Label>
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
                        Public email address for inquiries (this will be visible
                        in the directory to anyone!)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col>
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
                  <Col>
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
                <Form.Group controlId="thumbnail">
                  <Form.Label>Upload a picture of your camp here</Form.Label>
                  <Form.File
                    name="thumbnail"
                    label={this.state._thumbnail_user_filename}
                    custom
                    onChange={this.fileUploader}
                    accept="image/png|image/jpeg"
                  />
                  {this.state._upload_progress && (
                    <ProgressBar
                      striped
                      now={this.state._upload_progress}
                    ></ProgressBar>
                  )}
                  {this.state._thumbnail_object_url && (
                    <div>
                      <Image src={this.state._thumbnail_object_url} fluid />
                      <Button
                        variant="outline-danger"
                        onClick={() =>
                          this.setState({
                            thumbnail: "",
                            _thumbnail_object_url: null,
                            _thumbnail_user_filename: "",
                          })
                        }
                      >
                        Delete this picture
                      </Button>
                    </div>
                  )}
                  <Form.Text className="text-muted">
                    This picture will appear in the Queer Burners directory.
                    Submit a picture of your campers, your frontage, or
                    something else fun, but please keep it SFW!
                  </Form.Text>
                </Form.Group>
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
                    <Button variant="primary" type="submit">
                      Submit
                    </Button>{" "}
                    {this.props.year && this.props.camp && (
                      <DeleteButton
                        year={this.state.year}
                        name={this.state.name}
                        tokenId={this.props.tokenId}
                      />
                    )}
                  </span>
                )}
              </Form>
            </Col>
          </Row>
        </Container>
      );
  }
}

const DeleteButton = (props) => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button variant="outline-danger" onClick={() => setShow(!show)}>
        Delete
      </Button>
      <Alert show={show} variant="danger" style={{ marginTop: "1rem" }}>
        <Alert.Heading>Delete this camp?</Alert.Heading>
        <p>
          Are you sure you want to permanently delete this theme camp from the
          Queer Burners Directory?
        </p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button
            onClick={async () => {
              setShow(false);
              await axios.delete(
                `${api}/camps/${props.year}/${encodeURIComponent(props.name)}`,
                {
                  auth: {
                    username: props.tokenId,
                    password: "",
                  },
                }
              );
              // TODO redirect to home page

              // TODO make sure the alert is scrolled into view so
              // people see it
            }}
            variant="danger"
          >
            Yes, permanently delete it
          </Button>
          &nbsp;
          <Button onClick={() => setShow(false)} variant="outline-success">
            Cancel
          </Button>
        </div>
      </Alert>
    </>
  );
};
