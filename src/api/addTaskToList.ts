"use server";

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDb from "../utils/dynamodb/dbconfig";
import { Task } from "@/types";

interface addTaskToListParams {
  TableName: string | undefined;
  Item: Task;
}

export default async function addTaskToList(
  currentTab: string,
  taskName: string,
  deadline: string
) {
  try {
    const taskId = crypto.randomUUID();
    const newTask: Task = {
      PK: "USER#12345",
      SK: `TASK#${taskId}`,
      listId: currentTab,
      createdAt: "2025-02-11T01:02:00Z",
      deadline: deadline,
      dataType: "TASK",
      taskName,
      completed: false,
    };
    const params: addTaskToListParams = {
      TableName: process.env.AWS_TABLE_NAME,
      Item: newTask,
    };
    const command = new PutCommand(params);
    const response = await dynamoDb.send(command);
    return {
      ok: response.$metadata.httpStatusCode === 200 ? true : false,
      newTask,
    };
  } catch (error) {
    console.log("Error while adding a new task: ", error);
    throw error;
  }
}
