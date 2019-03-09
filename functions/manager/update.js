/* Use Case
1. Manager update resident information which resident are not allowed to update
  (lease term, ...)
2. Resident move apart -> Manager update apartNum
  (maybe set schedule to change once the new apart is vacant)

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function resident(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.apartTable,
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      pk: event.pathParameters.residentId,
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression:
      "SET isPrimary = :isPrimary, \
      apartNum = :apartNum, \
      firstName = :firstName, \
      lastName = :lastName, \
      email = :email, \
      phone = :phone, \
      isPet = :isPet \
      erContact = :erContact, \
      vehicles = :vehicles, \
      notification = :notification, \
      leaseTerm = :leaseTerm",

    ExpressionAttributeValues: {
      ":isPrimary": data.isPrimary || false,
      ":apartNum": data.apartNum,
      ":firstName": data.firstName,
      ":lastName": data.lastName,
      ":email": data.email,
      ":phone": data.phone,
      ":isPet": data.isPet || false,
      ":erContact": data.erContact,
      ":vehicles": data.vehicles,
      ":notification": data.notification,
      ":leaseTerm": data.leaseTerm,

      /* These can be modified by manager or system only
      ":leaseStartDate": data.leaseStartDate,
      ":leaseEndDate": d.setDate(d.getMonth() + data.leaseTerm), 
      */
    },
    ReturnValues: "ALL_NEW"
  };


  try {
    const result = await dynamoDbLib.call("update", params);
    console.log(result)
    return success({ status: true });
  } catch (e) {
    return failure({ status: false });
  }
}
