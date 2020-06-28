import React, { useState, useRef, useEffect } from "react";
import Form from "react-bootstrap/Form";
import axios from "axios";
import Image from "react-bootstrap/Image";
import ProgressBar from "react-bootstrap/ProgressBar";
import Button from "react-bootstrap/Button";

import { s3images, api } from "../definitions.js";

export const ImageUploader = (props) => {
  // TODO bug! if user submits too fast, the image is lost. Need to disable Submit while uploading

  const [objectUrl, setObjectUrl] = useState(""); // URL of the image
  const [userFilename, setUserFilename] = useState(""); // what the user thinks the file is called
  const [uploadProgress, setUploadProgress] = useState(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const imageEl = useRef(null);

  useEffect(() => {
    if (props.thumbnail.length > 0 && objectUrl.length === 0) {
      setObjectUrl(`${s3images}/${props.thumbnail}`);
    }

    if (needsScroll) {
      setTimeout(() => {
        imageEl.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        });
      }, 100);
      setNeedsScroll(false);
    }
  }, [props.thumbnail, objectUrl.length, needsScroll]);

  const startUpload = async (event) => {
    if (event.target.files.length === 0) {
      // no picture.
      setUserFilename("");
      return;
    }

    const actualFile = event.target.files[0];

    let ext = "";
    if (["image/jpeg", "image/jpg"].includes(actualFile.type)) {
      ext = "jpg";
    } else if (actualFile.type === "image/png") {
      ext = "png";
    } else {
      // TODO ERROR PLZ
      setObjectUrl("");
      setUserFilename("");
      props.onChange("");
      return;
    }

    setUserFilename(actualFile.name);

    try {
      const uploader = await axios.get(`${api}/camps/pictureuploadurl/${ext}`);

      let image;
      let reader = new FileReader();
      reader.onload = async (e) => {
        image = e.target.result;

        let binary = atob(image.split(",")[1]);
        let array = [];
        for (var i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
        }
        let blobData = new Blob([new Uint8Array(array)], {
          type: uploader.data.contentType,
        });

        await axios.put(uploader.data.url, blobData, {
          headers: {
            "Content-Type": uploader.data.contentType,
          },
          onUploadProgress: (pe) => {
            setUploadProgress(
              pe.lengthComputable
                ? Math.floor((pe.loaded * 100) / pe.total)
                : null
            );
          },
        });

        setObjectUrl(URL.createObjectURL(actualFile));
        props.onChange(uploader.data.fileName);
        setUploadProgress(null);
        setNeedsScroll(true);
      };

      reader.readAsDataURL(actualFile);
    } catch (error) {
      console.error(error);
      console.error(error.response.request.response);
    }
  };

  return (
    <Form.Group controlId="thumbnail">
      <Form.Label>Upload a picture of your camp here</Form.Label>
      <Form.File
        name="thumbnail"
        label={userFilename}
        custom
        accept="image/png|image/jpeg"
        onChange={startUpload}
      />
      {uploadProgress && (
        <ProgressBar striped now={uploadProgress}></ProgressBar>
      )}
      {objectUrl && (
        <div ref={imageEl}>
          <Image src={objectUrl} fluid />
          <Button
            variant="outline-danger"
            onClick={() => {
              props.onChange("");
              setObjectUrl("");
              setUserFilename("");
            }}
          >
            Delete this picture
          </Button>
        </div>
      )}

      <Form.Text className="text-muted">
        This picture will appear in the Queer Burners directory. Submit a
        picture of your campers, your frontage, or something else fun, but
        please keep it SFW!
      </Form.Text>
    </Form.Group>
  );
};
