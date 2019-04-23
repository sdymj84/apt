/* Use Case  
1. Resident create maintanance request from website
2. Manager get call from Resident who can't use website
  -> Manager look up that apart -> Create maintanance request for resident

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function payments(event, context) {
  const data = JSON.parse(event.body);
  let prevBalance = "0"

  const params1 = {
    TableName: process.env.paymentsTable,
    KeyConditionExpression:
      'apartId = :apartId and transactedAt > :transactedAt',
    ExpressionAttributeValues: {
      ':apartId': data.apartId,
      ':transactedAt': '0',
    },
    Limit: 1,
    ScanIndexForward: false,
  }

  try {
    const payments = await dynamoDbLib.call("query", params1);
    prevBalance = payments.Items[0].balance
  } catch (e) {
    console.log(e)
  }

  let balance = Number(prevBalance) + Number(data.charge) - Number(data.payment)
  balance = Math.round(balance * 100) / 100

  const params2 = {
    TableName: process.env.paymentsTable,
    Item: {
      apartId: data.apartId,
      transactedAt: Date.now().toString(),
      title: data.title,
      charge: data.charge,
      payment: data.payment,
      balance: balance.toString()
    }
  }

  /* mock event for create resident
  {
    "apartId": "0101",
    "title": "Test Charge",
    "charge": "99.00",
    "payment": "0"
  } 
  */

  try {
    await dynamoDbLib.call("put", params2);
    return success(params2.Item);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}
