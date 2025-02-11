"use server";

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDb from "../utils/dynamodb/dbconfig";
import { Task } from "@/types";

interface addTaskToListParams {
  TableName: string | undefined;
  Item: Task;
}

export default async function addTaskToList(currentTab: string, list: List) {
  try {
    const params: addTaskToListParams = {
      TableName: process.env.AWS_TABLE_NAME,
      Item: list,
    };
    const command = new PutCommand(params);
    const response = await dynamoDb.send(command);
    return response.$metadata.httpStatusCode === 200 ? true : false;
  } catch (error) {
    console.log("Error while adding a new task: ", error);
    throw error;
  }
}
