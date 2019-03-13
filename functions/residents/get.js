/* Use Case
1. Resident login their account
  -> Look up their profile

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function resident(event, context) {
  const params = {
    TableName: process.env.residentsTable,
    Key: {
      residentId: event.pathParameters.residentId
    }
  };


  try {
    const result = await dynamoDbLib.call("get", params);
    return success(result.Item);
  } catch (e) {
    console.log('[get.js]', e)
    return failure({ status: false });
  }
}
