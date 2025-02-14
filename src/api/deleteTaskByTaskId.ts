"use server";

import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDb from "../utils/dynamodb/dbconfig";

export default async function deleteTaskByTaskId(
  taskId: string
): Promise<void> {
  try {
    const params = {
      TableName: process.env.AWS_TABLE_NAME,
      Key: {
        PK: "USER#12345",
        SK: taskId,
      },
    };
    const command = new DeleteCommand(params);
    await dynamoDb.send(command);
  } catch (error) {
    console.log("Error while deleting a task: ", error);
    throw error;
  }
}
