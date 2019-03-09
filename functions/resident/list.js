/* Use Case
1. Manager see list of residents by apartId (apart number)

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function resident(event, context) {
  const params = {
    TableName: process.env.apartTable,
    IndexName: process.env.apartIndex,
    // 'KeyConditionExpression' defines the condition for the query
    // - 'userId = :userId': only return items with matching 'userId'
    //   partition key
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':userId': defines 'userId' to be Identity Pool identity id
    //   of the authenticated user

    KeyConditionExpression: "pk = :apartId",
    ExpressionAttributeValues: {
      ":apartId": event.pathParameters.apartId
    }
  };

  try {
    console.log(params)
    const result = await dynamoDbLib.call("query", params);
    // Return the matching list of items in response body
    return success(result.Items);
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}
