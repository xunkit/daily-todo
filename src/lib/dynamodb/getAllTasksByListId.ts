"use server";

import dynamoDb from "../../utils/dynamodb/dbconfig";
import { Task } from "@/types";
import { PaginationLimit } from "@/constants";
import { AttributeValue, QueryInput } from "@aws-sdk/client-dynamodb";

interface FetchTasksResult {
  tasks: Task[];
  lastEvaluatedKey: Record<string, AttributeValue> | undefined | null;
}

export default async function getAllTasksByListId(
  currentTab: string,
  startKey?: Record<string, AttributeValue>
): Promise<FetchTasksResult> {
  if (currentTab === "") {
    return { tasks: [], lastEvaluatedKey: null };
  }

  try {
    const params: QueryInput = {
      TableName: process.env.AWS_TABLE_NAME,
      IndexName: "ListIndex",
      KeyConditionExpression: "listId =:listId",
      ExpressionAttributeValues: {
        ":listId": { S: currentTab },
      },
      Limit: PaginationLimit,
      ScanIndexForward: false,
    };

    if (startKey) {
      params.ExclusiveStartKey = startKey;
    }

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
      return { tasks: [], lastEvaluatedKey: null };
    }

    return { tasks, lastEvaluatedKey: data.LastEvaluatedKey };
  } catch (error) {
    console.log("Error while getting items: ", error);
    throw error;
  }
}
