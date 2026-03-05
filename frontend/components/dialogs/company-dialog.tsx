/**
 * Company Dialog - Create/Edit company form
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { superAdminAPI } from "@/lib/api/endpoints";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Company, CompanyCreate } from "@/lib/api/types";

const companySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone_number: z.string().regex(/^\+[1-9]\d{1,14}$/, "Phone number must be in E.164 format (e.g., +919876543210)"),
  status: z.enum(["active", "suspended", "inactive"]).optional(),
  subscription_tier: z.enum(["free", "basic", "pro", "enterprise"]).optional(),
  ai_provider: z.enum(["openai", "anthropic", "gemini", "groq"]).optional(),
  stt_provider: z.enum(["deepgram", "assemblyai", "whisper", "groq"]).optional(),
  tts_provider: z.enum(["elevenlabs", "playht", "openai"]).optional(),
  max_users: z.number().min(1).optional(),
  max_monthly_calls: z.number().min(1).optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface CompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSuccess: () => void;
}

export function CompanyDialog({ open, onOpenChange, company, onSuccess }: CompanyDialogProps) {
  const isEdit = !!company;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: company
      ? {
          name: company.name,
          phone_number: company.phone_number,
          status: company.status,
          subscription_tier: company.subscription_tier,
          ai_provider: company.ai_provider,
          stt_provider: company.stt_provider,
          tts_provider: company.tts_provider,
          max_users: company.max_users,
          max_monthly_calls: company.max_monthly_calls,
        }
      : {},
  });

  const createMutation = useMutation({
    mutationFn: (data: CompanyCreate) => superAdminAPI.createCompany(data),
    onSuccess: () => {
      reset();
      onSuccess();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CompanyFormData) =>
      superAdminAPI.updateCompany(company!.id, data),
    onSuccess: () => {
      reset();
      onSuccess();
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    if (isEdit) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const error = createMutation.error || updateMutation.error;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Company" : "Create Company"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update company information and settings"
              : "Add a new company to the platform"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {(() => {
                  const detail = (error as any).response?.data?.detail;
                  // Handle Pydantic validation errors (array format)
                  if (Array.isArray(detail)) {
                    return detail.map((err: any, idx: number) => (
                      <div key={idx}>
                        {err.loc?.join(" → ")}: {err.msg}
                      </div>
                    ));
                  }
                  // Handle string errors
                  return detail || "An error occurred";
                })()}
              </AlertDescription>
            </Alert>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" {...register("name")} disabled={isLoading} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input
                id="phone_number"
                placeholder="+919876543210 (E.164 format)"
                {...register("phone_number")}
                disabled={isLoading}
              />
              {errors.phone_number && (
                <p className="text-sm text-destructive">{errors.phone_number.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                International format: +[country code][number]
              </p>
            </div>
          </div>

          {/* Status & Subscription */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscription_tier">Subscription Tier</Label>
              <Select
                value={watch("subscription_tier")}
                onValueChange={(value) => setValue("subscription_tier", value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* AI Providers */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ai_provider">AI Provider</Label>
              <Select
                value={watch("ai_provider")}
                onValueChange={(value) => setValue("ai_provider", value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stt_provider">STT Provider</Label>
              <Select
                value={watch("stt_provider")}
                onValueChange={(value) => setValue("stt_provider", value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepgram">Deepgram</SelectItem>
                  <SelectItem value="assemblyai">AssemblyAI</SelectItem>
                  <SelectItem value="whisper">Whisper</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tts_provider">TTS Provider</Label>
              <Select
                value={watch("tts_provider")}
                onValueChange={(value) => setValue("tts_provider", value as any)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                  <SelectItem value="playht">Play.ht</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_users">Max Users</Label>
              <Input
                id="max_users"
                type="number"
                {...register("max_users", { valueAsNumber: true })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_monthly_calls">Max Monthly Calls</Label>
              <Input
                id="max_monthly_calls"
                type="number"
                {...register("max_monthly_calls", { valueAsNumber: true })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEdit ? "Update Company" : "Create Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
