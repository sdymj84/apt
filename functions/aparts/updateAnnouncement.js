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

    const params2 = {
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
    };

    const result = await dynamoDbLib.call("update", params2);
    return success(result);

  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}
