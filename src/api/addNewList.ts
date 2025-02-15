"use server";

import { PutCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDb from "../utils/dynamodb/dbconfig";

export default async function addNewList(listName: string) {
  try {
    // Why? If the user did not type in the list name, we'll default it to "new list"
    // If they do specify the list name, we'll use the specified name.
    const newListName =
      listName === "" || undefined ? "New list" : listName.toString();

    // Why? To limit list name to 40 characters or less
    if (newListName.length > 40) {
      throw new Error("Maximum length is 40 characters");
    }

    // ListIds are created server-side then sent back to the user via response
    // Why? To prevent the user from tampering with ids using custom requests
    const listId = crypto.randomUUID();
    const params = {
      TableName: process.env.AWS_TABLE_NAME,
      Item: {
        PK: "USER#12345",
        SK: `LIST#${listId}`,
        createdAt: "2025-02-11T01:02:00Z",
        dataType: "LIST",
        listName: newListName,
      },
    };
    const command = new PutCommand(params);
    const response = await dynamoDb.send(command);
    return {
      ok: response.$metadata.httpStatusCode === 200 ? true : false,
      listId: `LIST#${listId}`,
      listName: newListName,
    };
  } catch (error) {
    console.log("Error while adding a new list: ", error);
    throw error;
  }
}
