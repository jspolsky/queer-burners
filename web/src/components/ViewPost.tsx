import React, { useState, VFC, useContext } from "react";
import Link from "next/link";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert";
import UserContext from "./UserContext";

const CONTENT_WARNING_POSTS: string[] = ["history"];

type ViewPostProps = {
  postSlug: string;
  postHtml: string;
};

export const ViewPost: VFC<ViewPostProps> = ({ postSlug, postHtml }) => {
  const { userData } = useContext(UserContext);
  const [showContentWarning, setShowContentWarning] = useState(true);

  return (
    <Container className="qb-textpage">
      {userData.isAdmin ? (
        <Row>
          <Col>
            <div className="alert alert-info" role="alert">
              You are an admin, so you can{" "}
              <Link href={`/editPost/${postSlug}`}>
                <a>edit this post</a>
              </Link>
              .
            </div>
          </Col>
        </Row>
      ) : null}
      <Row>
        <Col>
          <div>
            {CONTENT_WARNING_POSTS.includes(postSlug) && showContentWarning ? (
              <Alert
                variant="warning"
                onClose={() => setShowContentWarning(false)}
                dismissible
              >
                <p>Content warning: Nudity</p>
              </Alert>
            ) : null}
            <div dangerouslySetInnerHTML={{ __html: postHtml }} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewPost;
