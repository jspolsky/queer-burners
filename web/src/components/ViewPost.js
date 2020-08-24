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
            <div dangerouslySetInnerHTML={{ __html: data.post }} />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ViewPost;
