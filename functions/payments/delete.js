/* Use Case
1. When manager delete resident, trigger if no more resident in the unit

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function payments(event, context) {
  let payments = []

  try {
    const params1 = {
      TableName: process.env.paymentsTable,
      KeyConditionExpression:
        'apartId = :apartId and transactedAt > :transactedAt',
      ExpressionAttributeValues: {
        ':apartId': event.pathParameters.aid,
        ':transactedAt': '0',
      }
    }
    try {
      payments = await dynamoDbLib.call("query", params1);
      console.log(payments)
    } catch (e) {
      console.log(e)
    }

    for (let payment of payments.Items) {
      const params2 = {
        TableName: process.env.paymentsTable,
        Key: {
          apartId: event.pathParameters.aid,
          transactedAt: payment.transactedAt
        }
      }
      try {
        await dynamoDbLib.call("delete", params2);
      } catch (e) {
        console.log(e)
      }
    }

    return success({ status: true });
  } catch (e) {
    return failure({ status: false, error: e });
  }
}
