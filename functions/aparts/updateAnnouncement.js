/* Use Case  
1. Manager update announcement with apartId

*/


import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function apart(event, context) {
  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.aid
    },
    UpdateExpression:
      "SET announcement = :announcement",

    ExpressionAttributeValues: {
      ":announcement": data.announcement
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}