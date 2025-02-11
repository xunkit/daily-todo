"use server";

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDb from "../utils/dynamodb/dbconfig";

export default async function addNewList() {
  try {
    const params = {
      TableName: process.env.AWS_TABLE_NAME,
      Item: {
        PK: "USER#12345",
        SK: "LIST#asd-fgh",
        createdAt: "2025-02-11T01:02:00Z",
        dataType: "LIST",
        listName: "Open Day",
      },
    };
    const command = new PutCommand(params);
    const response = await dynamoDb.send(command);
    return response.$metadata.httpStatusCode === 200 ? true : false;
  } catch (error) {
    console.log("Error while adding a new list: ", error);
    throw error;
  }
}
