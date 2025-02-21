"use server";

import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDb from "../../utils/dynamodb/dbconfig";
import { Task } from "@/types";
import { auth } from "@/auth";

export default async function addTaskToList(
  currentTab: string,
  taskName: string,
  deadline: string
) {
  const session = await auth();

  // WHY? To prevent users from submitting empty (meaningless) tasks
  if (taskName === "" || undefined || null) {
    throw new Error("Please specify the task");
  }

  // WHY? To limit task length and deadline length
  if (taskName.length > 120) {
    throw new Error("Task is maximum 120 characters long");
  }

  if (deadline.length > 40) {
    throw new Error("Deadline is maximum 40 characters long");
  }

  try {
    // First, check if the list even exists
    const getListParams = {
      TableName: process.env.AWS_TABLE_NAME,
      Key: {
        PK: `USER#${session?.user?.id}`, // PK of the list
        SK: currentTab, // SK of the list
      },
    };
    const getCommand = new GetCommand(getListParams);
    const listData = await dynamoDb.send(getCommand);

    if (!listData.Item) {
      // If list doesn't exist
      throw new Error("The list does not exist");
    }

    const taskId = crypto.randomUUID();
    const newTask: Task = {
      PK: `USER#${session?.user?.id}`,
      SK: `TASK#${taskId}`,
      listId: currentTab,
      createdAt: new Date().toISOString().split(".")[0] + "Z",
      deadline: deadline,
      dataType: "TASK",
      taskName,
      completed: false,
    };

    const params = {
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
