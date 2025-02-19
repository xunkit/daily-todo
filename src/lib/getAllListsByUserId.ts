"use server";

import { auth } from "@/auth";
import dynamoDb from "../utils/dynamodb/dbconfig";
import { List } from "@/types";

export default async function getAllListsByUserId() {
  const session = await auth();
  try {
    const params = {
      TableName: process.env.AWS_TABLE_NAME,
      IndexName: "DatatypeIndex",
      KeyConditionExpression: "PK =:PK and dataType =:dataType",
      ExpressionAttributeValues: {
        ":PK": { S: `USER#${session?.user?.id}` }, //Replace hardcoded user id with param
        ":dataType": { S: "LIST" },
      },
    };
    const data = await dynamoDb.query(params);
    const lists: List[] | undefined = data.Items?.map((item) => ({
      createdAt: item.createdAt.S as string,
      SK: item.SK.S as string,
      PK: item.PK.S as string,
      listName: item.listName.S as string,
      dataType: "LIST",
      key: crypto.randomUUID(),
    }));

    if (!lists) {
      return [];
    }

    return lists;
  } catch (error) {
    console.log("Error while getting items: ", error);
    throw error;
  }
}
