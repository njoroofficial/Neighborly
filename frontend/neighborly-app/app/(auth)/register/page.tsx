"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/app/actions/auth";
import { useActionState } from "react";

const initialState = {
  success: false,
  message: "",
  errors: {},
};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  // LOCATION STATE ---
  const [location, setLocation] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,
  });
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");

  const handleGetLocation = () => {
    setLocLoading(true);
    setLocError("");

    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocLoading(false);
      },
      (error) => {
        setLocError("Unable to retrieve location. Please allow access.");
        setLocLoading(false);
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🏡</div>
          <CardTitle className="text-2xl">Join Neighborly</CardTitle>
          <CardDescription>
            Create an account to connect with your community.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={formAction} className="space-y-4">
            {/* Global Error Message */}
            {state?.message && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200 flex items-center gap-2">
                <span>⚠️</span> {state.message}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Jane Doe"
                className={state?.errors?.name ? "border-red-500" : ""}
              />
              {state?.errors?.name && (
                <p className="text-red-500 text-xs mt-1">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                className={state?.errors?.email ? "border-red-500" : ""}
              />
              {state?.errors?.email && (
                <p className="text-red-500 text-xs mt-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                className={state?.errors?.password ? "border-red-500" : ""}
              />
              {state?.errors?.password && (
                <p className="text-red-500 text-xs mt-1">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <select
                name="role"
                id="role"
                defaultValue="neighbor"
                className={`flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 ${
                  state?.errors?.role ? "border-red-500" : "border-slate-200"
                }`}
              >
                <option value="neighbor">Neighbor (Here to help/ask)</option>
                <option value="professional">
                  Professional (Plumber, Mechanic, etc.)
                </option>
              </select>
            </div>

            {/* --- NEW: LOCATION SECTION --- */}
            <div className="space-y-2 pt-2">
              <Label>Your Location</Label>

              {/* 1. HIDDEN INPUTS: These send the data to the server action */}
              <input type="hidden" name="latitude" value={location.lat || ""} />
              <input
                type="hidden"
                name="longitude"
                value={location.lng || ""}
              />

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={locLoading || location.lat !== null}
                  className={
                    location.lat
                      ? "border-green-500 text-green-700 bg-green-50"
                      : ""
                  }
                >
                  {locLoading
                    ? "Locating..."
                    : location.lat
                      ? "Location Set ✅"
                      : "📍 Get My Location"}
                </Button>

                {/* Helper text showing coordinates */}
                {location.lat !== null && location.lng !== null && (
                  <p className="text-xs text-slate-500 text-center">
                    Lat: {location.lat.toFixed(4)}, Lng:{" "}
                    {location.lng.toFixed(4)}
                  </p>
                )}

                {/* UI Errors for location */}
                {locError && <p className="text-red-500 text-xs">{locError}</p>}

                {/* Zod Errors for location (if they submit without clicking the button) */}
                {(state?.errors?.latitude || state?.errors?.longitude) && (
                  <p className="text-red-500 text-xs">
                    Location is required. Please click the button above.
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
              disabled={isPending}
            >
              {isPending ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t pt-6">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
