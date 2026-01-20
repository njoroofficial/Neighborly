import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Map from "@/components/Map";

// Helper to get token
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

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user.name} 👋</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Settings</Button>
          <Button className="bg-slate-900">New Request +</Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="bg-slate-100 p-3 rounded-lg text-center">
                <span className="block text-2xl font-bold">4.9 ⭐</span>
                <span className="text-xs text-slate-500">Neighbor Rating</span>
              </div>
              <div className="mt-4 text-sm">
                <p className="font-semibold text-slate-700">Role</p>
                <p className="text-slate-500 capitalize">{user.role}</p>
                <p className="font-semibold text-slate-700 mt-2">
                  Neighbors Nearby
                </p>
                <p className="text-slate-500">{neighbors.length} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 min-h-75 p-0 overflow-hidden">
          <div className="h-100 w-full">
            {/* 3. Pass both User and Neighbors to the Map */}
            <Map
              lat={user.latitude || -1.2921}
              lng={user.longitude || 36.8219}
              // We'll need to update the Map component to accept this prop next!
              neighbors={neighbors}
            />
          </div>
        </Card>
      </div>
    </main>
  );
}
