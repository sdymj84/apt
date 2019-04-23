/* Use Case  
1. /payments/${aid}
  -> Resident login > Query all apart's payment data
  -> Save in App.js and props down to all components

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function payments(event, context) {
  const params = {
    TableName: process.env.paymentsTable,
    KeyConditionExpression:
      'apartId = :apartId and transactedAt > :transactedAt',
    ExpressionAttributeValues: {
      ':apartId': event.pathParameters.aid,
      ':transactedAt': '0',
    },
    ScanIndexForward: false,
  }

  try {
    const result = await dynamoDbLib.call("query", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}
