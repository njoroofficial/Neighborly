import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Neighborly
            </span>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block"
            >
              Log in
            </Link>
            <Link href="/register">
              <Button className="bg-slate-900 text-white hover:bg-slate-800">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-125 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10" />

          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-6">
              🎉 Now live in your neighborhood
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
              The social network <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                built for help.
              </span>
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with verified neighbors, ask for help with a flat tire or
              a cup of sugar, and build a safer, kinder community instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700 w-full sm:w-auto shadow-lg shadow-blue-600/20"
                >
                  Join the Community
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-lg w-full sm:w-auto"
                >
                  View Live Map
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. VALUE PROPS / FEATURES */}
        <section className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-2xl mb-6">
                  📍
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Real-time Map
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  See who is nearby and active. Post a request on the map and
                  watch neighbors respond in real-time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl mb-6">
                  🛡️
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Verified & Safe
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Profiles are verified so you know who you are talking to.
                  Check ratings and reviews before accepting help.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl mb-6">
                  💬
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Direct Chat
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Coordinate details privately. Send messages, share locations,
                  and get the job done without sharing your phone number.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS STEPS */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-16">
              How Neighborly Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 -z-10" />

              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-3xl shadow-sm mb-6 z-10">
                  ✍️
                </div>
                <h3 className="font-bold text-lg mb-2">1. Sign Up</h3>
                <p className="text-sm text-slate-500">
                  Create your profile and set your location.
                </p>
              </div>

              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-3xl shadow-sm mb-6 z-10">
                  🆘
                </div>
                <h3 className="font-bold text-lg mb-2">2. Ask for Help</h3>
                <p className="text-sm text-slate-500">
                  Post a request. It appears as a red pin on the map.
                </p>
              </div>

              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-3xl shadow-sm mb-6 z-10">
                  🏃
                </div>
                <h3 className="font-bold text-lg mb-2">3. Get Connected</h3>
                <p className="text-sm text-slate-500">
                  A neighbor accepts and chat opens automatically.
                </p>
              </div>

              <div className="relative">
                <div className="w-24 h-24 mx-auto bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-3xl shadow-sm mb-6 z-10">
                  🌟
                </div>
                <h3 className="font-bold text-lg mb-2">4. Rate & Review</h3>
                <p className="text-sm text-slate-500">
                  Mark it resolved and give your neighbor 5 stars.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. BIG CTA */}
        <section className="py-20 bg-slate-900 text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to meet your neighbors?
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Join thousands of people using Neighborly to build stronger, safer
              communities today.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 px-10 text-lg bg-white text-slate-900 hover:bg-slate-100"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏡</span>
            <span className="font-bold text-slate-900">Neighborly</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Neighborly Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-900">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-900">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
