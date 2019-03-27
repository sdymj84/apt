/* Use Case  
1. /aparts/list/{aid}
  -> Get list of a few (building) or one apartment
    which begins with 'aid'

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function apart(event, context) {
  const params = {
    TableName: process.env.apartsTable,
    KeyConditionExpression: 'pk = :pk AND begins_with(apartId, :aid)',
    ExpressionAttributeValues: {
      ':pk': 'SAVOY',
      ':aid': event.pathParameters.aid
    }
  }

  try {
    const result = await dynamoDbLib.call("query", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}
