"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// DEFINE SCHEMAS ---

const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["resident", "professional"], {
    message: "Please select a valid role",
  }),
  // Coerce converts the form string "1.23" into number 1.23
  latitude: z.coerce
    .number({ message: "Location is required" })
    .min(-90)
    .max(90),
  longitude: z.coerce
    .number({ message: "Location is required" })
    .min(-180)
    .max(180),
});

const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// REGISTER ACTION ---

export async function registerAction(prevState: any, formData: FormData) {
  // Convert FormData to a plain object
  const data = Object.fromEntries(formData.entries());

  // Validate with Zod
  const validatedFields = RegisterSchema.safeParse(data);

  // If validation fails, return errors to the frontend
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors, // e.g. { email: ["Invalid email"] }
      message: "Please check your inputs.",
    };
  }

  const { name, email, password, role, latitude, longitude } =
    validatedFields.data;

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        latitude,
        longitude,
      }),
    });

    if (!res.ok) {
      // Handle generic backend errors (like "Email already taken")
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message:
          errorData.detail || "Registration failed. Email might be taken.",
      };
    }
  } catch (err) {
    return {
      success: false,
      message: "Connection refused. Is backend running?",
    };
  }

  // Redirect works by throwing an error, so do it outside try/catch
  redirect("/login");
}

// LOGIN ACTION ---

export async function loginAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  const validatedFields = LoginSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid credentials.",
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
      cache: "no-store", // Don't cache the result
    });

    if (!response.ok) {
      return { success: false, message: "Invalid email or password" };
    }

    const data = await response.json();

    // Store the jwt token in a secure cookie

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

  redirect("/dashboard");
}

export async function logoutAction() {
  (await cookies()).delete("session_token");
  redirect("/");
}
