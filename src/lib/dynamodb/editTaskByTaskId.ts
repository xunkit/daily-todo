"use server";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDb from "../../utils/dynamodb/dbconfig";
import { ReturnValue } from "@aws-sdk/client-dynamodb";
import { auth } from "@/auth";

export default async function editTaskByTaskId(
  taskId: string,
  newTask: string,
  newDeadline: string
): Promise<{ ok: boolean; newTask: { task: string; deadline: string } }> {
  const session = await auth();

  // WHY? To limit task length and deadline length
  if (newTask.length > 120) {
    throw new Error("Task is maximum 120 characters long");
  }

  if (newDeadline.length > 40) {
    throw new Error("Deadline is maximum 40 characters long");
  }

  try {
    const params = {
      TableName: process.env.AWS_TABLE_NAME,
      Key: {
        PK: `USER#${session?.user?.id}`,
        SK: taskId,
      },
      UpdateExpression: "SET taskName =:taskName, deadline =:deadline",
      ExpressionAttributeValues: {
        ":taskName": newTask,
        ":deadline": newDeadline,
      },
      ReturnValues: "ALL_NEW" as ReturnValue,
    };
    const command = new UpdateCommand(params);
    const response = await dynamoDb.send(command);
    return {
      ok: response.$metadata.httpStatusCode === 200 ? true : false,
      newTask:
        response.Attributes?.task && response.Attributes?.deadline
          ? {
              task: response.Attributes.task,
              deadline: response.Attributes.deadline,
            }
          : { task: newTask, deadline: newDeadline },
    };
  } catch (error) {
    console.log("Error while adding a new list: ", error);
    throw error;
  }
}
