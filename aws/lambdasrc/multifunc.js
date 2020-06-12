const AWS = require("aws-sdk");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

// Generate unique id with no external dependencies
const generateUUID = () => crypto.randomBytes(16).toString("hex");

const db = new AWS.DynamoDB.DocumentClient();

const campErrors = require("shared").campErrors;
const locationToString = require("shared").locationToString;
const hashEmail = require("shared").hashEmail;

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
  let camp = {
    year: null,
    name: null,
    identifies: "",
    about: "",
    location: { frontage: "Unknown", intersection: "Unknown" },
    url: "",
    facebook: "",
    email: "",
    twitter: "",
    instagram: "",
    thumbnail: "",
  };

  let jsonCamp = {};

  try {
    jsonCamp = JSON.parse(event.body);
  } catch (err) {
    return StandardError("Unable to parse JSON");
  }

  camp = { ...camp, ...jsonCamp };
  camp.location.string = locationToString(
    camp.location.frontage,
    camp.location.intersection
  );
  camp.created = new Date().toISOString();

  //
  // AUTH!
  //

  try {
    const client = new OAuth2Client(process.env.googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: camp.tokenId,
      audience: process.env.googleClientId,
    });
    const payload = ticket.getPayload();
    camp.contact = {
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

  const params = {
    TableName: "camps",
    Item: camp,
  };

  const ce = campErrors(camp);

  if (ce.length > 0) {
    return StandardError(JSON.stringify(ce));
  }

  try {
    const data = await db.put(params).promise();
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
    return StandardResponse(filterPrivateInfo([data.Item])[0]);
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

exports.campsYearNamePut = async (event) => {
  const {
    pathParameters: { year, name },
  } = event; // extract unique id from the request path

  // TODO should check if this item exists and fail if it doesn't

  // extract new parameters, if present, out of the body:
  let update_expression = "set updated = :updated";
  let expression_map = {
    ":updated": new Date().toISOString(),
    ":name": decodeURIComponent(name),
    ":year": Number(year),
  };
  let expression_attribute_names = {
    "#year": "year",
    "#name": "name",
  };

  const a = JSON.parse(event.body);

  for (var key of Object.keys(a)) {
    if (
      [
        "since",
        "identifies",
        "about",
        "placed",
        "location",
        // TODO this should use the same code as POST to compose the object to insert
        // (and also do all the same nice error checking)
      ].includes(key)
    ) {
      update_expression += ", #" + key + " = :" + key;
      expression_map[":" + key] = a[key];
      expression_attribute_names["#" + key] = key;
    }
  }

  const params = {
    TableName: "camps",
    Key: {
      year: Number(year),
      name: decodeURIComponent(name),
    },
    UpdateExpression: update_expression,
    ExpressionAttributeValues: expression_map,
    ConditionExpression: "#year = :year and #name = :name",
    ExpressionAttributeNames: expression_attribute_names,
  };
  try {
    await db.update(params).promise();
    return StandardResponse(null);
  } catch (e) {
    if (e.code === "ConditionalCheckFailedException")
      return {
        statusCode: 500,
        body: "That camp doesn't exist",
      };
    else return StandardError(e);
  }
};
