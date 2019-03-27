/* Use Case  
1. /aparts/list/{aid}
  -> Get list of a few (building) or one apartment
    which begins with 'aid'
2. /aparts/list
  -> Get list of all apartments
3. /aparts/list with body : isPet
  -> Get list of all apartments and filter by pet

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function apart(event, context) {
  let params = ""
  if (event.pathParameters.aid) {
    params = {
      TableName: process.env.apartsTable,
      KeyConditionExpression: 'pk = :pk AND begins_with(apartId, :aid)',
      ExpressionAttributeValues: {
        ':pk': 'SAVOY',
        ':aid': event.pathParameters.aid
      }
    }
  } else if (event.queryStringParameters) {
    params = {
      TableName: process.env.apartsTable,
      KeyConditionExpression: 'pk = :pk',
      FilterExpression: 'isPet = :isPet',
      ExpressionAttributeValues: {
        ':pk': 'SAVOY',
        ':isPet': event.queryStringParameters.isPet
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
