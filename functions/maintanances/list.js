/* Use Case  
1. /requests/list
  -> Manager see list of requests
  -> In client, data will be filtered/sorted by priority/apart/data..

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function request(event, context) {
  const params = {
    TableName: process.env.maintanancesTable,
    FilterExpression: "requestStatus <= :requestStatus",
    ExpressionAttributeValues: { ':requestStatus': 1 }
  }

  try {
    const result = await dynamoDbLib.call("scan", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}
