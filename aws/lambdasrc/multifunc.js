const AWS = require("aws-sdk");
const crypto = require("crypto");
// Generate unique id with no external dependencies
const generateUUID = () => crypto.randomBytes(16).toString("hex");

const db = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const campErrors = require("shared").campErrors;
const locationToString = require("shared").locationToString;

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

// list of attributes which can be seen publically
const publicAttributes = [
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
];

const publicAttributesEAN = publicAttributes.reduce((res, it, i) => {
  res["#" + it] = it;
  return res;
}, {});

const publicAttributesPE = publicAttributes.map((s) => "#" + s).join(",");

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
  };

  let jsonCamp = {};

  try {
    jsonCamp = JSON.parse(event.body);
  } catch (err) {
    return StandardError("Error parsing JSON");
  }

  camp = { ...camp, ...jsonCamp };
  camp.location.string = locationToString(
    camp.location.frontage,
    camp.location.intersection
  );
  camp.created = new Date().toISOString();

  const params = {
    TableName: "camps",
    Item: camp,
  };

  const ce = campErrors(camp);

  if (ce.length > 0) {
    return StandardError(ce);
  }

  try {
    const data = await db.put(params).promise();
    return StandardResponse("Successfully created camp");
  } catch (e) {
    return StandardError(e);
  }
};

exports.campsGet = async (event) => {
  const params = {
    TableName: "camps",
    ExpressionAttributeNames: publicAttributesEAN,
    ProjectionExpression: publicAttributesPE,
  };

  try {
    const data = await db.scan(params).promise();
    return StandardResponse(data.Items);
  } catch (e) {
    return StandardError(e);
  }
};

exports.campsPictureUploadURLGet = async (event) => {
  let {
    pathParameters: { format },
  } = event; // extract format from request path

  if (format === "jpg") {
    format = "jpeg";
  }

  const s3params = {
    Bucket: "queerburnersdirectory.com-images",
    Key: generateUUID(),
    ContentType: `image/${format}`,
    CacheControl: "max-age=31104000",
    ACL: "public-read",
  };

  let fileextension = format;
  if (fileextension === "jpeg") {
    fileextension = "jpg";
  }

  try {
    const uploadURL = s3.getSignedUrl("putObject", s3params);
    return StandardResponse({
      method: "PUT",
      url: uploadURL,
      fileName: `${s3params.Key}.${fileextension}`,
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
    ExpressionAttributeNames: publicAttributesEAN,
    ProjectionExpression: publicAttributesPE,
    ExpressionAttributeValues: {
      ":year": Number(year),
    },
  };

  try {
    const data = await db.query(params).promise();
    return StandardResponse(data.Items);
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
    ExpressionAttributeNames: publicAttributesEAN,
    ProjectionExpression: publicAttributesPE,
  };
  try {
    const data = await db.get(params).promise();
    return StandardResponse(data.Item);
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
