const fieldError = (key, value) => {
  let err = "";
  switch (key) {
    case "name":
      if (typeof value !== "string") {
        err = "Camp name is not a string";
      } else if (value.length === 0) {
        err = "Camp name is required";
      } else if (value.length > 50) {
        err = `Camp name is too long by ${value.length - 50}`;
      }
      break;

    case "identifies":
      if (typeof value !== "string") {
        err = "identifies is not a string";
      } else if (value === "") {
        err = "identifies is required (try LGBTQ)";
      } else if (!campIdentifications.includes(value)) {
        err = `${value} is not a valid camp identity (try LGBTQ)`;
      }
      break;

    case "about":
      if (typeof value !== "string") {
        err = "about is not a string";
      } else if (value.length > 255) {
        err = `about is too long by ${value.length - 255}`;
      }
      break;
    default:
  }

  return err;
};

const campErrors = (camp) => {
  let errors = [];

  ["name", "identifies", "about"].map((f) => {
    let err = fieldError(f, camp[f]);
    if (err !== "") {
      errors.push({
        field: f,
        err: err,
      });
    }
  });

  return errors;
};

const campIdentifications = [
  "LGBTQ",
  "Lesbian / Female Identified",
  "Gay / Male Identified",
  "Trans / GNC / Non-binary",
  "Ally Camp",
];

module.exports = {
  fieldError: fieldError,
  campErrors: campErrors,
  campIdentifications: campIdentifications,
};
