"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(content: string, receiverId: string) {
  const token = (await cookies()).get("session_token")?.value;

  await fetch("http://127.0.0.1:8000/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content, receiver_id: receiverId }),
  });

  revalidatePath("/dashboard");
}
