/* Use Case  
1. Manager look up apartment by entering apart number (apartId)
2. Resident get into their account 
  -> System get the resident's apartId
  -> Get apartment by that apartId

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function apart(event, context) {
  const params = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.aid,
    }
  };

  try {
    const result = await dynamoDbLib.call("get", params);
    return success(result.Item);
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}
