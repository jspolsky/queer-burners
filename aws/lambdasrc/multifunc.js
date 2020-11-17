const AWS = require("aws-sdk");
const crypto = require("crypto");
const sharp = require("sharp");
const axios = require("axios");

const { OAuth2Client } = require("google-auth-library");

// Generate unique id with no external dependencies
const generateUUID = () => crypto.randomBytes(16).toString("hex");

const db = new AWS.DynamoDB.DocumentClient();

const campErrors = require("shared").campErrors;
const locationToString = require("shared").locationToString;
const hashEmail = require("shared").hashEmail;
const emptyCamp = require("shared").emptyCamp;

const StandardResponse = (o) => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE",
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

const NotFound = (e) => ({
  statusCode: 404,
  headers: {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  },
  body: JSON.stringify(e),
});

// for preflight CORS:
exports.Options = async (event) => {
  return StandardResponse("Hello!");
};

// list of attributes to pull from database (for camps)
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
  "fullSizeImage",
  "offerMeals",
  "offerWater",
  "offerShowers",
  "campFee",
  "virginsWelcome",
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

const isEmailAdmin = async (email) => {
  const params = {
    TableName: "SiteAdmins",
    Key: {
      email: email,
    },
  };

  try {
    const admins = await db.get(params).promise();
    return Object.keys(admins).length > 0;
  } catch (e) {
    console.error(e);
  }

  return false;
};

const LookupToken = async (idToken) => {
  try {
    const client = new OAuth2Client(process.env.googleClientId);

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.googleClientId,
    });
    const payload = ticket.getPayload();
    return {
      google_user_id: payload.sub,
      email: payload.email,
      name: payload.name,
      isadmin: await isEmailAdmin(payload.email),
      imageUrl: payload.picture,
      duration: payload.exp - payload.iat,
    };
  } catch (e) {
    return null;
  }
};

const GetRemoteUser = async (event) => {
  if (
    !event.headers.Authorization ||
    !event.headers.Authorization.startsWith("Basic ")
  ) {
    return null;
  }

  const base64src = event.headers.Authorization.substring(6);
  const up = Buffer.from(base64src, "base64").toString("ascii");
  const idToken = up.split(":")[0];

  return LookupToken(idToken);
};

exports.GoogleIdTokenFromAuthCode = async (event) => {
  try {
    const js = JSON.parse(event.body);
    const code = js.code;
    const redirectUri = js.redirect_uri;
    let googleSecretId = process.env.googleSecretId;
    if (googleSecretId === "ItsASecretDumbass") {
      googleSecretId = process.env.googleSecretId2; // this needs to be set from aws lambda console for this function https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/qb-google-idtoken-from-authcode?tab=configuration
    }

    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code: code,
      client_id: process.env.googleClientId,
      client_secret: googleSecretId,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    let result = await LookupToken(response.data.id_token);
    result.idToken = response.data.id_token;
    result.refreshToken = response.data.refresh_token;

    return StandardResponse(result);
  } catch (error) {
    console.log("An error occurred logging someone on.");
    console.log(error.response.data);
    return StandardError(error.response.data);
  }
};

exports.RefreshExpiredToken = async (event) => {
  try {
    const js = JSON.parse(event.body);
    const refreshToken = js.refreshToken;
    let googleSecretId = process.env.googleSecretId;
    if (googleSecretId === "ItsASecretDumbass") {
      googleSecretId = process.env.googleSecretId2; // this needs to be set from aws lambda console for this function https://us-east-2.console.aws.amazon.com/lambda/home?region=us-east-2#/functions/qb-google-idtoken-from-authcode?tab=configuration
    }

    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: process.env.googleClientId,
      client_secret: googleSecretId,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    return StandardResponse(response.data);
  } catch (error) {
    console.log("Error refreshing token");
    console.log(error.response.data);
    return StandardError(error.response.data);
  }
};

