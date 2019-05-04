/* Use Case
1. Trigger when manager delete user

Note : only delete from DB, not from user pool

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function resident(event, context) {
  const params = {
    TableName: process.env.residentsTable,
    Key: {
      residentId: event.pathParameters.id,
    }
  };

  try {
    await dynamoDbLib.call("delete", params);
    return success({ status: true });
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}
