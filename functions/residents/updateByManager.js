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
    TableName: process.env.residentsTable,
    Key: {
      residentId: event.pathParameters.residentId,
    },
    UpdateExpression:
      "SET isPrimary = :isPrimary, \
      apartId = :apartId, \
      firstName = :firstName, \
      lastName = :lastName, \
      email = :email, \
      phone = :phone, \
      erContact = :erContact, \
      isPet = :isPet, \
      vehicles = :vehicles, \
      notification = :notification, \
      leaseTerm = :leaseTerm",

    ExpressionAttributeValues: {
      ":isPrimary": data.isPrimary || false,
      ":apartId": data.apartId || "",
      ":firstName": data.firstName || "",
      ":lastName": data.lastName || "",
      ":email": data.email || "",
      ":phone": data.phone || "",
      ":erContact": data.erContact || "",
      ":isPet": data.isPet || "",
      ":vehicles": data.vehicles || "",
      ":notification": data.notifications || "",
      ":leaseTerm": data.leaseTerm || "",

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
    console.log(e)
    return failure({ status: false });
  }
}
