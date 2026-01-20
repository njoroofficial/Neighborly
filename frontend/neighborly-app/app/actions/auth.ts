"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  // 1. Extract data from the form
  const email = formData.get("email");
  const password = formData.get("password");

  // 1. Basic Validation (The "Shield")
  if (!email || !password) {
    return { message: "Please enter both email and password." };
  }

  // 2. TODO: Send data to FastAPI backend
  try {
    // fetch to fastAPI
    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
      cache: "no-cache",
    });

    if (!response.ok) {
      // Handle 401 Unauthorized, etc.
      const errorData = await response.json();
      return {
        message: errorData.detail || "Login failed. Please check credentials.",
      };
    }

    const data = await response.json();

    // success
    // Store the wristband in a secure cookie
    // We await cookies() because in Next.js 15/16 it's async
    (await cookies()).set("session_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
  } catch (error) {
    console.error("Login Error:", error);
    return { message: "Could not connect to the server." };
  }

  // Navigate to the App!
  redirect("/dashboard");
}
