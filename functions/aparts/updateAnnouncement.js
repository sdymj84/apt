/* Use Case  
1. Manager update announcement with apartId

*/


import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function apart(event, context) {
  const data = JSON.parse(event.body)
  const params1 = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.aid,
    }
  };

  try {
    const prevState = await dynamoDbLib.call("get", params1);
    console.log("prevState:", prevState)

    const residentsUpdateExpression = prevState.Item.residents.map((resident, i) => {
      return `residents[${i}].isAnnouncementConfirmed = :isAnnouncementConfirmed`
    }).join(',')

    // if there's resident in the unit, set isAnnouncementConfirmed to false
    const params2 = residentsUpdateExpression
      ? {
        TableName: process.env.apartsTable,
        Key: {
          pk: "SAVOY",
          apartId: event.pathParameters.aid
        },
        UpdateExpression:
          "SET announcement = :announcement," + residentsUpdateExpression,
        ExpressionAttributeValues: {
          ":announcement": data.announcement,
          ":isAnnouncementConfirmed": false
        },
        ReturnValues: "ALL_NEW",
      }
      : {
        TableName: process.env.apartsTable,
        Key: {
          pk: "SAVOY",
          apartId: event.pathParameters.aid
        },
        UpdateExpression:
          "SET announcement = :announcement",
        ExpressionAttributeValues: {
          ":announcement": data.announcement
        },
        ReturnValues: "ALL_NEW",
      }

    const result = await dynamoDbLib.call("update", params2);
    return success(result);

  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}




/* 
  - query aparts with isOccupied true
  - loop through those aparts
    - get balance from payment DB
    - if balance is not 0, update announcement
*/
export async function alertLatePayment(event, context) {
  try {
    let occupiedUnits = []

    // Get unit list that need to pay rent
    const params1 = {
      TableName: process.env.apartsTable,
      KeyConditionExpression: 'pk = :pk',
      FilterExpression: 'isOccupied = :isOccupied',
      ExpressionAttributeValues: {
        ':pk': 'SAVOY',
        ':isOccupied': true
      }
    }
    try {
      const result = await dynamoDbLib.call('query', params1)
      occupiedUnits = result.Items
    } catch (e) {
      console.log(e)
    }


    for (const unit of occupiedUnits) {
      // Get the latest balance
      let balance = 0
      const params2 = {
        TableName: process.env.paymentsTable,
        KeyConditionExpression:
          'apartId = :apartId and transactedAt > :transactedAt',
        ExpressionAttributeValues: {
          ':apartId': unit.apartId,
          ':transactedAt': '0',
        },
        Limit: 1,
        ScanIndexForward: false,
      }
      try {
        const payments = await dynamoDbLib.call("query", params2);
        balance = payments.Items.length && payments.Items[0].balance
      } catch (e) {
        console.log(e)
      }

      if (Number(balance)) {
        // If balance is not 0, update announcement to pay before late
        const message = `You have ${balance} balance to pay on your account. 
          Please remember that $50 of late fee would be applied on 6th
          if you failed to make rent payment by 5th. Thank you.`

        try {
          const residentsUpdateExpression = unit.residents.map((resident, i) => {
            return `residents[${i}].isAnnouncementConfirmed = :isAnnouncementConfirmed`
          }).join(',')

          // if there's resident in the unit, set isAnnouncementConfirmed to false
          const params2 = residentsUpdateExpression
            ? {
              TableName: process.env.apartsTable,
              Key: {
                pk: "SAVOY",
                apartId: unit.apartId
              },
              UpdateExpression:
                "SET announcement = :announcement," + residentsUpdateExpression,
              ExpressionAttributeValues: {
                ":announcement": message,
                ":isAnnouncementConfirmed": false
              },
              ReturnValues: "ALL_NEW",
            }
            : {
              TableName: process.env.apartsTable,
              Key: {
                pk: "SAVOY",
                apartId: event.pathParameters.aid
              },
              UpdateExpression:
                "SET announcement = :message",
              ExpressionAttributeValues: {
                ":announcement": data.announcement
              },
              ReturnValues: "ALL_NEW",
            }

          await dynamoDbLib.call("update", params2);
        } catch (e) {
          console.log(e)
        }
      }
    }

    return success({ status: true })
  } catch (e) {
    return failure({ status: false, error: e })
  }
}