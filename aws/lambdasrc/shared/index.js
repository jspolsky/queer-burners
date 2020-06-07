const fieldError = (key, value) => {
  let err = "";
  switch (key) {
    case "year":
      if (typeof value !== "number") {
        err = "Year is not a number";
      } else if (value < 2018 || value > 2199) {
        err = "Year out of range";
      }
      break;

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

    case "location":
      if (
        typeof value !== "object" ||
        !value.frontage ||
        !value.intersection ||
        typeof value.frontage !== "string" ||
        typeof value.intersection !== "string"
      ) {
        err =
          "type error - location should be an object with frontage and intersection strings";
      }
      break;

    case "url":
      if (typeof value !== "string") {
        err = "url is not a string";
      } else if (value === "") {
        err = "";
      } else if (value.length > 128) {
        err = `url is too long by ${value.length - 128}`;
      } else if (!validateURL(value)) {
        err = "invalid url";
      } else if (isFacebookURL(value)) {
        err = "use the Facebook field for a Facebook page";
      }
      break;

    case "facebook":
      if (typeof value !== "string") {
        err = "facebook is not a string";
      } else if (value === "") {
        err = "";
      } else if (value.length > 128) {
        err = `facebook is too long by ${value.length - 128}`;
      } else if (!validateURL(value)) {
        err = "invalid facebook url";
      } else if (!isFacebookURL(value)) {
        err = `${value} is not a Facebook page/group`;
      }
      break;

    case "email":
      if (typeof value !== "string") {
        err = "email is not a string";
      } else if (value.length > 256) {
        err = `email is too long by ${value.length - 256}`;
      } else if (value.length > 0 && !validateEmail(value)) {
        err = `'${value}' is not a valid email address`;
      }
      break;

    case "twitter":
      if (typeof value !== "string") {
        err = "twitter is not a string";
      } else if (value.length > 15) {
        err = `twitter is too long by ${value.length - 15}`;
      } else if (!/^[a-z0-9]*$/i.test(value)) {
        err = "invalid twitter name";
      }

      break;

    case "instagram":
      if (typeof value !== "string") {
        err = "instagram is not a string";
      } else if (value.length > 30) {
        err = `instagram is too long by ${value.length - 30}`;
      } else if (!/^[a-z0-9._]*$/i.test(value)) {
        err = "invalid instagram handle";
      }

      break;

    default:
  }

  return err;
};

const campErrors = (camp) => {
  let errors = [];

  [
    "year",
    "name",
    "identifies",
    "about",
    "location",
    "url",
    "facebook",
    "email",
    "twitter",
    "instagram",
  ].map((f) => {
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

const tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
// Thanks to:
// http://fightingforalostcause.net/misc/2006/compare-email-regex.php
// http://thedailywtf.com/Articles/Validating_Email_Addresses.aspx
// http://stackoverflow.com/questions/201323/what-is-the-best-regular-expression-for-validating-email-addresses/201378#201378
const validateEmail = (email) => {
  if (!email) return false;

  if (email.length > 256) return false;

  if (!tester.test(email)) return false;

  // Further checking of some things regex can't handle
  const [account, address] = email.split("@");
  if (account.length > 64) return false;

  const domainParts = address.split(".");
  if (
    domainParts.some(function (part) {
      return part.length > 63;
    })
  )
    return false;

  return true;
};

const validateURL = (s) => {
  let url;

  try {
    url = new URL(s);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

const isFacebookURL = (s) => {
  let url;

  try {
    url = new URL(s);
  } catch (_) {
    return false;
  }

  return ["facebook.com", "www.facebook.com", "m.facebook.com"].includes(
    url.hostname
  );
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

const locationToString = (frontage, intersection) => {
  if (frontage === streets[0]) {
    return streets[0];
  } else if (frontage === "Rod's Road" || frontage === "Center Camp Plaza") {
    // yeah. This is placement's convention because those circular streets
    // don't really have intersections
    return `${frontage} @ ${intersection}`;
  } else {
    return `${frontage} & ${intersection}`;
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
  locationToString: locationToString,
};
