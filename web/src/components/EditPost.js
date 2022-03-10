import React, { useState, useEffect, useContext } from "react";
import axios from "axios";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

import { Editor } from "@tinymce/tinymce-react";
import DeleteButton from "./DeleteButton.js";

import { api, apiKeyTinyMCE } from "../definitions.js";
import UserContext from "./UserContext";

export const EditPost = (props) => {
  const { userData } = useContext(UserContext);
  const [path, setPath] = useState("");
  const [description, setDescription] = useState("");
  const [post, setPost] = useState("");
  const [locked, setLocked] = useState(true);
  const [loaded, setLoaded] = useState(false); /// haha locked and loaded haha
  const [pathError, setPathError] = useState(null);
  const [formValidated, setFormValidated] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [saveError, setSaveError] = useState(null);

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

    if (props.post) {
      fetchData();
    } else {
      setLoaded(true);
      setLocked(false);
      setPost("<h1>Type your title here</h1><p>Type your post here</p>");
    }
  }, [props.post]);

  const changeHandler = (event) => {
    switch (event.target.name) {
      case "path":
        setPath(event.target.value.trim());
        break;

      case "description":
        setDescription(event.target.value);
        break;

      case "post":
        setPost(event.target.value);
        break;

      default:
        break;
    }

    setFormValidated(false);
  };

  const saveHandler = async (event) => {
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

    if (path === "") {
      setPathError("Specify the URL path where this post can be seen");
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

    const postToSubmit = {
      path: path,
      description: description,
      post: post,
      locked: locked,
    };

    setSaveInProgress(true);

    try {
      await axios.post(`${api}/posts`, postToSubmit, {
        auth: {
          username: userData.idToken,
          password: "",
        },
      });
      setLocked(true);
      setSaveInProgress(false);
    } catch (error) {
      let msg = "";
      if (error.response) {
        // server returned error
        msg = `Error ${error.response.status}: ${error.response.data}`;
      } else if (error.request) {
        msg = "Error: Network error (no response received)";
      } else {
        msg = error.message;
      }
      console.error(msg);
      console.error(error);
      setSaveInProgress(false);
      setSaveError(msg);
    }
  };

  const imageUploadHandler = async (blobInfo, success, failure, progress) => {
    const localFilename = blobInfo.filename();
    const re = /(?:\.([^.]+))?$/; // https://stackoverflow.com/q/680929
    const localExtension = re.exec(localFilename)[1];

    console.log(blobInfo);
    console.log(localFilename);
    console.log(localExtension);

    if (!["png", "jpg", "jpeg"].includes(localExtension)) {
      console.log("Only JPG or PNG files can be uploaded");
      failure("Only JPG or PNG files can be uploaded");
      return;
    }

    progress(1);
    const uploader = await axios.get(
      `${api}/camps/pictureuploadurl/${localExtension}`
    );
    console.log(uploader);
    progress(10);

    await axios.put(uploader.data.url, blobInfo.blob(), {
      headers: {
        "Content-Type": uploader.data.contentType,
      },
      onUploadProgress: (pe) => {
        progress(
          pe.lengthComputable ? Math.floor((pe.loaded * 100) / pe.total) : 50
        );
      },
    });

    success(
      `https://s3.us-east-2.amazonaws.com/queerburnersdirectory.com-images/${uploader.data.fileName}`
    );
  };

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
          {!loaded ? (
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            <div>
              <h1>Editing one post</h1>
              <Form noValidate validated={formValidated}>
                <Form.Group controlId="path">
                  <Form.Label>Path</Form.Label>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>queerburners.org/</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      type="input"
                      placeholder=""
                      name="path"
                      value={path}
                      readOnly={locked || props.post}
                      onChange={changeHandler}
                    ></Form.Control>{" "}
                    <Form.Control.Feedback type="invalid">
                      {pathError}
                    </Form.Control.Feedback>
                  </InputGroup>

                  <Form.Text className="text-muted">
                    The URL where this post appears. Can be multi/part, but can
                    never be changed (to change it, create a new post and copy
                    everything over)
                  </Form.Text>
                </Form.Group>
                <Form.Group controlId="description">
                  <Form.Label>Description</Form.Label>

                  <Form.Control
                    type="description"
                    placeholder="Describe this post briefly"
                    name="description"
                    value={description}
                    onChange={changeHandler}
                  ></Form.Control>
                  <Form.Text className="text-muted">
                    Description for admins, not shown to public
                  </Form.Text>
                </Form.Group>
                <Editor
                  value={post}
                  apiKey={apiKeyTinyMCE}
                  init={{
                    height: 500,
                    menubar: false,
                    images_upload_handler: imageUploadHandler,
                    image_caption: true,
                    // image_class_list: [
                    //   { title: "None", value: "" },
                    //   { title: "Dog", value: "dog" },
                    //   { title: "Cat", value: "cat" },
                    // ],
                    plugins: [
                      "advlist autolink emoticons lists link image",
                      "charmap print preview anchor help",
                      "searchreplace visualblocks code",
                      "insertdatetime media table paste wordcount",
                    ],
                    block_formats:
                      "Paragraph=p; Title=h1; Header 2=h2; Header 3=h3",
                    toolbar:
                      "undo redo removeformat | formatselect | bold italic | alignleft aligncenter alignright | image link | blockquote bullist numlist outdent indent | charmap emoticons | code help",
                  }}
                  onEditorChange={(change) => {
                    setPost(change);
                    setFormValidated(false);
                  }}
                />
                <br />
                {saveError && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setSaveError(null)}
                  >
                    <Alert.Heading>Error</Alert.Heading>
                    <p>An error occurred and this blog post was not saved.</p>
                    <p>
                      <strong>{saveError}</strong>
                    </p>
                  </Alert>
                )}
                <Button target="_blank" href={"/" + path}>
                  Preview
                </Button>
                &nbsp;
                <Button
                  variant="primary"
                  onClick={saveHandler}
                  disabled={saveInProgress}
                >
                  Save
                </Button>
                {saveInProgress && <span>Saving...</span>}{" "}
                {!locked && props.post && (
                  <DeleteButton
                    message="Delete this post?"
                    longMessage="Are you sure you want to permanently delete this entire post from the site?"
                    apiToDelete={`${api}/posts/${path}`}
                    redirectOnSuccess="/editPosts"
                    userData={userData}
                  />
                )}
              </Form>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default EditPost;
