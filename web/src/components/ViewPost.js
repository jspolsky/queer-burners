import React, { useState, useEffect } from "react";
import axios from "axios";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { api } from "../definitions.js";

export const ViewPost = (props) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(`${api}/posts`);

      setData(result.data);
      console.log(result.data);
    };

    fetchData();
  }, []);

  return (
    <Container className="qb-textpage">
      <Row>
        <Col>
          <h1>View One Post, vis {props.post}</h1>

          {data.length === 0 ? (
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <>hi bub</>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ViewPost;
