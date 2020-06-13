const AWS = require("aws-sdk");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

// Generate unique id with no external dependencies
const generateUUID = () => crypto.randomBytes(16).toString("hex");

const db = new AWS.DynamoDB.DocumentClient();

const campErrors = require("shared").campErrors;
const locationToString = require("shared").locationToString;
const hashEmail = require("shared").hashEmail;
const emptyCamp = require("shared").emptyCamp;

// TODO StandardResponse and StandardError should be collapsed into one function
const StandardResponse = (o) => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  },
  body: JSON.stringify(o),
});

const StandardError = (e) => ({
  statusCode: 500,
  headers: {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  },
  body: JSON.stringify(e),
});

exports.Options = async (event) => {
  return StandardResponse("Hello!");
};

// list of attributes to pull from database
const queryAttributes = [
  "year",
  "name",
  "created",
  "identifies",
  "about",
  "location",
  "url",
  "facebook",
  "email",
  "twitter",
  "instagram",
  "thumbnail",
  "joinOpen",
  "joinMessage",
  "joinUrl",
  "contact", // careful, this is private data
];

const queryAttributesEAN = queryAttributes.reduce((res, it, i) => {
  res["#" + it] = it;
  return res;
}, {});

const queryAttributesPE = queryAttributes.map((s) => "#" + s).join(",");

const filterPrivateInfo = (arrayOfCamps) => {
  return arrayOfCamps.map((camp) => {
    if (camp.contact) {
      if (camp.contact.email) {
        camp.hashEmail = hashEmail(camp.contact.email);
      }
      delete camp.contact;
    }
    return camp;
  });
};

exports.campsPost = async (event) => {
  //
  // Gather submitted camp data
  //
  let jsonCamp = {};

  try {
    jsonCamp = JSON.parse(event.body);
  } catch (err) {
    return StandardError("Unable to parse JSON");
  }

  let camp = { ...emptyCamp, ...jsonCamp };
  camp.location.string = locationToString(
    camp.location.frontage,
    camp.location.intersection
  );

  //
  // Find out who the remote user is -- it has been
  // passed to us through camp.tokenId, which is
  // an opaque Google token we can use to get real
  // information about the user
  //

  let remoteUser = null;

  try {
    const client = new OAuth2Client(process.env.googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: camp.tokenId,
      audience: process.env.googleClientId,
    });
    const payload = ticket.getPayload();
    remoteUser = {
      google_user_id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    delete camp.tokenId; // don't need to keep this around
  } catch (e) {
    return StandardError(
      "Invalid login token. Try logging out and logging in again."
    );
  }

  //
  // Find out if this camp already exists and if so, who is
  // authorized to edit it
  //

  let params = {
    TableName: "camps",
    Key: {
      year: Number(camp.year),
      name: camp.name,
    },
    ExpressionAttributeNames: queryAttributesEAN,
    ProjectionExpression: queryAttributesPE,
  };

  let newCamp = false;
  let oldcampdata = null;

  // TODO if camp.name !== camp.originalName they are renaming a camp
  // we gotta make sure that they own camp.originalName because it
  // will go away, AND we need to make sure that camp.name doesn't
  // exist because it will get clobbered

  try {
    oldcampdata = await db.get(params).promise();
  } catch (e) {
    newCamp = true;
  }

  if (!oldcampdata || Object.keys(oldcampdata).length === 0) newCamp = true;

  if (newCamp) {
    camp.created = new Date().toISOString();
  } else {
    if (
      !oldcampdata.Item.contact ||
      (oldcampdata.Item.contact.google_user_id !== remoteUser.google_user_id &&
        oldcampdata.Item.contact.email !== remoteUser.email)
    ) {
      return StandardError(
        "Current logged-in user is not the creator of this camp and can't edit it"
      );
    }
    camp.updated = new Date().toISOString();
    camp.created = oldcampdata.Item.created;
  }

  camp.contact = remoteUser;

  params = {
    TableName: "camps",
    Item: camp,
  };

  const ce = campErrors(camp);

  if (ce.length > 0) {
    return StandardError(JSON.stringify(ce));
  }

  // Is this a name change?
  let campToDelete = "";
  if (!!camp.originalName && camp.originalName !== camp.name) {
    campToDelete = camp.originalName;
  }

  try {
    const data = await db.put(params).promise();

    if (campToDelete.length > 0) {
      // this was a name change; delete the original camp
      params.Key = {
        year: Number(camp.year),
        name: campToDelete,
      };
      await db.delete(params).promise();
    }

    return StandardResponse("Successfully created camp");
  } catch (e) {
    return StandardError("Error updating database");
  }
};

