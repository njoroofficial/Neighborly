"use client";

import { useState, useEffect } from "react";
import Map from "@/components/Map";
import CreateRequest from "@/components/CreateRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { acceptRequestAction } from "@/app/actions/requests";
import { resolveRequestAction } from "@/app/actions/requests";
import { useRouter } from "next/navigation";
import ProfileSettings from "@/components/ProfileSettings";
import { sendMessageAction } from "@/app/actions/chat";
import { Input } from "@/components/ui/input";

interface DashboardShellProps {
  user: any;
  neighbors: any[];
  requests: any[];
  myRequests: any[];
  token: string;
  messages: any[];
}

export default function DashboardShell({
  user,
  neighbors,
  requests,
  myRequests,
  token,
  messages,
}: DashboardShellProps) {
  const router = useRouter();
  // State to track which neighbor is selected
  const [selectedNeighbor, setSelectedNeighbor] = useState<any | null>(null);

  // Toggle View
  const [isChatting, setIsChatting] = useState(false);

  // Filter messages for the selected neighbor
  const conversation = selectedNeighbor
    ? messages
        .filter(
          (m) =>
            (m.sender_id === user.id &&
              m.receiver_id === selectedNeighbor.id) ||
            (m.sender_id === selectedNeighbor.id && m.receiver_id === user.id),
        )
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
    : [];

  async function handleSend(formData: FormData) {
    const text = formData.get("content") as string;
    if (!text || !selectedNeighbor) return;

    // Optimistic update could go here
    await sendMessageAction(text, selectedNeighbor.id);
    // The form will auto-clear if we use a ref, or simple reset logic
  }

  // Handler for accepting requests
  async function handleAcceptRequest(requestId: number) {
    const result = await acceptRequestAction(requestId);
    if (result.success) {
      alert("You have accepted this request! 🦸‍♂️");
      // The map will auto-refresh thanks to revalidatePath,
      // but for instant feedback, you might want to optimistic update (optional)
    } else {
      alert("Could not accept request.");
    }
  }

  // Handler for resolving a request
  async function handleResolve(requestId: string) {
    if (!confirm("Did your neighbor help you? This will close the request."))
      return;

    const result = await resolveRequestAction(requestId);
    if (result.success) {
      alert("Glad you got help! Request closed. 🎉");
    }
  }

  // Find if I have an active request
  const activeRequest = myRequests.find((r) => r.status !== "resolved");

  // The Heartbeat Effect 💓
  useEffect(() => {
    // Set up a timer to refresh data every 5 seconds
    const interval = setInterval(() => {
      router.refresh();
      // This re-runs the page.tsx fetches without reloading the browser window!
    }, 5000);

    // Cleanup the timer when the user leaves the page
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user.name} 👋</p>
        </div>
        <div className="flex gap-2">
          <ProfileSettings token={token} />
          <CreateRequest />
        </div>
      </div>

      {/* ALERT BANNER: Only shows if I have a request! */}

      {activeRequest && (
        <div
          className={`p-4 rounded-lg border flex justify-between items-center ${
            activeRequest.status === "open"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-orange-50 border-orange-200 text-orange-800"
          }`}
        >
          {/* ... Left side text (Help Needed / On the way) ... */}
          <div>
            <span className="font-bold mr-2">
              {activeRequest.status === "open"
                ? "🔴 Help Needed:"
                : "🟠 Help on the way!"}
            </span>
            <span>{activeRequest.title}</span>
          </div>

          {/* NEW: The Resolve Button */}
          <Button
            size="sm"
            variant="outline"
            className="bg-white hover:bg-slate-100 border-slate-300"
            onClick={() => handleResolve(activeRequest.id)}
          >
            ✅ Mark as Resolved
          </Button>
        </div>
      )}

      {/* GRID LAYOUT */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: User Stats */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-16 w-16 overflow-hidden rounded-full border border-slate-200">
                {/* Logic: If user.profile_image exists, use it. Else, use DiceBear. */}
                <AvatarImage
                  // We append ?t=Date.now() to force a reload
                  src={
                    user.profile_image
                      ? `${user.profile_image}?t=${new Date().getTime()}`
                      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                  }
                  // This CSS class makes it resize and crop perfectly into the circle
                  className="object-cover h-full w-full"
                />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-bold text-lg">{user.name}</p>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {user.role}
                </Badge>
              </div>
              <div className="w-full bg-slate-100 p-3 rounded-lg text-center mt-2">
                <span className="block text-2xl font-bold">4.9 ⭐</span>
                <span className="text-xs text-slate-500">Neighbor Rating</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Map Area */}
        <Card className="md:col-span-2 min-h-75 p-0 overflow-hidden relative">
          <div className="h-125 w-full">
            <Map
              lat={user.latitude || -1.2921}
              lng={user.longitude || 36.8219}
              neighbors={neighbors}
              requests={requests}
              // We pass the "setter" function down to the map
              onNeighborClick={setSelectedNeighbor}
              onRequestAccept={handleAcceptRequest}
            />
          </div>
        </Card>
      </div>

      {/* THE SLIDE-OUT PROFILE SHEET */}
      <Sheet
        open={!!selectedNeighbor}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNeighbor(null);
            setIsChatting(false); // Reset to profile view when closing
          }
        }}
      >
        <SheetContent className="flex flex-col h-full">
          {selectedNeighbor && (
            <>
              {isChatting ? (
                // --------------------------------------------------
                // VIEW 1: THE CHAT WINDOW 💬
                // --------------------------------------------------
                <div className="flex flex-col h-full mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 px-2"
                      onClick={() => setIsChatting(false)}
                    >
                      ← Back
                    </Button>
                    <SheetTitle>Chat with {selectedNeighbor.name}</SheetTitle>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-lg mb-4 border border-slate-100">
                    {conversation.length === 0 && (
                      <p className="text-center text-slate-400 text-sm mt-10">
                        No messages yet. Say hi! 👋
                      </p>
                    )}

                    {conversation.map((msg: any) => {
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${
                              isMe
                                ? "bg-slate-900 text-white rounded-br-none"
                                : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Message Input */}
                  <form
                    id="chat-form"
                    action={handleSend}
                    className="flex gap-2 mt-auto pb-2"
                  >
                    <Input
                      name="content"
                      placeholder="Type a message..."
                      autoComplete="off"
                      className="flex-1"
                    />
                    <Button type="submit" size="sm" className="bg-slate-900">
                      Send
                    </Button>
                  </form>
                </div>
              ) : (
                // --------------------------------------------------
                // VIEW 2: THE PROFILE CARD (Your original code) 👤
                // --------------------------------------------------
                <div className="flex flex-col gap-6 mt-6">
                  {/* Header Profile */}
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 overflow-hidden rounded-full border-4 border-slate-100">
                      <AvatarImage
                        src={
                          selectedNeighbor.profile_image
                            ? `${selectedNeighbor.profile_image}?t=${new Date().getTime()}`
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedNeighbor.email}`
                        }
                        className="object-cover h-full w-full"
                      />
                      <AvatarFallback>
                        {selectedNeighbor.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <SheetTitle className="text-2xl mt-4">
                      {selectedNeighbor.name}
                    </SheetTitle>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="capitalize bg-blue-600">
                        {selectedNeighbor.role}
                      </Badge>
                      {selectedNeighbor.is_verified && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          Verified ✅
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded text-center">
                      <span className="block font-bold text-xl">12</span>
                      <span className="text-xs text-slate-500">
                        Helps Given
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded text-center">
                      <span className="block font-bold text-xl">5.0</span>
                      <span className="text-xs text-slate-500">Rating</span>
                    </div>
                  </div>

                  <SheetDescription className="text-center">
                    Member since 2024. Active in the Nairobi Westlands
                    community.
                  </SheetDescription>

                  <div className="mt-auto flex flex-col gap-3">
                    {/* BUTTON UPDATED: Now toggles the chat view */}
                    <Button
                      className="w-full py-6 text-lg"
                      onClick={() => setIsChatting(true)}
                    >
                      Message {selectedNeighbor.name}
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Full History
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
