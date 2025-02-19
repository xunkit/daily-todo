"use server";

import { auth } from "@/auth";
import dynamoDb from "../utils/dynamodb/dbconfig";
import { Task } from "@/types";

export default async function getAllTasksByUserIdAndListId(currentTab: string) {
  const session = await auth();

  if (currentTab === "") {
    return [];
  }

  try {
    const params = {
      TableName: process.env.AWS_TABLE_NAME,
      IndexName: "ListIndex",
      KeyConditionExpression: "PK =:PK and listId =:listId",
      ExpressionAttributeValues: {
        ":PK": { S: `USER#${session?.user?.id}` }, //Replace hardcoded user id with param
        ":listId": { S: currentTab },
      },
    };
    const data = await dynamoDb.query(params);
    const tasks: Task[] | undefined = data.Items?.map((item) => ({
      completed: item.completed.BOOL as boolean,
      createdAt: item.createdAt.S as string,
      SK: item.SK.S as string,
      PK: item.PK.S as string,
      taskName: item.taskName.S as string,
      listId: item.listId.S as string,
      deadline: item.deadline.S as string,
      dataType: "TASK",
      key: crypto.randomUUID(),
    }));

    if (!tasks) {
      return [];
    }

    return tasks;
  } catch (error) {
    console.log("Error while getting items: ", error);
    throw error;
  }
}
