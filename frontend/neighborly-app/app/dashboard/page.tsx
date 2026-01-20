import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import Map from "@/components/Map";

// The Fetch Function
async function getUserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return null;

  try {
    const res = await fetch("http://127.0.0.1:8000/users/me", {
      headers: {
        Authorization: `Bearer ${token}`, // Pass the wristband!
      },
      cache: "no-store", // Always fetch fresh data
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

// The Page Component
export default async function Dashboard() {
  const user = await getUserProfile();

  // Safety net: If fetch fails, kick them out
  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      {/* HEADER SECTION */}
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

      {/* WIDGET GRID */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: User Profile & Stats */}
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
              </div>

              <div className="mt-2 text-sm">
                <p className="font-semibold text-slate-700">Email</p>
                <p className="text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Main Status Area (Map) */}
        <Card className="md:col-span-2 min-h-75 p-0 overflow-hidden">
          <div className="h-100 w-full">
            {/* Use logical OR (||) to provide a fallback coordinate */}
            <Map
              lat={user.latitude || -1.2921}
              lng={user.longitude || 36.8219}
            />
          </div>
        </Card>
      </div>
    </main>
  );
}
