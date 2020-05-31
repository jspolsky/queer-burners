const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();

exports.campsPost = async (event) => {
  const { year, name } = JSON.parse(event.body);
  const params = {
    TableName: "camps",
    Item: {
      year: year,
      name: name,
      created: new Date().toISOString(),
    },
  };

  try {
    const data = await db.put(params).promise();
    const response = {
      statusCode: 200,
    };
    return response;
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
};

exports.campsGet = async (event) => {
  const params = {
    TableName: "camps",
  };

  try {
    const data = await db.scan(params).promise();
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify(data.Items),
    };
    return response;
  } catch (e) {
    return {
      statusCode: 500,
    };
  }
};

exports.campsYearGet = async (event) => {
  const {
    pathParameters: { year },
  } = event; // extract year from the request path

  const params = {
    TableName: "camps",
    KeyConditionExpression: "#yr = :yyyy",
    ExpressionAttributeNames: {
      "#yr": "year",
    },
    ExpressionAttributeValues: {
      ":yyyy": Number(year),
    },
  };

  try {
    const data = await db.query(params).promise();
    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
    return response;
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
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
  };
  try {
    const data = await db.get(params).promise();
    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
    return response;
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
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
    const response = {
      statusCode: 200,
    };
    return response;
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
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
    console.log(key + " -> " + a[key]);
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
    const response = {
      statusCode: 200,
    };
    return response;
  } catch (e) {
    if (e.code === "ConditionalCheckFailedException")
      return {
        statusCode: 500,
        body: "That camp doesn't exist",
      };
    else
      return {
        statusCode: 500,
        body: JSON.stringify(e),
      };
  }
};
