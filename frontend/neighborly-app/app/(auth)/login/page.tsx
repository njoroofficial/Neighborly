"use client";

import Link from "next/link";
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
import { loginAction } from "@/app/actions/auth";
import { useActionState } from "react";

export default function LoginPage() {
  // CHANGED: useActionState returns [state, action, isPending]
  const [state, formAction, isPending] = useActionState(loginAction, {
    success: false,
    message: "",
    errors: {},
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🔑</div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email to access your dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* We bind the formAction here */}
          <form action={formAction} className="space-y-4">
            {/* Global Error Message */}
            {state?.message && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200 flex items-center gap-2">
                <span>⚠️</span> {state.message}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className={state?.errors?.email ? "border-red-500" : ""}
              />
              {state?.errors?.email && (
                <p className="text-red-500 text-xs mt-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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

            {/* Submit Button */}

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800"
              disabled={isPending}
            >
              {isPending ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t pt-6">
          <p className="text-sm text-slate-500">
            New to the neighborhood?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
