/* Use Case  
1. /aparts/list
  -> Get list of all apartments
2. /aparts/list with body : isPet
  -> Get list of all apartments and filter by pet

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function apart(event, context) {
  let params = ""
  const qsp = event.queryStringParameters
  if (qsp) {
    params = {
      TableName: process.env.apartsTable,
      KeyConditionExpression: 'pk = :pk',
      FilterExpression: 'isPet = :isPet',
      ExpressionAttributeValues: {
        ':pk': 'SAVOY',
        ':isPet': qsp.isPet = (qsp.isPet === "true")
      }
    }
  } else {
    params = {
      TableName: process.env.apartsTable,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': 'SAVOY',
      }
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
