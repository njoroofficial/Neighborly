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
