"use client";

import { useState, useEffect } from "react";
import Map from "@/components/Map";
import CreateRequest from "@/components/CreateRequest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import { logoutAction } from "@/app/actions/auth";
import { MessageSquare, History, ArrowLeft, MapPin } from "lucide-react";

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
  messages: initialMessages,
}: DashboardShellProps) {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState(initialMessages);
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

  // 1. WebSocket Connection ⚡
  useEffect(() => {
    // ws:// for localhost, wss:// for production
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    // Connect to the backend WebSocket
    const ws = new WebSocket(`${protocol}://127.0.0.1:8000/ws/${user.id}`);

    ws.onmessage = (event) => {
      const newMsg = JSON.parse(event.data);
      setMessages((prev: any) => [...prev, newMsg]);
    };

    return () => {
      ws.close();
    };
  }, [user.id]);

  // 2. Load Reviews
  async function loadHistory() {
    if (!selectedNeighbor) return;
    setViewingHistory(true);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/users/${selectedNeighbor.id}/reviews`,
      );
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    }
  }

  // 3. Chat Logic
  const conversation = selectedNeighbor
    ? messages
        .filter(
          (m: any) =>
            (m.sender_id === user.id &&
              m.receiver_id === selectedNeighbor.id) ||
            (m.sender_id === selectedNeighbor.id && m.receiver_id === user.id),
        )
        .sort(
          (a: any, b: any) =>
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

  // 4. Request Logic
  async function handleAcceptRequest(requestId: number) {
    const result = await acceptRequestAction(requestId);
    if (result.success) {
      alert("You have accepted this request! 🦸‍♂️");
    } else {
      alert("Could not accept request.");
    }
  }

  function initiateResolve(requestId: string) {
    setRequestToResolve(requestId);
    setResolveModalOpen(true);
    setRating(5);
    setComment("");
  }

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

  return (
    // Added pb-24 to make space for the mobile bottom bar
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-32 md:pb-8">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="text-slate-500 text-sm md:text-base">
            Welcome back, {user.name} 👋
          </p>
        </div>

        {/* DESKTOP BUTTONS (Hidden on Mobile) */}
        <div className="hidden md:flex gap-2">
          <ProfileSettings token={token} />
          <CreateRequest />
          {/* logout button */}
          <Button variant="outline" onClick={() => logoutAction()}>
            Log Out
          </Button>
        </div>
      </div>

      {/* ALERT BANNERS */}
      <div className="flex flex-col gap-3 mb-6 max-w-4xl mx-auto">
        {activeRequests.map((req) => (
          <div
            key={req.id}
            className={`p-4 rounded-lg border flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center ${
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

            <Button
              size="sm"
              variant="outline"
              className="bg-white hover:bg-slate-100 border-slate-300 w-full sm:w-auto"
              onClick={() => initiateResolve(req.id)}
            >
              ✅ Mark as Resolved
            </Button>
          </div>
        ))}
      </div>

      {/* GRID LAYOUT */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: User Stats (Hidden on mobile to save space, or keep if preferred) */}
        {/* We keep it but make it look nicer on mobile */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row md:flex-col items-center gap-4 md:gap-3">
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
              <div className="text-left md:text-center flex-1">
                <p className="font-bold text-lg">{user.name}</p>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {user.role}
                </Badge>
              </div>
              {/* Rating Bubble */}
              <div className="bg-slate-100 p-2 md:p-3 rounded-lg text-center min-w-20">
                <span className="block text-xl md:text-2xl font-bold">
                  4.9 ⭐
                </span>
                <span className="text-[10px] md:text-xs text-slate-500">
                  Rating
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Map Area */}
        <Card className="md:col-span-2 p-0 overflow-hidden relative shadow-sm border-0 md:border">
          {/* Mobile: Taller map for better visibility */}
          <div className="h-[60vh] md:h-125 w-full">
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

      {/* --- MOBILE BOTTOM NAVIGATION BAR 📱 --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-6 z-50 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {/* 1. Profile Button */}
        <div className="flex flex-col items-center gap-1">
          <ProfileSettings token={token} />
          <span className="text-[10px] font-medium text-slate-500">
            Profile
          </span>
        </div>

        {/* 2. Main Action: Create Request */}
        <div className="-mt-8">
          <CreateRequest />
        </div>

        {/* 3. Map Reset (Optional, simple scroll to top) */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex flex-col items-center gap-1 text-slate-600"
        >
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-medium text-slate-500">Map</span>
        </button>
      </div>

      {/* THE SLIDE-OUT SHEET */}
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
        <SheetContent
          className="flex flex-col h-full w-full sm:max-w-md"
          side="right"
        >
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
                      <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <SheetTitle>Chat with {selectedNeighbor.name}</SheetTitle>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-lg mb-4 border border-slate-100">
                    {conversation.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">No messages yet. Say hi! 👋</p>
                      </div>
                    )}
                    {conversation.map((msg: any) => {
                      const isMe = msg.sender_id === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${
                              isMe
                                ? "bg-blue-600 text-white rounded-br-none"
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
                      className="flex-1 rounded-full"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="rounded-full bg-blue-600 h-10 w-10"
                    >
                      <ArrowLeft className="h-4 w-4 rotate-180" />{" "}
                      {/* Send Icon */}
                    </Button>
                  </form>
                </div>
              ) : viewingHistory ? (
                // --- VIEW 2: HISTORY ---
                <div className="flex flex-col h-full mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-2 px-2"
                      onClick={() => setViewingHistory(false)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" /> Back
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
                // --- VIEW 3: PROFILE ---
                <div className="flex flex-col gap-6 mt-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 overflow-hidden rounded-full border-4 border-slate-100 shadow-sm">
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
                      <Badge className="capitalize bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {selectedNeighbor.role}
                      </Badge>
                      {selectedNeighbor.is_verified && (
                        <Badge
                          variant="outline"
                          className="text-green-700 border-green-200 bg-green-50"
                        >
                          Verified ✅
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                      <span className="block font-bold text-xl">12</span>
                      <span className="text-xs text-slate-500">
                        Helps Given
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                      <span className="block font-bold text-xl">5.0</span>
                      <span className="text-xs text-slate-500">Rating</span>
                    </div>
                  </div>

                  <SheetDescription className="text-center">
                    Member since 2024. Active in the community.
                  </SheetDescription>

                  <div className="mt-auto flex flex-col gap-3">
                    <Button
                      className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
                      onClick={() => setIsChatting(true)}
                    >
                      <MessageSquare className="mr-2 h-5 w-5" /> Message{" "}
                      {selectedNeighbor.name}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full py-6"
                      onClick={loadHistory}
                    >
                      <History className="mr-2 h-5 w-5" /> View Full History
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* REVIEW DIALOG */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Request & Review</DialogTitle>
            <DialogDescription>
              Please rate your experience with your neighbor to close this
              request.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
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

            <div className="space-y-2">
              <Label className="text-sm font-medium">Comment</Label>
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
            <Button
              onClick={submitReview}
              disabled={submitting}
              className="bg-slate-900"
            >
              {submitting ? "Submitting..." : "Submit Review & Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
