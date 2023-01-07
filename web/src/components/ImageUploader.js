import React, { useState, useRef, useEffect } from "react";
import Form from "react-bootstrap/Form";
import axios from "axios";
import Image from "react-bootstrap/Image";
import ProgressBar from "react-bootstrap/ProgressBar";
import Button from "react-bootstrap/Button";

export const ImageUploader = ({
  thumbnail,
  onChange,
  s3imagesUpload,
  api,
  onSubmitInProgress,
}) => {
  const [objectUrl, setObjectUrl] = useState(""); // URL of the image
  const [userFilename, setUserFilename] = useState(""); // what the user thinks the file is called
  const [uploadProgress, setUploadProgress] = useState(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const imageEl = useRef(null);

  useEffect(() => {
    if (thumbnail.length > 0 && objectUrl.length === 0) {
      setObjectUrl(`${s3imagesUpload}/${thumbnail}`);
    }
  }, [thumbnail, s3imagesUpload, objectUrl.length]);

  useEffect(() => {
    if (needsScroll) {
      setTimeout(() => {
        imageEl.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        });
      }, 100);
      setNeedsScroll(false);
    }
  }, [needsScroll]);

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
      setObjectUrl("");
      setUserFilename("(file must be PNG or JPG)");
      onChange("");
      return;
    }

    setUserFilename(actualFile.name);

    try {
      onSubmitInProgress(true);
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
        onChange(uploader.data.fileName);
        setUploadProgress(null);
        setNeedsScroll(true);
        onSubmitInProgress(false);
      };

      reader.readAsDataURL(actualFile);
    } catch (error) {
      console.error(error);
      console.error(error.response.request.response);
    }
  };

  return (
    <>
      <Form.File
        name="thumbnail"
        id="thumbnail"
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
              onChange("");
              setObjectUrl("");
              setUserFilename("");
            }}
          >
            Delete this picture
          </Button>
        </div>
      )}
    </>
  );
};
