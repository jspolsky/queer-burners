import type { NextPage } from "next";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import axios from "axios";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Table from "react-bootstrap/Table";

import { api } from "../definitions.js";
import UserContext from "../components/UserContext";

const EditPostsPage: NextPage = () => {
  const { userData } = useContext(UserContext);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(`${api}/posts`);

      const sortedPosts = result.data.sort((a: any, b: any) =>
        a.path.localeCompare(b.path)
      );

      setData(sortedPosts);
    };

    if (userData && userData.isAdmin) {
      fetchData();
    }
  }, [userData]);

  if (!userData || !userData.isAdmin) {
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
                  {data.map((i: any) => (
                    <tr key={i.path}>
                      <td>/{i.path}</td>
                      <td>{i.description}</td>
                      <td>
                        <Link href={i.path}>
                          <a>View</a>
                        </Link>
                        &nbsp;|&nbsp;
                        <Link href={`/editPost/${i.path}`}>
                          <a>Edit</a>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p>
                <Link href={"/newPost"}>+ Add a new post</Link>
              </p>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EditPostsPage;
