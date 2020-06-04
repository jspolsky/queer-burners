const fieldError = (key, value) => {
  let err = "";
  switch (key) {
    case "name":
      if (typeof value !== "string") {
        err = "Camp name is not a string";
      } else if (value.length === 0) {
        err = "Camp name is required";
      } else if (value.length > 50) {
        err = "Camp name is too long by " + (value.length - 50);
      }
      break;
    default:
  }

  return err;
};

const campErrors = (camp) => {
  let errors = [];

  let err = fieldError("name", camp.name);
  if (err !== "") {
    errors.push({
      field: "name",
      err: err,
    });
  }

  return errors;
};

module.exports = {
  fieldError: fieldError,
  campErrors: campErrors,
};
