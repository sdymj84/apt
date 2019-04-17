import AWS from "aws-sdk";

export function call(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient({
    convertEmptyValues: true
  });
  const a = dynamoDb[action](params).promise()
  console.log(a)
  return a;
}
