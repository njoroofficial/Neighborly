"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function sendMessageAction(content: string, receiverId: string) {
  const token = (await cookies()).get("session_token")?.value;

  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content, receiver_id: receiverId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to send message: ${response.status}`,
    );
  }

  revalidatePath("/dashboard");
}
