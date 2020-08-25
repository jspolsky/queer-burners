import React, { useState, useEffect } from "react";
import axios from "axios";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";

import { api } from "../definitions.js";

// TODO CONFIRM LOGGED IN

export const EditPost = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios(`${api}/posts/${props.post}`);
        setData(result.data);
      } catch (e) {
        setData({ post: "<h1>404 Not Found</h1>" });
      }
    };

    fetchData();
  }, [props.post]);

  return (
    <Container className="qb-textpage">
      <Row>
        <Col>
          {data.length === 0 ? (
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <div>
              <h1>Editing one post</h1>
              <Form noValidate>
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
                      value={data.path}
                    ></Form.Control>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    The URL where this post appears
                  </Form.Text>
                </Form.Group>

                <Form.Group controlId="description">
                  <Form.Label>Description</Form.Label>

                  <Form.Control
                    type="description"
                    placeholder=""
                    name="description"
                    value={data.description}
                  ></Form.Control>
                  <Form.Text className="text-muted">
                    Describe this post briefly
                  </Form.Text>
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
