"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createRequestAction } from "@/app/actions/requests"; // We will build this next!

export default function CreateRequest() {
  const [open, setOpen] = useState(false);

  async function onSubmit(formData: FormData) {
    await createRequestAction(formData);
    setOpen(false); // Close modal on success
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800">
          New Request +
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Ask for Help 📢</DialogTitle>
          <DialogDescription>
            Your neighbors nearby will see this on their map.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">What do you need?</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Jumper cables needed"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Details</Label>
            <Textarea
              id="desc"
              name="description"
              placeholder="My car is dead at the junction..."
              required
            />
          </div>
          <Button type="submit">Post Request</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
