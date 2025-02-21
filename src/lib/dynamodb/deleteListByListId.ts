"use server";

import { BatchWriteCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import dynamoDb from "../../utils/dynamodb/dbconfig";
import { auth } from "@/auth";

export default async function deleteListByListId(
  listId: string
): Promise<void> {
  const session = await auth();

  try {
    // Delete all tasks first
    const taskQueryParams = {
      TableName: process.env.AWS_TABLE_NAME,
      IndexName: "ListIndex",
      KeyConditionExpression: "PK =:PK and listId =:listId",
      ExpressionAttributeValues: {
        ":PK": { S: `USER#${session?.user?.id}` },
        ":listId": { S: listId },
      },
    };

    const taskQueryData = await dynamoDb.query(taskQueryParams);
    const tasksToDelete = taskQueryData.Items || [];

    // Only delete tasks if there are actually any tasks in the list to begin with
    if (tasksToDelete.length > 0) {
      const deleteRequests = tasksToDelete.map((task) => ({
        DeleteRequest: {
          Key: {
            PK: task.PK,
            SK: task.SK,
          },
        },
      }));

      // Batch delete the tasks (handle batches of 25)
      const BATCH_SIZE = 25;
      for (let i = 0; i < deleteRequests.length; i += BATCH_SIZE) {
        const batch = deleteRequests.slice(i, i + BATCH_SIZE);
        const batchParams = {
          RequestItems: {
            [process.env.AWS_TABLE_NAME as string]: batch,
          },
        };
        const batchData = await dynamoDb.batchWriteItem(batchParams);

        // Handle unprocessed items (important for large batches)
        // WHY? Because sometimes the server just refuses to delete everything
        // When that happens, it returns an array of UnprocessedItems
        // If we see UnprocessedItems isn't empty, we retry 3 times
        // It should be fine after 3 tries. If not, we tell the user at least we tried...
        if (
          batchData.UnprocessedItems &&
          batchData.UnprocessedItems[process.env.AWS_TABLE_NAME as string]
        ) {
          console.warn(
            "Unprocessed items (tasks):",
            batchData.UnprocessedItems[process.env.AWS_TABLE_NAME as string]
          );
          // Retry logic below. WHY? In case the server is acting cray-cray and doesn't want to
          // delete all items in one go.
          const retryAttempts = 3; // Number of retry attempts
          let retryCount = 0;

          while (retryCount < retryAttempts) {
            retryCount++;
            console.log(`Retry attempt ${retryCount} for unprocessed items.`);

            try {
              const retryParams = {
                RequestItems: {
                  [process.env.AWS_TABLE_NAME as string]:
                    batchData.UnprocessedItems[
                      process.env.AWS_TABLE_NAME as string
                    ], // Retry ONLY the unprocessed items
                },
              };
              const retryCommand = new BatchWriteCommand(retryParams);
              const retryData = await dynamoDb.send(retryCommand);

              // Check if retry was successful
              if (
                !retryData.UnprocessedItems ||
                !retryData.UnprocessedItems[
                  process.env.AWS_TABLE_NAME as string
                ]
              ) {
                console.log("Retry successful!");
                break; // Exit the retry loop if successful
              } else {
                console.warn(
                  "Retry failed. Unprocessed items remaining:",
                  retryData.UnprocessedItems[
                    process.env.AWS_TABLE_NAME as string
                  ]
                );
                // Wait for a short period before retrying
                await new Promise((resolve) =>
                  setTimeout(resolve, 2 ** retryCount * 100)
                ); // Exponential backoff (100ms, 200ms, 400ms...)
              }
            } catch (retryError) {
              console.error("Error during retry:", retryError);
              await new Promise((resolve) =>
                setTimeout(resolve, 2 ** retryCount * 100)
              ); // Exponential backoff (to not bombard the server with multiple requests at the same time)
            }
          }

          if (retryCount === retryAttempts) {
            console.error(
              "Max retry attempts reached. Some items may not have been deleted."
            );
          }
        }
      }

      console.log("Tasks deleted:", tasksToDelete.length);
    }

    // Finally, delete the list if all tasks have been deleted successfully
    // Or, if there are no tasks in the list
    const listDeleteParams = {
      TableName: process.env.AWS_TABLE_NAME,
      Key: {
        PK: `USER#${session?.user?.id}`,
        SK: listId,
      },
    };
    const command = new DeleteCommand(listDeleteParams);
    await dynamoDb.send(command);
  } catch (error) {
    console.log("Error while deleting a list and its tasks ", error);
    throw error;
  }
}
