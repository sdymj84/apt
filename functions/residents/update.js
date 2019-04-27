/* Use Case
1. Manager update resident information which resident are not allowed to update
  (lease term, ...)
2. Resident move apart -> Manager update apartNum
  (maybe set schedule to change once the new apart is vacant)

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function resident(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.residentsTable,
    Key: {
      residentId: event.pathParameters.id,
    },
    UpdateExpression:
      "SET phone = :phone, \
      erContact = :erContact, \
      vehicles = :vehicles, \
      notifications = :notifications",

    ExpressionAttributeValues: {
      ":phone": data.phone || "",
      ":erContact": data.erContact || "",
      ":vehicles": data.vehicles || "",
      ":notifications": data.notifications || "",
    },
    ReturnValues: "ALL_NEW"
  };


  try {
    const result = await dynamoDbLib.call("update", params);
    console.log(result)
    return success({ status: true });
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}


/* Use Case
1. Resident go payment > Add/Edit/Delete bank account or card

*/

export async function updateBankAccount(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.residentsTable,
    Key: {
      residentId: event.pathParameters.id,
    },
    UpdateExpression:
      "SET bankAccount = :bankAccount",

    ExpressionAttributeValues: {
      ":bankAccount": data.bankAccount,
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    console.log(result)
    return success({ status: true });
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}

export async function updateCard(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.residentsTable,
    Key: {
      residentId: event.pathParameters.id,
    },
    UpdateExpression:
      "SET card = :card",

    ExpressionAttributeValues: {
      ":card": data.card,
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    console.log(result)
    return success({ status: true });
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}

export async function updateAutopay(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.residentsTable,
    Key: {
      residentId: event.pathParameters.id,
    },
    UpdateExpression:
      "SET autopay = :autopay",

    ExpressionAttributeValues: {
      ":autopay": data.autopay,
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    console.log(result)
    return success({ status: true });
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}