"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one digit"),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  company_number: z.coerce.number().min(1, "Company Number is required"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setLoading(true);
    const result = await registerUser(data);
    if (!result.success) {
      setError(result.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.35 0.2 277), oklch(0.25 0.12 290))",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 80% 20%, oklch(0.62 0.22 280 / 0.25), transparent)",
          }}
        />
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white/90 hover:text-white transition-colors w-fit z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>

        <div className="z-10">
          <div className="bg-white/15 rounded-2xl p-3 w-fit mb-6 backdrop-blur-sm">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Get started with
            <br />
            VoiceAgent
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            Create your account and deploy your first AI voice agent in under 5 minutes.
          </p>

          <div className="mt-10 space-y-3">
            {[
              "No credit card required to start",
              "AI agents ready in minutes",
              "Full analytics from day one",
              "Enterprise-grade security",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-white/60 shrink-0" />
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs z-10">
          © {new Date().getFullYear()} VoiceAgent Platform
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="lg:hidden inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="bg-primary rounded-xl p-2 shadow-sm">
                <Phone className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-base">VoiceAgent</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-1.5">Create your account</h1>
            <p className="text-muted-foreground text-sm">
              Fill in the details below to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="text-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Jane Smith"
                className="h-10"
                {...register("full_name")}
                disabled={loading}
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="h-10"
                {...register("email")}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-10 pr-10"
                  {...register("password")}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Min 8 chars with uppercase, lowercase, and a number.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company_number" className="text-sm font-medium">
                Company Number
              </Label>
              <Input
                id="company_number"
                type="number"
                placeholder="e.g. 1"
                className="h-10"
                {...register("company_number")}
                disabled={loading}
              />
              {errors.company_number && (
                <p className="text-xs text-destructive">{errors.company_number.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Ask your superadmin for your company number.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
