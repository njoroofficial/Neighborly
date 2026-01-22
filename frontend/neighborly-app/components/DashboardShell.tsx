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
import { useRouter } from "next/navigation";
import ProfileSettings from "@/components/ProfileSettings";
import { sendMessageAction } from "@/app/actions/chat";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { resolveWithReviewAction } from "@/app/actions/requests";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

  // --- STATE MANAGEMENT ---
  const [selectedNeighbor, setSelectedNeighbor] = useState<any | null>(null);

  // View Toggles
  const [isChatting, setIsChatting] = useState(false);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  // Resolve Modal State
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [requestToResolve, setRequestToResolve] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- ACTIONS ---

  // 1. Load Reviews
  async function loadHistory() {
    if (!selectedNeighbor) return;
    setViewingHistory(true); // Switch view

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/users/${selectedNeighbor.id}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  }

  // 2. Chat Logic
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
    await sendMessageAction(text, selectedNeighbor.id);

    const form = document.getElementById("chat-form") as HTMLFormElement;
    if (form) form.reset();
  }

  // 3. Request Logic
  async function handleAcceptRequest(requestId: number) {
    const result = await acceptRequestAction(requestId);
    if (result.success) {
      alert("You have accepted this request! 🦸‍♂️");
    } else {
      alert("Could not accept request.");
    }
  }

  // Open the Modal (Don't submit yet)
  function initiateResolve(requestId: string) {
    setRequestToResolve(requestId);
    setResolveModalOpen(true);
    setRating(5);
    setComment("");
  }

  // Actually Submit to Backend
  async function submitReview() {
    if (!requestToResolve) return;
    setSubmitting(true);

    const res = await resolveWithReviewAction(
      requestToResolve,
      rating,
      comment,
    );

    if (res.success) {
      alert("Review submitted! Request closed. 🌟");
      setResolveModalOpen(false);
    } else {
      alert("Error submitting review.");
    }
    setSubmitting(false);
  }

  const activeRequests = myRequests.filter((r) => r.status !== "resolved");

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
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

      {/* ALERT BANNERS */}
      <div className="flex flex-col gap-3 mb-6">
        {activeRequests.map((req) => (
          <div
            key={req.id}
            className={`p-4 rounded-lg border flex justify-between items-center ${
              req.status === "open"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-orange-50 border-orange-200 text-orange-800"
            }`}
          >
            <div>
              <span className="font-bold mr-2">
                {req.status === "open"
                  ? "🔴 Help Needed:"
                  : "🟠 Help on the way!"}
              </span>
              <span>{req.title}</span>
            </div>

            {/* BUTTON TRIGGERS MODAL */}
            <Button
              size="sm"
              variant="outline"
              className="bg-white hover:bg-slate-100 border-slate-300"
              onClick={() => initiateResolve(req.id)}
            >
              ✅ Mark as Resolved
            </Button>
          </div>
        ))}
      </div>

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
                <AvatarImage
                  src={
                    user.profile_image
                      ? `${user.profile_image}?t=${new Date().getTime()}`
                      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                  }
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
              onNeighborClick={setSelectedNeighbor}
              onRequestAccept={handleAcceptRequest}
            />
          </div>
        </Card>
      </div>

      {/* THE SLIDE-OUT SHEET (Handles 3 Views) */}
      <Sheet
        open={!!selectedNeighbor}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNeighbor(null);
            setIsChatting(false);
            setViewingHistory(false);
          }
        }}
      >
        <SheetContent className="flex flex-col h-full">
          {selectedNeighbor && (
            <>
              {isChatting ? (
                // --- VIEW 1: CHAT ---
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
              ) : viewingHistory ? (
                // --- VIEW 2: HISTORY & REVIEWS ---
                <div className="flex flex-col h-full mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 px-2"
                      onClick={() => setViewingHistory(false)}
                    >
                      ← Back
                    </Button>
                    <SheetTitle>History & Reviews</SheetTitle>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {reviews.length === 0 ? (
                      <div className="text-center py-10 text-slate-500">
                        <p>No reviews yet.</p>
                      </div>
                    ) : (
                      reviews.map((r) => (
                        <div
                          key={r.id}
                          className="bg-slate-50 p-4 rounded-lg border border-slate-100"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-yellow-500 text-sm tracking-wide">
                              {"★".repeat(r.rating)}
                              <span className="text-slate-300">
                                {"★".repeat(5 - r.rating)}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {new Date(r.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            "{r.comment}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                // --- VIEW 3: PROFILE (DEFAULT) ---
                <div className="flex flex-col gap-6 mt-6">
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
                    Member since 2024. Active in the community.
                  </SheetDescription>

                  <div className="mt-auto flex flex-col gap-3">
                    <Button
                      className="w-full py-6 text-lg"
                      onClick={() => setIsChatting(true)}
                    >
                      Message {selectedNeighbor.name}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={loadHistory}
                    >
                      View Full History
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* REVIEW DIALOG (Added to the end of return) */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Request & Review</DialogTitle>
            <DialogDescription>
              Please rate your experience with your neighbor to close this
              request.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* STAR RATING UI */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Tap to Rate:
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${
                      star <= rating ? "text-yellow-400" : "text-slate-200"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500">
                {rating === 5
                  ? "Excellent!"
                  : rating === 4
                    ? "Great"
                    : rating === 3
                      ? "Good"
                      : "Needs Improvement"}
              </span>
            </div>

            {/* COMMENT BOX */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Comment</label>
              <Textarea
                placeholder="How did they help? (e.g. Arrived quickly, very friendly!)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResolveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitReview} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review & Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
