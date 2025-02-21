"use server";

import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDb from "../../utils/dynamodb/dbconfig";
import { ReturnValue } from "@aws-sdk/client-dynamodb";
import { auth } from "@/auth";

export default async function changeListNameByListId(
  listName: string,
  listId: string
) {
  const session = await auth();

  // Why? If the user did not type in the list name, we'll default it to "new list"
  // If they do specify the list name, we'll use the specified name.
  if (listName === "" || undefined || null) {
    throw new Error("Please enter a name");
  }

  // Why? To limit list name to 40 characters or less
  if (listName.length > 40) {
    throw new Error("Maximum length is 40 characters");
  }

  try {
    const params = {
      TableName: process.env.AWS_TABLE_NAME,
      Key: {
        PK: `USER#${session?.user?.id}`,
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
