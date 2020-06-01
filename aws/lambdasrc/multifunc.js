const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();

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
  body: JSON.stringify(e),
});

// list of attributes which can be seen publically
const publicAttributes = [
  "year",
  "name",
  "identifies",
  "url",
  "facebook",
  "location",
];

const publicAttributesEAN = publicAttributes.reduce((res, it, i) => {
  res["#" + it] = it;
  return res;
}, {});

const publicAttributesPE = publicAttributes.map((s) => "#" + s).join(",");

exports.campsPost = async (event) => {
  const {
    year,
    name,
    identifies,
    url,
    facebook,
    location,
    contact,
  } = JSON.parse(event.body);
  const params = {
    TableName: "camps",
    Item: {
      year: year,
      name: name,
      identifies: identifies,
      url: url,
      facebook: facebook,
      location: location,
      contact: contact,
      created: new Date().toISOString(),
    },
  };

  try {
    const data = await db.put(params).promise();
    return StandardResponse(null);
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

  // UNDONE should check if this item exists and fail if it doesn't

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
        "placed",
        "location",
        // UNDONE list all other fields here
        // UNDONE deal with composite fields like address, social media, contact info, anything else we add.
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
