"use server";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDb from "../utils/dynamodb/dbconfig";
import { ReturnValue } from "@aws-sdk/client-dynamodb";

export default async function changeListNameByListId(
  listName: string,
  listId: string
) {
  try {
    const params = {
      TableName: process.env.AWS_TABLE_NAME,
      Key: {
        PK: "USER#12345",
        SK: listId,
      },
      UpdateExpression: "SET listName =:listName",
      ExpressionAttributeValues: {
        ":listName": listName,
      },
      ReturnValues: "ALL_NEW" as ReturnValue,
    };
    const command = new UpdateCommand(params);
    const response = await dynamoDb.send(command);
    return {
      ok: response.$metadata.httpStatusCode === 200 ? true : false,
      newListName: response.Attributes?.listName
        ? response.Attributes.listName
        : listName,
    };
  } catch (error) {
    console.log("Error while adding a new list: ", error);
    throw error;
  }
}
