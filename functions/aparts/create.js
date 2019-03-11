/* Use Case  
1. New apartment is built
2. Manager add that apartment in the system

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function resident(event, context) {
  const data = JSON.parse(event.body);
  const d = new Date()

  const params = {
    TableName: process.env.apartTable,
    Item: {
      residentId: "",
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
