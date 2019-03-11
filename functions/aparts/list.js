/* Use Case  
1. Manager look up all apartments
  (Client: Manager can filter by building number)

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function apart(event, context) {
  const params = {
    TableName: process.env.apartsTable,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': 'SAVOY'
    },
  };


  try {
    const result = await dynamoDbLib.call("query", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}
