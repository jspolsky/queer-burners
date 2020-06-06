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

//
// Encode a little bit of Burning Man cartography
// If this function is confusing to you, look at a map of Black Rock City
//
const crossStreets = (frontage) => {
  if (frontage === streets[0] /* unknown */) {
    return [streets[0]];
  }
  if (frontage.includes(":")) {
    return streets.filter((s) => s === "Esplanade" || s.length === 1);
  } else {
    return streets.filter((s) => s.includes(":"));
  }
};

const campIdentifications = [
  "LGBTQ",
  "Lesbian / Female Identified",
  "Gay / Male Identified",
  "Trans / GNC / Non-binary",
  "Ally Camp",
];

const streets = [
  "Unknown",
  "Esplanade",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "Rod's Road",
  "Center Camp Plaza",
  "2:00",
  "2:15",
  "2:30",
  "2:45",
  "3:00",
  "3:15",
  "3:30",
  "3:45",
  "4:00",
  "4:15",
  "4:30",
  "4:45",
  "5:00",
  "5:15",
  "5:30",
  "5:45",
  "6:00",
  "6:15",
  "6:30",
  "6:45",
  "7:00",
  "7:15",
  "7:30",
  "7:45",
  "8:00",
  "8:15",
  "8:30",
  "8:45",
  "9:00",
  "9:15",
  "9:30",
  "9:45",
  "10:00",
];

module.exports = {
  fieldError: fieldError,
  campErrors: campErrors,
  campIdentifications: campIdentifications,
  streets: streets,
  crossStreets: crossStreets,
};
