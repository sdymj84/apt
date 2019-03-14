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
      residentId: event.pathParameters.id // the name 'id' is from '/{id}'
    }
  };


  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      // Return the retrieved item
      return success(result.Item);
    } else {
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}
