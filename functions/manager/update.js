import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function resident(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.residentsTable,
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      residentId: event.requestContext.identity.cognitoIdentityId,
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression:
      "SET isPrimary = :isPrimary, \
      firstName = :firstName, \
      lastName = :lastName, \
      email = :email, \
      phone = :phone, \
      erContact = :erContact, \
      vehicles = :vehicles, \
      notification = :notification",

    ExpressionAttributeValues: {
      ":isPrimary": data.isPrimary || false,
      ":firstName": data.firstName || null,
      ":lastName": data.lastName || null,
      ":email": data.email || null,
      ":phone": data.phone || null,
      ":erContact": data.erContact || null,
      ":vehicles": data.vehicles,
      ":notification": data.notification,

      /* These can be modified by manager or system only
      ":isPet": data.isPet || false,
      ":leaseTerm": data.leaseTerm,
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
