import Image from "next/image";
import { AnimatedGridPattern } from "../components/ui/grid-pattern";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Animated Microsoft grid background */}
      <AnimatedGridPattern
        numSquares={60}
        maxOpacity={0.15}
        duration={4}
        repeatDelay={1}
        width={28}
        height={28}
        className="fixed inset-0 z-0 [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]"
      />
      <main className="relative z-10 flex flex-col items-center justify-center gap-12 px-4 pt-40 pb-24 sm:pt-56 sm:pb-32">
        {/* Modernized hero section */}
        <section className="flex flex-col items-center gap-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center bg-gradient-to-l from-[#a7c7e7] via-[#b7e7a7] via-[#fff9a7] via-[#ffd1a7] to-[#f7a7a7] bg-clip-text text-transparent">
            Welcome to Your Microsoft Launchpad
          </h1>
          <p className="max-w-2xl text-center text-lg sm:text-2xl text-muted-foreground font-medium leading-relaxed">
            The one-stop onboarding experience for new hires.
            <br />
            <span className="inline-block mt-2 text-primary font-semibold">
              Empower your journey. Connect. Grow. Succeed.
            </span>
          </p>
        </section>
        {/* Call to action */}
        <a
          href="/login"
          className="mt-2 inline-block rounded-full bg-blue-400 text-white px-10 py-4 text-xl font-bold shadow-xl hover:scale-105 hover:shadow-2xl transition-all duration-200"
        >
          Get Started
        </a>
      </main>
      <footer className="relative z-10 mt-auto py-8 w-full flex flex-col items-center gap-2 text-xs text-muted-foreground">
        <div className="flex gap-4">
          <a
            href="https://microsoft.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Microsoft
          </a>
          <a href="/about" className="hover:underline">
            About
          </a>
          <a href="/login" className="hover:underline">
            Sign In
          </a>
        </div>
        <span className="mt-2">
          &copy; {new Date().getFullYear()} Microsoft. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
