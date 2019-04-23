/* Use Case  
1. Future resident come to the office and fill up all document
2. Manager sign up the new resident with all info on the manager system
3. Resident get verification email with temporary password
4. Resident verify email and login
5. Resident see password change screen right away

=> This lambda function gets triggered on No.2
  - On sign up page, there's Apart selection option which shows vacant apart list
  - When manager press sign up button after filling up all resident info

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";
import Amplify from 'aws-amplify'

export async function resident(event, context) {
  const data = JSON.parse(event.body);

  Amplify.configure({
    Auth: {
      region: process.env.region,
      userPoolId: process.env.userPoolId,
      identityPoolId: process.env.identityPoolId,
      userPoolWebClientId: process.env.userPoolClientId
    }
  })

  const params = {
    TableName: process.env.residentsTable,
    Item: {
      residentId: data.residentId,
      regiNum: data.regiNum,
      isPrimary: data.isPrimary,
      firstName: data.firstName,
      lastName: data.lastName,
      apartId: data.apartId,
      email: data.email,
      phone: data.phone,
      erContact: data.erContact,
      isPet: data.isPet,
      vehicles: data.vehicles.map(vehicle => vehicle),
      notifications: data.notifications,
    }
  };

  /* mock event for create resident
  {
    "residentId": "test-id-1",
    "apartId":"0401",
    "regiNum":"Apt123123",
    "isExpanded":true,
    "isLoading":false,
    "firstName":"Gildong",
    "lastName":"Hong",
    "email":"hong@gmail.com",
    "phone":"9131234567",
    "isPrimary":false,
    "isPet":false,
    "erContact": {
      "firstName":"E",
      "lastName":"R",
      "phone":"991"
    },
    "vehicles": [{
      "year":"",
      "make":"Nissan",
      "model":"350z",
      "color":"Grey",
      "licensePlate":"123ABC",
      "state":"KS"
    }],
    "notifications": {
      "isVoiceCallSub":false,
      "isTextSub":false,
      "isEmailSub":true
    },
    "leaseTerm":12
  } */

  /* const credential = {
    username: params.Item.email,
    password: params.Item.regiNum
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
