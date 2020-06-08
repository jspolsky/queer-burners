import React from "react";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import ProgressBar from "react-bootstrap/ProgressBar";

import { defaultYear } from "../definitions.js";
import { fieldError } from "shared";

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
      name: "",
      identifies: campIdentifications[0],
      about: "",
      location: {
        frontage: streets[0],
        intersection: streets[0],
      },
      url: "",
      facebook: "",
      email: "",
      twitter: "",
      instagram: "",
      thumbnail: "",

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
      _upload_progress: null,
      _thumbnail_user_filename: "",
    };
  }

  submitHandler = async (event) => {
    event.preventDefault();
    this.setState({ _validated: true });

    var camp = {
      year: defaultYear,
    };
    for (var key in this.state) {
      if (!key.startsWith("_")) {
        camp[key] = this.state[key];
        if (typeof camp[key] === "string") {
          camp[key] = camp[key].trim();
        }
      }
    }

    for (var x of [
      "name",
      "about",
      "url",
      "facebook",
      "email",
      "twitter",
      "instagram",
    ]) {
      if (!this.fieldValidator(x, camp[x])) {
        return null;
      }
    }

    console.log("submitting");
    console.log(JSON.stringify(camp));

    // TODO if the API returns an error the user never finds out?

    // TODO if the API returns success we should redirect to some kind of success page?

    try {
      // TODO this URL should be in one place
      await axios.post(
        "https://l374cc62kc.execute-api.us-east-2.amazonaws.com/Prod/camps",
        camp
      );
    } catch (error) {
      console.error(error);
      console.error(error.response);
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
      const uploader = await axios.get(
        `https://l374cc62kc.execute-api.us-east-2.amazonaws.com/Prod/camps/pictureuploadurl/${ext}`
      );

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

    // TODO throw away files when the user never submits the form, or general s3 garbage collection
    // TODO consider s3 based thumbnailing - reduce size of images to, I think, 318 pixels. (but maybe more for retina?)
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
                        Delete
                      </Button>
                    </div>
                  )}
                  <Form.Text className="text-muted">
                    This picture will appear in the Queer Burners directory.
                    Submit a picture of your campers, your frontage, or
                    something else fun, but please keep it SFW!
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="join.open">
                  <Form.Label>Are you open to new members?</Form.Label>
                  <Form.Check
                    type="switch"
                    name="join.open"
                    label="Yes"
                    onChange={this.changeHandler}
                  />
                </Form.Group>
                <Form.Group controlId="join.message">
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

                <Button variant="primary" type="submit">
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
