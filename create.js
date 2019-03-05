<<<<<<< HEAD
import uuidv1 from "uuid";
=======
import uuidv1 from "uuid/v1";
>>>>>>> 56a193b4b8faeacaca846281d1855d8fc7b7025f
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function resident(event, context) {
  const data = JSON.parse(event.body);
  const d = new Date()
  const params = {
    TableName: process.env.residentsTable,
<<<<<<< HEAD
=======
    Item: {
      residentId: event.requestContext.identity.cognitoIdentityId,
      regiNum: data.regiNum,
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
    "regiNum": "123456",
    "isPrimary": true,
    "firstName": "Jihee",
    "lastName": "Chung",
    "apartNum": "401",
    "email": "wlgml44@gmail.com",
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

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}


export async function apart(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.apartsTable,
>>>>>>> 56a193b4b8faeacaca846281d1855d8fc7b7025f
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: uuidv1(),
      content: data.content,
      attachment: data.attachment,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}


export async function maintanance(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.maintanancesTable,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: uuidv1(),
      content: data.content,
      attachment: data.attachment,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}