//
// this function takes a camp where the thumbnail has been uploaded to s3,
// but is probably too large, and resizes the thumbnail to something reasonable.
// The fullSizeImage field is set to the original image as submitted.
//
const makeThumbnail = async (camp) => {
  console.log(
    `thumbnail = ${camp.thumbnail} and fullSizeImage = ${camp.fullSizeImage}`
  );

  if (!camp.thumbnail) return;
  if (camp.thumbnail.startsWith("thumb")) return;

  try {
    const s3 = new AWS.S3();

    console.log("going to s3...");

    const params = {
      Bucket: "queerburnersdirectory.com-images", // TODO move to constant
      Key: camp.thumbnail,
    };
    const origimage = await s3.getObject(params).promise();
    console.log(
      `an image was loaded of size ${origimage.ContentLength} type ${origimage.ContentType}`
    );

    var buffer = await sharp(origimage.Body).resize({ width: 960 }).toBuffer();

    // Upload the thumbnail image to the destination bucket
    const destparams = {
      Bucket: "queerburnersdirectory.com-images", // TODO move to constant,
      Key: `thumb${camp.thumbnail}`,
      Body: buffer,
      ContentType: origimage.ContentType,
      ACL: "public-read",
    };

    const putResult = await s3.putObject(destparams).promise();
    console.log("Successfully resized");

    // Update the database

    console.log(JSON.stringify(queryAttributesEAN));

    const updateParams = {
      TableName: "camps",
      Key: {
        year: Number(camp.year),
        name: camp.name,
      },
      UpdateExpression:
        "set fullSizeImage = :fullSizeImage, thumbnail = :thumbnail",
      ExpressionAttributeValues: {
        ":thumbnail": destparams.Key,
        ":fullSizeImage": camp.thumbnail,
      },
    };

    await db.update(updateParams).promise();
  } catch (error) {
    console.log(error);
    return;
  }
};

//
// Call makeThumbnail for a single camp
//
exports.campsYearNameThumbnail = async (event) => {
  const params = {
    TableName: "camps",
    Key: {
      year: Number(event.year),
      name: event.name,
    },
    ExpressionAttributeNames: queryAttributesEAN,
    ProjectionExpression: queryAttributesPE,
  };
  try {
    const data = await db.get(params).promise();
    const dtStart = new Date();
    await makeThumbnail(data.Item);
    console.log(
      `Created thumbnail for ${event.year} ${event.name} in ${
        new Date() - dtStart
      } ms`
    );
    return StandardResponse("Created thumbnail");
  } catch (e) {
    return StandardError(e);
  }
};

