import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export const EditPosts = (props) => {
  return (
    <Container className="qb-textpage">
      <Row>
        <Col>
          <h1>Edit Posts</h1>

          {props.userData && props.userData.isAdmin ? (
            <p>
              Welcome, Queer Burners admin! This interface lets you edit the
              editorial content of most posts on this site.
            </p>
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
