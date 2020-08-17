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

  return (
    <Container className="qb-textpage">
      <Row>
        <Col>
          <h1>Edit Posts</h1>

          {props.userData && props.userData.isAdmin ? (
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
                    <tr>
                      <td>/{i.path}</td>
                      <td>{i.description}</td>
                      <td>View | Edit | Delete</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p>+ Add a new post</p>
            </>
          ) : (
            <p>
              You must be logged on as an administrator to edit posts on this
              site.
            </p>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EditPosts;
