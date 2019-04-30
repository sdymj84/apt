/* Use Case  
1. Charge rent/water/internet/cable/trash/insurance fee
  - automatic charge on the 1st day of each months

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



export async function chargeMonthly(event, context) {
  /* 
    1. Query occupied units
    2. Loop through units - apply 5 monthly charges
  */
  const data = JSON.parse(event.body);
  /* 
    data: {
      apartId: "0101",
      rent: {
        title: "rent-May",
        charge: "926.00",
        payment: "0"
      },
      water: {
        title: "water-water service",
        charge: "52.00",
        payment: "0"
      },
      internet: {
        title: "internet-internet service",
        charge: "29.95",
        payment: "0"
      },
      cable: {
        title: "cable-cable service",
        charge: "29.95",
        payment: "0"
      },
      trash: {
        title: "trash-trash service",
        charge: "14.00",
        payment: "0"
      }
    }
   */
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