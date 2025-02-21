"use server";

import { prisma } from "@/prisma";

export default async function updateDisplayNameByUserId(
  userId: string,
  newName: string
): Promise<void | string> {
  try {
    if (newName === "" || newName == undefined || newName == null) {
      throw new Error("Name cannot be empty");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name: newName },
    });
    return newName;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
