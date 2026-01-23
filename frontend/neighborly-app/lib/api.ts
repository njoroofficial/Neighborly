/**
 * API Configuration
 * Uses environment variable in production, fallback for development
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Get the WebSocket URL based on the API URL
 */
export function getWebSocketUrl(userId: string): string {
  const baseUrl = API_URL.replace("http://", "ws://").replace(
    "https://",
    "wss://",
  );
  return `${baseUrl}/ws/${userId}`;
}