exports.campsPost = async (event) => {
  //
  // camp - the camp as submitted
  // originalcamp - if camp.originalName exists and is !== camp.name, we are renaming. This is the original camp
  // clobberedcamp - if camp.originalName exists and is !== camp.name, we are renaming; this is the camp that would be clobbered
  //                  .... which won't be permitted
  //

  // Gather submitted camp data
  //
  let jsonCamp = {};
  let params;

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
  // Find out who the remote user is
  //

  const remoteUser = await GetRemoteUser(event);
  if (!remoteUser) {
    return StandardError("You must be logged on to create or edit a camp");
  }

  const renaming = !!camp.originalName && camp.originalName !== camp.name;

  // noclobber -- if renaming, load the NEW NAME camp and it BETTER NOT EXIST

  if (renaming) {
    params = {
      TableName: "camps",
      Key: {
        year: Number(camp.year),
        name: camp.name,
      },
      ExpressionAttributeNames: queryAttributesEAN,
      ProjectionExpression: queryAttributesPE,
    };

    let clobberedcamp = null;

    try {
      clobberedcamp = await db.get(params).promise();
    } catch (e) {}

    if (clobberedcamp && Object.keys(clobberedcamp).length > 0) {
      return StandardError("A camp with that name already exists");
    }
  }

  //
  // Find out if this camp already exists and if so, who is
  // authorized to edit it
  //

  params = {
    TableName: "camps",
    Key: {
      year: Number(camp.year),
      name: renaming ? camp.originalName : camp.name,
    },
    ExpressionAttributeNames: queryAttributesEAN,
    ProjectionExpression: queryAttributesPE,
  };

  let newCamp = false;
  let originalcamp = null;

  try {
    originalcamp = await db.get(params).promise();
  } catch (e) {
    newCamp = true;
  }

  if (!originalcamp || Object.keys(originalcamp).length === 0) newCamp = true;

  if (newCamp) {
    camp.created = new Date().toISOString();
    camp.contact = remoteUser;
  } else {
    if (
      !originalcamp.Item.contact ||
      (originalcamp.Item.contact.google_user_id !== remoteUser.google_user_id &&
        originalcamp.Item.contact.email !== remoteUser.email &&
        !remoteUser.isadmin)
    ) {
      return StandardError(
        "Current logged-in user is not the creator of this camp and can't edit it"
      );
    }
    camp.updated = new Date().toISOString();
    camp.created = originalcamp.Item.created;

    // When non-admins submit a change, they do not provide contact info because it can't be changing
    // When admins submit a change, they do provide contact info because they are allowed to change it
    if (!remoteUser.isadmin) {
      camp.contact = originalcamp.Item.contact;
    }
  }

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
  if (renaming) {
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

    const lambda = new AWS.Lambda();

    const lambdaParams = {
      FunctionName: "qb-camps-year-name-thumbnail",
      InvocationType: "Event",
      Payload: JSON.stringify({ year: camp.year, name: camp.name }),
    };

    await lambda.invoke(lambdaParams).promise();

    return StandardResponse("Successfully created camp");
  } catch (e) {
    console.error(e);
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

  const remoteUser = await GetRemoteUser(event);

  const params = {
    TableName: "camps",
    KeyConditionExpression: "#year = :year",
    ExpressionAttributeNames: queryAttributesEAN,
    ProjectionExpression: queryAttributesPE,
    ExpressionAttributeValues: {
      ":year": Number(year),
    },
    FilterExpression: "attribute_not_exists(deleted)",
  };

  try {
    const data = await db.query(params).promise();
    let camps = data.Items.sort((a, b) => a.name.localeCompare(b.name));
    if (!remoteUser || !remoteUser.isadmin) {
      camps = filterPrivateInfo(camps);
    }
    return StandardResponse(camps);
  } catch (e) {
    return StandardError(e);
  }
};

exports.myCampsGet = async (event) => {
  const remoteUser = await GetRemoteUser(event);

  if (!remoteUser) {
    return StandardError("You are not logged on");
  }

  const params = {
    TableName: "camps",
    ExpressionAttributeNames: { "#name": "name", "#year": "year" },
    ProjectionExpression: "#name, #year, contact",
    FilterExpression: "attribute_not_exists(deleted)",
  };

  try {
    const data = await db.scan(params).promise();
    let camps = data.Items.filter((x) => x.contact.email === remoteUser.email);
    return StandardResponse(camps);
  } catch (e) {
    return StandardError(e);
  }
};

exports.campsYearNameGet = async (event) => {
  const {
    pathParameters: { year, name },
  } = event; // extract unique id from the request path

  const remoteUser = await GetRemoteUser(event);

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
    let data = await db.get(params).promise();
    if (!remoteUser || !remoteUser.isadmin) {
      return StandardResponse(filterPrivateInfo([data.Item]));
    } else {
      return StandardResponse([data.Item]);
    }
  } catch (e) {
    return StandardError(e);
  }
};

exports.campsYearNameDelete = async (event) => {
  try {
    const {
      pathParameters: { year, name },
    } = event; // extract unique id and permissions from the request path

    const remoteUser = await GetRemoteUser(event);

    if (!remoteUser) {
      return StandardError("Must be logged on to delete a camp");
    }

    let params = {
      TableName: "camps",
      Key: {
        year: Number(year),
        name: decodeURIComponent(name),
      },
      ExpressionAttributeNames: queryAttributesEAN,
      ProjectionExpression: queryAttributesPE,
    };

    let permitted = false;
    if (remoteUser.isadmin) {
      permitted = true;
    } else {
      // check if it's theirs
      const data = await db.get(params).promise();
      if (
        data.Item &&
        data.Item.contact &&
        data.Item.contact.email === remoteUser.email
      ) {
        permitted = true;
      }
    }

    if (!permitted) {
      return StandardError("You do not have permission to delete that camp");
    }

    params = {
      TableName: "camps",
      Key: {
        year: Number(year),
        name: decodeURIComponent(name),
      },
      UpdateExpression: "set deleted = :deleted",
      ExpressionAttributeValues: {
        ":deleted": new Date().toISOString(),
      },
    };

    await db.update(params).promise();
    return StandardResponse(null);
  } catch (e) {
    console.log(e);
    return StandardError(e);
  }
};

