"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";

export default function ProfileSettings({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);

    // We fetch directly from client here because we are sending a File
    const res = await fetch(`${API_URL}/users/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Browser handles Content-Type for FormData automatically
    });

    if (res.ok) {
      alert("Profile updated! 📸");
      setOpen(false);
      router.refresh(); // Refresh to show new image
    } else {
      alert("Upload failed.");
    }
    setUploading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Settings ⚙️</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleUpload} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="picture">Profile Picture</Label>
            {/* The name="file" must match the FastAPI argument 'file' */}
            <Input
              id="picture"
              name="file"
              type="file"
              accept="image/*"
              required
            />
          </div>
          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
