"use server";

import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";

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
    revalidatePath("/");
    return newName;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