exports.isAdmin = async (event) => {
  const remoteUser = await GetRemoteUser(event);
  return StandardResponse(remoteUser && remoteUser.isadmin);
};

//
//
//
//  P O S T S
//
//  Because every sufficiently complicated website contains
//  an ad hoc, informally-specified, bug-ridden, slow implementation
//  of half of WordPress.
//
//
//

// list of attributes to pull from database (for posts)
const queryAttributesPosts = ["path", "description", "locked"];

const queryAttributesPostsEAN = queryAttributesPosts.reduce((res, it, i) => {
  res["#" + it] = it;
  return res;
}, {});

const queryAttributesPostsPE = queryAttributesPosts
  .map((s) => "#" + s)
  .join(",");

exports.postsGet = async (event) => {
  const params = {
    TableName: "posts",
    ExpressionAttributeNames: queryAttributesPostsEAN,
    ProjectionExpression: queryAttributesPostsPE,
    FilterExpression: "attribute_not_exists(deleted)",
  };

  try {
    const data = await db.scan(params).promise();
    return StandardResponse(data.Items);
  } catch (e) {
    return StandardError(e);
  }
};

exports.postsGet1 = async (event) => {
  const path = event.pathParameters.path; // extract post path from the request path

  const params = {
    TableName: "posts",
    Key: {
      path: event.pathParameters.path,
    },
    AttributesToGet: ["path", "description", "locked", "post", "deleted"],
  };

  try {
    const posts = await db.get(params).promise();
    if (Object.keys(posts).length === 0 || posts.Item.deleted) {
      return NotFound("Not found");
    } else {
      return StandardResponse(posts.Item);
    }
  } catch (e) {
    return StandardError(e);
  }
};

exports.postsDelete = async (event) => {
  const path = event.pathParameters.path; // extract post path from the request path

  const remoteUser = await GetRemoteUser(event);
  if (!remoteUser) {
    return StandardError("Must be logged on as admin to delete a post");
  }

  if (!remoteUser.isadmin) {
    return StandardError("Must be logged on as an admin to delete a post");
  }

  params = {
    TableName: "posts",
    Key: {
      path: path,
    },
    UpdateExpression: "set deleted = :deleted",
    ExpressionAttributeValues: {
      ":deleted": new Date().toISOString(),
    },
  };

  try {
    await db.update(params).promise();
    return StandardResponse(null);
  } catch (e) {
    console.log(e);
    return StandardError(e);
  }
};

exports.postsPost = async (event) => {
  const remoteUser = await GetRemoteUser(event);
  if (!remoteUser || !remoteUser.isadmin) {
    return StandardError(
      "You must be logged on as an admin to create or edit a post"
    );
  }

  let post = {};
  try {
    post = JSON.parse(event.body);
  } catch (err) {
    return StandardError("Unable to parse JSON");
  }

  // does post.path already exist? This is an edit.
  let params = {
    TableName: "posts",
    Key: {
      path: post.path,
    },
    AttributesToGet: ["path", "createdBy", "createTime"],
  };

  let originalPost = null;

  try {
    originalPost = await db.get(params).promise();
  } catch (e) {
    return StandardError("Error checking if post exists");
  }

  const newPost = Object.keys(originalPost).length === 0;

  post.lastEditedBy = remoteUser.email;
  post.lastEditedTime = new Date().toISOString();

  if (newPost) {
    post.createdBy = post.lastEditedBy;
    post.createTime = post.lastEditedTime;
  } else {
    post.createdBy = originalPost.Item.createdBy;
    post.createTime = originalPost.Item.createTime;
  }

  params = {
    TableName: "posts",
    Item: post,
  };

  try {
    const data = await db.put(params).promise();
  } catch (e) {
    return StandardError("Error updating post");
  }

  return StandardResponse("Ok");
};
