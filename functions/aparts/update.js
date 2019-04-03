/* Use Case  
1. Manager update apartment info such as
  floorPlan, rentPrice, announcement
2. Resident contract lease -> Manager create resident
  -> System automatically update apartment by adding resident in apart
3. Resident lease end and payment balance is 0
  -> Systen automatically update apartment by removing resident from apart

*/


/*===================================================================
  Update Apart info by Manager
===================================================================*/
import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";

export async function apart(event, context) {
  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.aid
    },
    UpdateExpression:
      "SET residentId = list_append(residentId, :residentId), \
      address = :address, \
      floorPlan = :floorPlan, \
      isOccupied = :isOccupied, \
      rentPrice = :rentPrice, \
      announcement = :announcement",

    ExpressionAttributeValues: {
      ":residentId": data.residentId,
      ":address": data.address,
      ":floorPlan": data.floorPlan,
      ":isOccupied": data.isOccupied,
      ":rentPrice": data.rentPrice,
      ":announcement": data.announcement
    },
    ReturnValues: "ALL_NEW",
  };

  /* mock event for create resident
  {
    "residentId": ["63c2799f-d78b-4c0b-b7d5-f362be3b2ae3"],
    "isOccupied": true,
    "rentPrice": 950,
    "announcement": "Welcome Minjun",
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
    "buildingNum": "4"
  } 
  */

  try {
    const result = await dynamoDbLib.call("update", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}


/*===================================================================
  System add Resident in Apart
===================================================================*/
export async function addResident(event, context) {
  const data = JSON.parse(event.body)
  const params = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.aid
    },
    UpdateExpression:
      "SET residents = list_append(residents, :residents), \
      isOccupied = :isOccupied, \
      isPet = :isPet",
    ExpressionAttributeValues: {
      ":residents": [{
        id: data.residentId,
        name: data.name
      }],
      ":isOccupied": true,
      ":isPet": data.isPet
    },
    ReturnValues: "ALL_NEW",
  };

  console.log(params)

  try {
    const result = await dynamoDbLib.call("update", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}

/* 
{
  "residentId": "test-resident-id",
  "name": "Minjun Youn",
  "isPet": true
}
*/

/*===================================================================
  System remove Resident in Apart
===================================================================*/
export async function removeResident(event, context) {
  const params1 = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.aid,
    }
  };

  try {
    const prevState = await dynamoDbLib.call("get", params1);
    console.log("prevState:", prevState)
    const i = prevState.Item.residents.findIndex(resident =>
      resident.id === event.pathParameters.rid
    )

    const params2 = {
      TableName: process.env.apartsTable,
      Key: {
        pk: "SAVOY",
        apartId: event.pathParameters.aid
      },
      UpdateExpression:
        `REMOVE residents[${i}] \
        SET isOccupied = :isOccupied`,
      // TODO: Set isPet to false when no one in the unit has pet
      ExpressionAttributeValues: {
        ":isOccupied": prevState.Item.residents.length == 1 ? false : true,
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDbLib.call("update", params2);
    return success(result);

  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}


/*===================================================================
  Update Resident in Apart (isAnnouncementConfirmed)
===================================================================*/
export async function confirmAnnouncement(event, context) {
  const data = JSON.parse(event.body)
  const params1 = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.aid,
    }
  };

  try {
    const prevState = await dynamoDbLib.call("get", params1);
    console.log("prevState:", prevState)
    const i = prevState.Item.residents.findIndex(resident =>
      resident.id === event.pathParameters.rid
    )

    const params2 = {
      TableName: process.env.apartsTable,
      Key: {
        pk: "SAVOY",
        apartId: event.pathParameters.aid
      },
      UpdateExpression:
        `SET residents[${i}].isAnnouncementConfirmed = :isAnnouncementConfirmed`,
      ExpressionAttributeValues: {
        ":isAnnouncementConfirmed": data.isAnnouncementConfirmed
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await dynamoDbLib.call("update", params2);
    return success(result);

  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}