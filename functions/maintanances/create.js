/* Use Case  
1. Resident create maintanance request from website
2. Manager get call from Resident who can't use website
  -> Manager look up that apart -> Create maintanance request for resident

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";
import uuidv1 from 'uuid/v1'

export async function request(event, context) {
  const data = JSON.parse(event.body);
  const d = new Date()

  const params = {
    TableName: process.env.maintanancesTable,
    Item: {
      requestId: uuidv1(),
      apartId: data.apartId,
      requestStatus: 0,  // 0:Open, 1:Progress, 2:Done
      priority: data.priority,
      where: data.where,
      description: data.description,
      accessInst: data.accessInst || null,
      permissionToEnter: data.permissionToEnter,
      attachment: data.attachment,
      requestedAt: Date.now().toString(),
      completedAt: null,
      maintananceNote: null
    }
  };

  /* mock event for create resident
  {
    "priority": "Routine",
    "phone": "9133536799",
    "where": "Bathroom",
    "description": "Curtain stick fell off",
    "permissionToEnter": true,
    "attachment": "stick.jpg"
  } 
  */

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}
