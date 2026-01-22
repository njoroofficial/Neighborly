"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache"; // Crucial! Updates the page data

export async function createRequestAction(formData: FormData) {
  const title = formData.get("title");
  const description = formData.get("description");

  const token = (await cookies()).get("session_token")?.value;

  await fetch("http://127.0.0.1:8000/requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description }),
  });

  // This tells Next.js: "The data on the dashboard changed, refresh it!"
  revalidatePath("/dashboard");
}

export async function acceptRequestAction(requestId: number) {
  const token = (await cookies()).get("session_token")?.value;

  const res = await fetch(
    `http://127.0.0.1:8000/requests/${requestId}/accept`,
    {
      method: "PATCH", // PATCH because we are updating part of the resource
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (res.ok) {
    // Refresh the map to show the updated status
    revalidatePath("/dashboard");
    return { success: true };
  } else {
    return { success: false, error: "Failed to accept request" };
  }
}
