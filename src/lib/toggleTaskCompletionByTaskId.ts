"use server";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDb from "../utils/dynamodb/dbconfig";
import { ReturnValue } from "@aws-sdk/client-dynamodb";
import { auth } from "@/auth";

export default async function toggleTaskCompletionByTaskId(
  taskId: string,
  isCompleted: boolean
) {
  const session = await auth();

  try {
    const params = {
      TableName: process.env.AWS_TABLE_NAME,
      Key: {
        PK: `USER#${session?.user?.id}`,
        SK: taskId,
      },
      UpdateExpression: "SET completed =:completed",
      ExpressionAttributeValues: {
        ":completed": isCompleted,
      },
      ReturnValues: "ALL_NEW" as ReturnValue,
    };
    const command = new UpdateCommand(params);
    const response = await dynamoDb.send(command);

    // If the attribute completed that is returned
    // is neither "true" or "false", that means it's an error
    if ([true, false].includes(response.Attributes?.completed) === false) {
      throw new Error("Something went wrong. Please try again.");
    }
    return response.Attributes?.completed;
  } catch (error) {
    console.log("Error while adding a new list: ", error);
    throw error;
  }
}
