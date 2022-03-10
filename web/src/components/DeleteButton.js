import React, { useState, useRef, useEffect } from "react";
import Button from "react-bootstrap/Button";
import axios from "axios";
import Alert from "react-bootstrap/Alert";
import { useRouter } from "next/router";

const DeleteButton = (props) => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const alertEl = useRef(null);

  useEffect(() => {
    if (needsScroll) {
      alertEl.current.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
      setNeedsScroll(false);
    }
  }, [needsScroll]);

  return (
    <>
      <Button
        variant="outline-danger"
        onClick={() => {
          if (!show) setNeedsScroll(true);
          setShow(!show);
        }}
      >
        Delete
      </Button>
      <div ref={alertEl}>
        <Alert show={show} variant="danger" style={{ marginTop: "1rem" }}>
          <Alert.Heading>{props.message}</Alert.Heading>
          <p>{props.longMessage}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button
              onClick={async () => {
                setShow(false);
                await axios.delete(props.apiToDelete, {
                  auth: {
                    username: props.userData.idToken,
                    password: "",
                  },
                });
                router.push(props.redirectOnSuccess);
              }}
              variant="danger"
            >
              Yes, permanently delete it
            </Button>
            &nbsp;
            <Button onClick={() => setShow(false)} variant="outline-success">
              Cancel
            </Button>
          </div>
        </Alert>
      </div>
    </>
  );
};

export default DeleteButton;
