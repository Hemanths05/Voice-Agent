"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Mic,
  Globe,
  Users,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (isAuthenticated && user) {
      if (user.role === "superadmin") {
        router.push("/superadmin");
      } else {
        router.push("/admin");
      }
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary rounded-xl p-2 shadow-sm">
              <Phone className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">VoiceAgent</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="font-medium shadow-sm">
                Get Started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 flex flex-col items-center text-center relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.53 0.24 277 / 0.12), transparent)",
          }}
        />

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary mb-6">
          <Zap className="h-3.5 w-3.5" />
          AI-Powered Voice Agents
        </div>

        <h1 className="max-w-3xl text-5xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08] mb-6">
          Intelligent voice agents
          <br />
          <span className="text-primary">built for your business</span>
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground mb-10 leading-relaxed">
          Deploy, manage, and scale AI-powered phone agents that handle calls,
          answer questions, and delight customers — 24/7 without lifting a finger.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/login">
            <Button size="lg" className="text-base font-semibold px-8 shadow-md">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="text-base font-semibold px-8">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex items-center gap-6 text-sm text-muted-foreground">
          {["No credit card required", "Setup in minutes", "Cancel anytime"].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {t}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted/40 border-y border-border/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Everything you need to run voice AI at scale
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From real-time call management to deep analytics — one platform handles it all.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Mic className="h-5 w-5" />,
                title: "Smart Voice Agents",
                desc: "Natural, context-aware conversations powered by the latest AI models.",
              },
              {
                icon: <BarChart3 className="h-5 w-5" />,
                title: "Real-Time Analytics",
                desc: "Live dashboards showing call volume, duration, outcomes, and trends.",
              },
              {
                icon: <Globe className="h-5 w-5" />,
                title: "Knowledge Base",
                desc: "Upload docs and let agents answer questions accurately from your data.",
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Enterprise Security",
                desc: "Role-based access control and encrypted data at every layer.",
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "Multi-Tenant",
                desc: "Manage multiple companies and teams from a single control panel.",
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Instant Setup",
                desc: "Configure your agent in minutes — no engineering required.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
              >
                <div className="bg-primary/10 text-primary rounded-xl p-2.5 w-fit mb-4 group-hover:bg-primary/15 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 flex flex-col items-center text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          Ready to transform your call operations?
        </h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Join hundreds of businesses using VoiceAgent to automate customer conversations.
        </p>
        <Link href="/login">
          <Button size="lg" className="text-base font-semibold px-10 shadow-md">
            Start for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <Phone className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground">VoiceAgent Platform</span>
          </div>
          <p>© {new Date().getFullYear()} VoiceAgent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
