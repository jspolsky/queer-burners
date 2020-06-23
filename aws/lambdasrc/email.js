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

exports.sendDailyEmail = async (event) => {
  try {
    let transporter = nodemailer.createTransport({
      SES: ses,
    });

    let info = await transporter.sendMail({
      from: "info@queerburnersdirectory.com",
      to: "joel@spolsky.com",
      subject: "Daily Email From NODEMAILER",
      text: "This time the message came from NodeMailer, which is pretty hot",
    });

    return StandardResponse("Email sent");
  } catch (e) {
    console.error(e);
  }
};
