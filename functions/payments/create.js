/* Use Case  
1. Charge rent/water/internet/cable/trash/insurance fee
  - automatic charge on the 1st day of each months

*/

import * as dynamoDbLib from "../../libs/dynamodb-lib";
import { success, failure } from "../../libs/response-lib";
import moment from 'moment'

export async function payments(event, context) {
  const data = JSON.parse(event.body);
  let prevBalance = "0"

  const params1 = {
    TableName: process.env.paymentsTable,
    KeyConditionExpression:
      'apartId = :apartId and transactedAt > :transactedAt',
    ExpressionAttributeValues: {
      ':apartId': data.apartId,
      ':transactedAt': '0',
    },
    Limit: 1,
    ScanIndexForward: false,
  }

  try {
    const payments = await dynamoDbLib.call("query", params1);
    prevBalance = payments.Items[0].balance
  } catch (e) {
    console.log(e)
  }

  let balance = Number(prevBalance) + Number(data.charge) - Number(data.payment)
  balance = Math.round(balance * 100) / 100

  const params2 = {
    TableName: process.env.paymentsTable,
    Item: {
      apartId: data.apartId,
      transactedAt: Date.now().toString(),
      title: data.title,
      charge: data.charge,
      payment: data.payment,
      balance: balance.toString()
    }
  }

  /* mock event for create resident
  {
    "apartId": "0101",
    "title": "Test Charge",
    "charge": "99.00",
    "payment": "0"
  } 
  */

  try {
    await dynamoDbLib.call("put", params2);
    return success(params2.Item);
  } catch (e) {
    console.log(e)
    return failure({ status: false, error: e });
  }
}



export async function chargeMonthly(event, context) {
  /* 
    1. Query occupied units
    2. Loop through units - apply 5 monthly charges
  */
  // const data = JSON.parse(event.body);
  try {
    let occupiedUnits = []

    const data = [
      {
        title: `rent-${moment().format('MMMM')}`,
        charge: "0",
        payment: "0"
      },
      {
        title: "water-water service",
        charge: "52.00",
        payment: "0"
      },
      {
        title: "internet-internet service",
        charge: "29.95",
        payment: "0"
      },
      {
        title: "cable-cable service",
        charge: "29.95",
        payment: "0"
      },
      {
        title: "trash-trash service",
        charge: "14.00",
        payment: "0"
      }
    ]

    // Get unit list that need to pay rent
    const params1 = {
      TableName: process.env.apartsTable,
      KeyConditionExpression: 'pk = :pk',
      FilterExpression: 'isOccupied = :isOccupied',
      ExpressionAttributeValues: {
        ':pk': 'SAVOY',
        ':isOccupied': true
      }
    }
    try {
      const result = await dynamoDbLib.call('query', params1)
      occupiedUnits = result.Items
    } catch (e) {
      console.log(e)
    }


    for (const unit of occupiedUnits) {
      // Loop charges and apply one by one
      // (rent - water - internet - cable - trash)
      for (const item of data) {

        // Get unit rent price and set
        if (item.title.split('-')[0] === 'rent') {
          item.charge = unit.rentPrice
        }

        // Get the latest balance and add current
        let prevBalance = "0"
        let balance = 0
        const params2 = {
          TableName: process.env.paymentsTable,
          KeyConditionExpression:
            'apartId = :apartId and transactedAt > :transactedAt',
          ExpressionAttributeValues: {
            ':apartId': unit.apartId,
            ':transactedAt': '0',
          },
          Limit: 1,
          ScanIndexForward: false,
        }
        try {
          const payments = await dynamoDbLib.call("query", params2);
          prevBalance = payments.Items.length && payments.Items[0].balance
          balance = Number(prevBalance) + Number(item.charge) - Number(item.payment)
          balance = Math.round(balance * 100) / 100
        } catch (e) {
          console.log(e)
        }

        // Save charge data into payment DB
        const params3 = {
          TableName: process.env.paymentsTable,
          Item: {
            apartId: unit.apartId,
            transactedAt: Date.now().toString(),
            title: item.title,
            charge: item.charge,
            payment: item.payment,
            balance: balance.toString()
          }
        }
        try {
          await dynamoDbLib.call("put", params3);
        } catch (e) {
          console.log(e)
        }
      }
    }

    return success({ status: true })
  } catch (e) {
    return failure({ status: false, error: e })
  }
}


export async function autopayCharge(event, context) {
  /* 
  On every 2nd day of each month
  -> get aparts that is isAutopayEnabled: true && payOnDay: 2nd
  -> get latest balance and pay
  -> repeat on 3/4/5th day
  */
  try {
    let payingUnits = []

    // Get unit list that is isAutopayEnabled: true && payOnDay: 2nd
    const params1 = {
      TableName: process.env.apartsTable,
      KeyConditionExpression: 'pk = :pk',
      FilterExpression:
        'isAutopayEnabled = :isAutopayEnabled and \
        autopayStartDate <= :autopayStartDate and \
        autopayEndDate >= :autopayEndDate and \
        autopayPayOnDay = :autopayPayOnDay',
      ExpressionAttributeValues: {
        ':pk': 'SAVOY',
        ':isAutopayEnabled': true,
        ':autopayStartDate': new Date().toISOString(),
        ':autopayEndDate': new Date().toISOString(),
        ':autopayPayOnDay': moment().format('Do')
      }
    }
    try {
      const result = await dynamoDbLib.call('query', params1)
      payingUnits = result.Items
      console.log(payingUnits)
    } catch (e) {
      console.log(e)
    }


    for (const unit of payingUnits) {
      // Get the latest balance on this unit
      let prevBalance = "0"
      let balance = 0
      const params2 = {
        TableName: process.env.paymentsTable,
        KeyConditionExpression:
          'apartId = :apartId and transactedAt > :transactedAt',
        ExpressionAttributeValues: {
          ':apartId': unit.apartId,
          ':transactedAt': '0',
        },
        Limit: 1,
        ScanIndexForward: false,
      }
      try {
        const payments = await dynamoDbLib.call("query", params2);
        prevBalance = payments.Items.length && payments.Items[0].balance
        // balance = Number(prevBalance) + Number(item.charge) - Number(item.payment)
        // balance = Math.round(balance * 100) / 100
      } catch (e) {
        console.log(e)
      }

      // Save payment data into payment DB
      const params3 = {
        TableName: process.env.paymentsTable,
        Item: {
          apartId: unit.apartId,
          transactedAt: Date.now().toString(),
          title: "Auto Payment",
          charge: "0",
          payment: prevBalance,
          balance: "0"
        }
      }
      try {
        await dynamoDbLib.call("put", params3);
      } catch (e) {
        console.log(e)
      }
    }

    return success({ status: true })
  } catch (e) {
    return failure({ status: false, error: e })
  }
}