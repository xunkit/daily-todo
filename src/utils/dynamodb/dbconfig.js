import { DynamoDB } from "@aws-sdk/client-dynamodb";

const REGION = "ap-southeast-2";

const dynamoDb = new DynamoDB({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default dynamoDb;
