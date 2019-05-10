/* Use Case  
1. Manager update apartment info such as
  floorPlan, rentPrice, announcement
2. Resident contract lease -> Manager create resident
  -> System automatically update apartment by adding resident in apart
3. Resident lease end and payment balance is 0
  -> Systen automatically update apartment by removing resident from apart

*/


import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";
import moment from 'moment'

/*===================================================================
  Update Apart info by Manager
===================================================================*/
export async function apart(event, context) {
  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.aid
    },
    UpdateExpression:
      "SET address = :address, \
      floorPlan = :floorPlan, \
      rentPrice = :rentPrice",
    ExpressionAttributeValues: {
      ":address": data.address,
      ":floorPlan": data.floorPlan,
      ":rentPrice": data.rentPrice,
    },
    ReturnValues: "ALL_NEW",
  };

  /* mock event for update apart
  {
    "rentPrice": 950,
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
    }
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
  const mid = moment(data.moveInDate)
  const leaseEndDate = mid.add(data.leaseTerm, 'months').startOf('days').format()
  let params = ""

  if (data.leaseTerm) {
    params = {
      TableName: process.env.apartsTable,
      Key: {
        pk: "SAVOY",
        apartId: event.pathParameters.aid
      },
      UpdateExpression:
        "SET residents = list_append(residents, :residents), \
        isOccupied = :isOccupied, \
        isPet = :isPet, \
        leaseTerm = :leaseTerm, \
        moveInDate = :moveInDate, \
        moveOutDate = :moveOutDate, \
        leaseStartDate = :leaseStartDate, \
        leaseEndDate = :leaseEndDate",
      ExpressionAttributeValues: {
        ":residents": [{
          id: data.residentId,
          name: data.name
        }],
        ":isOccupied": true,
        ":isPet": data.isPet,
        ":leaseTerm": data.leaseTerm,
        ":moveInDate": data.moveInDate,
        ":leaseStartDate": data.moveInDate,
        ":moveOutDate": `${leaseEndDate}`,
        ":leaseEndDate": `${leaseEndDate}`
      },
      ReturnValues: "ALL_NEW",
    }
  } else {
    params = {
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
        ":isPet": data.isPet,
      },
      ReturnValues: "ALL_NEW",
    }
  }

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
"body": "{\"residentId\": \"test-resident-id3\",\"name\": \"Gildong Hong\",\"moveInDate\": \"100\",\"leaseTerm\": \"6\",\"isPet\": false}",
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


/*===================================================================
  Update lease end date
===================================================================*/
export async function earlyMoveOut(event, context) {
  const data = JSON.parse(event.body)
  const moveOutDate = moment(data.moveOutDate).format()

  const params = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.aid
    },
    UpdateExpression:
      "SET moveOutDate = :moveOutDate, \
      moveOutConfirmed = :moveOutConfirmed",
    ExpressionAttributeValues: {
      ":moveOutDate": `${moveOutDate}`,
      ":moveOutConfirmed": true,
    },
    ReturnValues: "ALL_NEW",
  }

  try {
    const result = await dynamoDbLib.call("update", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}

/*===================================================================
  Update move out date everyday
===================================================================*/
export async function updateMoveOut(event, context) {
  let aparts = ""
  const params1 = {
    TableName: process.env.apartsTable
  }

  try {
    aparts = await dynamoDbLib.call("scan", params1);
    await Promise.all(aparts.Items.map(async apart => {
      await updateEach(apart)
    }))

  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}

async function updateEach(apart) {

  // Skip if no moveOutDate (vacant) or moveOutDateConfirmed
  if (!apart.moveOutDate) { return }

  const today = moment().startOf('date')
  const moveOutDate = moment(apart.moveOutDate)
  const diffDays = moveOutDate.diff(today, 'days')
  const adjustedMoveOutDate = today.add(60, 'days').format()
  let params2 = ""

  if (!apart.moveOutConfirmed && (diffDays < 60)) {
    console.log(apart.apartId)

    // Alert each residents in the unit that you reached 60 days
    // Update moveOutDate to 60 days from today
    const residentsUpdateExpression = apart.residents.map((resident, i) => {
      return `residents[${i}].isAnnouncementConfirmed = :isAnnouncementConfirmed`
    }).join(',')

    const message = `Move out date is ${diffDays} days ahead. 
      Your move out date is postponed to 60 days from today according to 60 notice rule. 
      Please contact office to confirm move out date or renew. Thank you.`

    params2 = residentsUpdateExpression
      ? {
        TableName: process.env.apartsTable,
        Key: {
          pk: "SAVOY",
          apartId: apart.apartId
        },
        UpdateExpression:
          "SET moveOutDate = :moveOutDate, \
          announcement = :announcement," + residentsUpdateExpression,
        ExpressionAttributeValues: {
          ":moveOutDate": adjustedMoveOutDate,
          ":announcement": message,
          ":isAnnouncementConfirmed": false
        },
        ReturnValues: "ALL_NEW",
      } : {
        TableName: process.env.apartsTable,
        Key: {
          pk: "SAVOY",
          apartId: apart.apartId
        },
        UpdateExpression:
          "SET moveOutDate = :moveOutDate, \
          announcement = :announcement",
        ExpressionAttributeValues: {
          ":moveOutDate": adjustedMoveOutDate,
          ":announcement": message
        },
        ReturnValues: "ALL_NEW",
      }
  } else {
    return
  }

  try {
    const result = await dynamoDbLib.call("update", params2);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e })
  }
}


/*===================================================================
  Renew - Update below properties
  leaseTerm, leaseStartDate, leaseEndDate, moveOutDate
===================================================================*/
export async function renew(event, context) {
  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.aid
    },
    UpdateExpression:
      "SET leaseTerm = :leaseTerm, \
      leaseStartDate = :leaseStartDate, \
      leaseEndDate = :leaseEndDate, \
      moveOutDate = :moveOutDate",
    ExpressionAttributeValues: {
      ":leaseTerm": data.newLeaseTerm,
      ":leaseStartDate": data.newLeaseStartDate,
      ":leaseEndDate": data.newLeaseEndDate,
      ":moveOutDate": data.newLeaseEndDate,
    },
    ReturnValues: "ALL_NEW",
  }

  try {
    const result = await dynamoDbLib.call("update", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}


/*===================================================================
  Update Autopay info on Apart
===================================================================*/
export async function updateAutopay(event, context) {
  const data = JSON.parse(event.body)

  const params = {
    TableName: process.env.apartsTable,
    Key: {
      pk: "SAVOY",
      apartId: event.pathParameters.aid
    },
    UpdateExpression:
      "SET isAutopayEnabled = :isAutopayEnabled, \
      autopayStartDate = :autopayStartDate, \
      autopayEndDate = :autopayEndDate, \
      autopayPayOnDay = :autopayPayOnDay, \
      autopayResidentId = :autopayResidentId",
    ExpressionAttributeValues: {
      ":isAutopayEnabled": data.isAutopayEnabled,
      ":autopayStartDate": data.autopay.startDate,
      ":autopayEndDate": data.autopay.endDate,
      ":autopayPayOnDay": data.autopay.payOnDay,
      ":autopayResidentId": data.autopay.residentId,
    },
    ReturnValues: "ALL_NEW",
  };
  try {
    const result = await dynamoDbLib.call("update", params);
    return success(result);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}