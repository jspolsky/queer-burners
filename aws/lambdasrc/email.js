const AWS = require("aws-sdk");
const ses = new AWS.SES({ region: "us-east-1" });
const nodemailer = require("nodemailer");
const db = new AWS.DynamoDB.DocumentClient();

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

// list of attributes to pull from database
const queryAttributes = [
  "year",
  "name",
  "created",
  "identifies",
  "about",
  "location",
  "thumbnail",
];

const queryAttributesEAN = queryAttributes.reduce((res, it, i) => {
  res["#" + it] = it;
  return res;
}, {});

const queryAttributesPE = queryAttributes.map((s) => "#" + s).join(",");

const formatCampCardForEmail = (camp) => {
  let result = "";

  if (camp.thumbnail) {
    result += `
        <img
        src="https://s3.us-east-2.amazonaws.com/queerburnersdirectory.com-images/${camp.thumbnail}"
        style="
          border-style: none;
          width: 75%;
          border-radius: 0.25rem;
        " />`;
  }

  result += `
        <h5 style="font-weight: bold; font-size: 1.25rem;">
            ${camp.name}
        </h5>
        <div
        style="
            font-weight: 500;
            line-height: 1.2;
            font-size: 1rem;
            color: #6c757d !important;
        "
        >
        ${camp.identifies}
        <br />
        ${camp.location.string}
        </div>

        <div style="            
            font-weight: 500;
            line-height: 1.2;
            font-size: 1rem;
        ">
        ${camp.about}
        </div>
        `;

  return result;
};

exports.sendDailyEmail = async (event) => {
  try {
    let queryParams;
    let data;
    let camps;
    let fAnyChanges = false;
    let htmlMail = "<!doctype html>\n";

    // query new camps -- created within last 24:01 hours (the extra minute is to prevent camps sneaking through)
    queryParams = {
      TableName: "camps",
      ExpressionAttributeNames: queryAttributesEAN,
      ProjectionExpression: queryAttributesPE,
      FilterExpression: "created > :yesterday",
      ExpressionAttributeValues: {
        ":yesterday": new Date(new Date() - 86460000).toISOString(),
      },
    };

    data = await db.scan(queryParams).promise();

    if (data.Items.length > 0) {
      fAnyChanges = true;
      camps = data.Items.sort((a, b) => a.name.localeCompare(b.name));
      htmlMail += `
        <h3>New camps submitted in the last 24 hours</h3>
        ${camps.map(formatCampCardForEmail).join("<br /><br />")}`;
    }

    // query updated camps -- updated within last 24:01 hours
    queryParams.FilterExpression = "updated > :yesterday";
    data = await db.scan(queryParams).promise();

    if (data.Items.length > 0) {
      fAnyChanges = true;
      camps = data.Items.sort((a, b) => a.name.localeCompare(b.name));
      htmlMail += `
          <h3>These camps were updated in the last 24 hours</h3>
          ${camps.map(formatCampCardForEmail).join("<br /><br />")}`;
    }

    // query deleted camps -- deleted within last 24:01 hours
    queryParams.FilterExpression =
      "attribute_exists(deleted) AND deleted > :yesterday";
    data = await db.scan(queryParams).promise();

    if (data.Items.length > 0) {
      fAnyChanges = true;
      camps = data.Items.sort((a, b) => a.name.localeCompare(b.name));
      htmlMail += `
          <h3>These camps were deleted in the last 24 hours</h3>
          ${camps.map(formatCampCardForEmail).join("<br /><br />")}`;
    }

    if (!fAnyChanges) {
      return StandardResponse("Nothing to say today");
    }

    let transporter = nodemailer.createTransport({
      SES: ses,
    });

    let info = await transporter.sendMail({
      from: "info@queerburnersdirectory.com",
      to: "joel@spolsky.com",
      subject: "[queerburnersdirectory] Daily Change Report",
      text: "This message requires an email client that supports HTML mail.",
      html: htmlMail,
    });

    return StandardResponse("Email sent");
  } catch (e) {
    console.error(e);
  }
};
