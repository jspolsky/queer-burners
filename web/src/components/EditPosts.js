import React, { useState, useEffect } from "react";
import axios from "axios";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";

import { api } from "../definitions.js";

export const EditPosts = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(`${api}/posts`);

      setData(result.data);
      console.log(result.data);
    };

    if (props.userData && props.userData.isAdmin) {
      fetchData();
    }
  }, [props.userData]);

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
          <h1>Edit Posts</h1>

          {data.length === 0 ? (
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <>
              <Table bordered hover>
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Description</th>
                    <th>&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((i) => (
                    <tr key={i.path}>
                      <td>/{i.path}</td>
                      <td>{i.description}</td>
                      <td>View | Edit | Delete</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p>+ Add a new post</p>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EditPosts;
