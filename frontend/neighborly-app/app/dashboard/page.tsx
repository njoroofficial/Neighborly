import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get("session_token")?.value;
}

export default async function Dashboard() {
  const token = await getToken();
  if (!token) redirect("/");

  // 1. Fetch User
  const userRes = await fetch("http://127.0.0.1:8000/users/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!userRes.ok) redirect("/");
  const user = await userRes.json();

  // 2. Fetch Neighbors
  const nearbyRes = await fetch(
    "http://127.0.0.1:8000/users/nearby?radius_km=10",
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  const neighbors = nearbyRes.ok ? await nearbyRes.json() : [];

  // 3. Fetch Requests
  const requestsRes = await fetch(
    "http://127.0.0.1:8000/requests/nearby?radius_km=10",
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  const requests = requestsRes.ok ? await requestsRes.json() : [];

  // 4. NEW: Fetch MY requests (to track status)
  const myRequestsRes = await fetch("http://127.0.0.1:8000/requests/me", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const myRequests = myRequestsRes.ok ? await myRequestsRes.json() : [];

  // 5. Render the Client Shell
  return (
    <DashboardShell
      user={user}
      neighbors={neighbors}
      requests={requests}
      myRequests={myRequests}
      token={token}
    />
  );
}