exports.campsGet = async (event) => {
  const params = {
    TableName: "camps",
    ExpressionAttributeNames: queryAttributesEAN,
    ProjectionExpression: queryAttributesPE,
  };

  try {
    const data = await db.scan(params).promise();
    return StandardResponse(filterPrivateInfo(data.Items));
  } catch (e) {
    return StandardError(e);
  }
};

exports.campsPictureUploadURLGet = async (event) => {
  var s3 = new AWS.S3();

  let {
    pathParameters: { format },
  } = event; // extract format from request path

  if (format === "jpg") {
    format = "jpeg";
  }

  let fileextension = format;
  if (fileextension === "jpeg") {
    fileextension = "jpg";
  }

  const s3params = {
    Bucket: "queerburnersdirectory.com-images",
    Key: `${generateUUID()}.${fileextension}`,
    ContentType: `image/${format}`,
    Expires: 900 /* 15 min */,
    ACL: "public-read",
  };

  try {
    const uploadURL = s3.getSignedUrl("putObject", s3params);
    return StandardResponse({
      method: "PUT",
      url: uploadURL,
      fileName: s3params.Key,
      contentType: s3params.ContentType,
    });
  } catch (e) {
    return StandardError(e);
  }
};

exports.campsYearGet = async (event) => {
  const {
    pathParameters: { year },
  } = event; // extract year from the request path

  const params = {
    TableName: "camps",
    KeyConditionExpression: "#year = :year",
    ExpressionAttributeNames: queryAttributesEAN,
    ProjectionExpression: queryAttributesPE,
    ExpressionAttributeValues: {
      ":year": Number(year),
    },
  };

  try {
    const data = await db.query(params).promise();
    return StandardResponse(filterPrivateInfo(data.Items));
  } catch (e) {
    return StandardError(e);
  }
};

exports.campsYearNameGet = async (event) => {
  const {
    pathParameters: { year, name },
  } = event; // extract unique id from the request path

  const params = {
    TableName: "camps",
    Key: {
      year: Number(year),
      name: decodeURIComponent(name),
    },
    ExpressionAttributeNames: queryAttributesEAN,
    ProjectionExpression: queryAttributesPE,
  };
  try {
    const data = await db.get(params).promise();
    return StandardResponse(filterPrivateInfo([data.Item]));
  } catch (e) {
    return StandardError(e);
  }
};

exports.campsYearNameDelete = async (event) => {
  const {
    pathParameters: { year, name },
  } = event; // extract unique id from the request path

  const params = {
    TableName: "camps",
    Key: {
      year: Number(year),
      name: decodeURIComponent(name),
    },
  };
  try {
    await db.delete(params).promise();
    return StandardResponse(null);
  } catch (e) {
    return StandardError(e);
  }
};

exports.isAdmin = async (event) => {
  const {
    pathParameters: { idToken },
  } = event; // extract idToken from request path

  let remoteUser = null;

  try {
    const client = new OAuth2Client(process.env.googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.googleClientId,
    });
    const payload = ticket.getPayload();
    remoteUser = {
      google_user_id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    // TODO query the database maybe for a list of admins
    return StandardResponse(remoteUser.email === "joel@spolsky.com");
  } catch (e) {
    return StandardError(
      "Invalid login token. Try logging out and logging in again."
    );
  }
};
