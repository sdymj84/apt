/* Use Case  
1. New apartment is built
2. Manager add that apartment in the system

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function apart(event, context) {
  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.apartsTable,
    Item: {
      pk: "SAVOY",
      apartId: data.apartId,
      residents: [],
      buildingNum: data.buildingNum,
      address: data.address,
      floorPlan: data.floorPlan,
      isOccupied: false,
      rentPrice: data.rentPrice,
      announcement: data.announcement,
      builtIn: Date.now()
    }
  };

  /* mock event for create resident
  {
    "apartId": "0401",
    "buildingNum": "4",
    "address": {
      "street": "5901 College Blvd",
      "apt": "0401",
      "city": "Overland Park",
      "zipcode": "66211"
    },
    "floorPlan": {
      "name": "Sunset",
      "roomCount": 1,
      "sqft": 925
    },
    "isOccupied": false,
    "rentPrice": 950,
    "announcement": "Welcome to new apartment!"
  } */


  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    console.log(e)
    return failure({ status: false });
  }
}
