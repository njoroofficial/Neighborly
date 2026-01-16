"use server";

export async function loginAction(prevState: any, formData: FormData) {
  // 1. Extract data from the form
  const email = formData.get("email");
  const password = formData.get("password");

  console.log("Server Action running on the server!");
  console.log("Received:", email, password);

  // 2. TODO: Send data to FastAPI backend

  // 3. Return the result to the UI
  return { message: "Login attempted" };
}
