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
import Amplify, { Auth } from 'aws-amplify'

export async function resident(event, context) {
  const data = JSON.parse(event.body);
  const d = new Date()

  Amplify.configure({
    Auth: {
      region: process.env.region,
      userPoolId: process.env.userPoolId,
      identityPoolId: process.env.identityPoolId,
      userPoolWebClientId: process.env.userPoolClientId
    }
  })

  const params = {
    TableName: process.env.apartTable,
    Item: {
      pk: "",             // residentId
      sk: data.apartId,   // apartId
      regiNum: 'Apt' + Math.floor(100000 + Math.random() * 900000).toString(),
      isPrimary: data.isPrimary,
      firstName: data.firstName,
      lastName: data.lastName,
      apartNum: data.apartNum,
      email: data.email,
      phone: data.phone,
      erContact: {
        firstName: data.erContact.firstName,
        lastName: data.erContact.lastName,
        phone: data.erContact.phone,
      },
      isPet: data.isPet,
      vehicles: data.vehicles.map(vehicle => {
        return {
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          color: vehicle.color,
          licensePlate: vehicle.licensePlate,
          state: vehicle.state,
        }
      }),
      notification: {
        voiceCall: data.notification.voiceCall,
        text: data.notification.text,
        email: data.notification.email,
      },
      leaseTerm: data.leaseTerm,
      moveInDate: Date.now(),
      leaseStartDate: Date.now(),
      leaseEndDate: d.setDate(d.getMonth() + data.leaseTerm),
    }
  };

  /* mock event for create resident
  {
    "apartId": "0401",
    "isPrimary": true,
    "firstName": "Jihee",
    "lastName": "Chung",
    "email": "sdymj84@gmail.com",
    "phone": "9136206145",
    "erContact": {
      "firstName": "Hyeran",
      "lastName": "Yu",
      "phone": "9131231234"
    },
    "isPet": false,
    "vehicles": [{
      "year": "2011",
      "make": "Kia",
      "model": "Soul",
      "color": "White",
      "licensePlate": "263KJL",
      "state": "KS"
    }, {
      "year": "2017",
      "make": "Tesla",
      "model": "Tesla S",
      "color": "Black",
      "licensePlate": "777MJY",
      "state": "KS"
    }],
    "notification": {
      "voiceCall": false,
      "text": false,
      "email": true
    },
    "leaseTerm": 12
  } */

  const credential = {
    username: params.Item.email,
    password: params.Item.regiNum
  }

  try {
    const newResident = await Auth.signUp(credential)
    params.Item.pk = newResident.userSub
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}
