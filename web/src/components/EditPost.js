import React, { useState, useEffect } from "react";
import axios from "axios";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";

import { api } from "../definitions.js";

export const EditPost = (props) => {
  const [path, setPath] = useState("");
  const [description, setDescription] = useState("");
  const [post, setPost] = useState("");
  const [locked, setLocked] = useState(true);
  const [loaded, setLoaded] = useState(false); /// haha locked and loaded haha
  const [pathError, setPathError] = useState(null);
  const [formValidated, setFormValidated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios(`${api}/posts/${props.post}`);
        setPath(result.data.path);
        setDescription(result.data.description);
        setPost(result.data.post);
        setLocked(result.data.locked);
        setLoaded(true);
      } catch (e) {
        setDescription("404 not found");
      }
    };

    fetchData();
  }, [props.post]);

  const changeHandler = (event) => {
    switch (event.target.name) {
      case "path":
        setPath(event.target.value.trim());
        break;

      case "description":
        setDescription(event.target.value);
        break;

      default:
        break;
    }

    setFormValidated(false);
  };

  const submitHandler = async (event) => {
    // TODO copy all that fancy shmancy submit handling (from SubmitBody.js)

    event.preventDefault();
    setFormValidated(true);

    setPathError("");
    document.getElementById("path").setCustomValidity("");

    const tester2 = /\/\//;

    if (path.startsWith("/") || path.endsWith("/") || tester2.test(path)) {
      setPathError(
        "Path should not start or end with /, or contain more than one / in a row"
      );
      document.getElementById("path").setCustomValidity("NOT");
      return;
    }

    const tester = /^[a-zA-Z0-9\-_/]+$/;

    if (!tester.test(path)) {
      setPathError(
        "This would not be a valid URL. Please stick to letters, numbers, -, _, and /"
      );
      document.getElementById("path").setCustomValidity("NOT");
      return;
    }

    console.log(path);
    console.log(description);
  };

  if (!props.userData || !props.userData.isAdmin) {
    return (
      <Container className="qb-textpage">
        <Row>
          <Col>
            <h3>
              You have to be logged on to see this page.
              <br />
              <br />
              <br />
            </h3>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="qb-textpage">
      <Row>
        <Col>
          {!loaded ? (
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <div>
              <h1>Editing one post</h1>
              <Form
                noValidate
                validated={formValidated}
                onSubmit={submitHandler}
              >
                <Form.Group controlId="path">
                  <Form.Label>Path</Form.Label>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>
                        queerburnersdirectory.com/
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      type="input"
                      placeholder="x/y/z"
                      name="path"
                      value={path}
                      readOnly={locked}
                      onChange={changeHandler}
                    ></Form.Control>{" "}
                    <Form.Control.Feedback type="invalid">
                      {pathError}
                    </Form.Control.Feedback>
                  </InputGroup>

                  <Form.Text className="text-muted">
                    The URL where this post appears. Can be multi/part
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="description">
                  <Form.Label>Description</Form.Label>

                  <Form.Control
                    type="description"
                    placeholder=""
                    name="description"
                    value={description}
                    onChange={changeHandler}
                  ></Form.Control>
                  <Form.Text className="text-muted">
                    Describe this post briefly
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="post">
                  <Form.Label>Post</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows="15"
                    placeholder="Blog post here. Use HTML"
                    name="post"
                    onChange={changeHandler}
                    value={post}
                  ></Form.Control>
                </Form.Group>

                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EditPost;
