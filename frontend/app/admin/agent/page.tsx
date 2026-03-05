/**
 * Admin Agent Configuration Page - Configure AI agent settings
 */

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { adminAPI } from "@/lib/api/endpoints";
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";

const agentConfigSchema = z.object({
  agent_name: z.string().min(2, "Agent name required"),
  system_prompt: z.string().min(10, "System prompt required"),
  greeting_message: z.string().min(5, "Greeting message required"),
  voice_id: z.string().min(1, "Voice ID required"),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(50).max(4000),
  enable_rag: z.boolean(),
  rag_top_k: z.number().min(1).max(20),
});

type AgentConfigFormData = z.infer<typeof agentConfigSchema>;

export default function AgentConfigPage() {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["agent-config"],
    queryFn: () => adminAPI.getAgentConfig(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AgentConfigFormData>({
    resolver: zodResolver(agentConfigSchema),
    values: config
      ? {
          agent_name: config.agent_name,
          system_prompt: config.system_prompt,
          greeting_message: config.greeting_message,
          voice_id: config.voice_id,
          temperature: config.temperature,
          max_tokens: config.max_tokens,
          enable_rag: config.enable_rag,
          rag_top_k: config.rag_top_k,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: AgentConfigFormData) => adminAPI.updateAgentConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-config"] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const onSubmit = (data: AgentConfigFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Agent Configuration</h1>
            <p className="text-muted-foreground mt-2">
              Customize your AI voice agent&apos;s behavior and personality
            </p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {saveSuccess && (
                <Alert className="mb-6 border-green-500 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Configuration saved successfully!
                  </AlertDescription>
                </Alert>
              )}

              {updateMutation.error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>
                    {(updateMutation.error as any).response?.data?.detail ||
                      "Failed to save configuration"}
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="general" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="prompts">Prompts</TabsTrigger>
                  <TabsTrigger value="voice">Voice & Model</TabsTrigger>
                  <TabsTrigger value="rag">Knowledge Base (RAG)</TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general">
                  <Card>
                    <CardHeader>
                      <CardTitle>General Settings</CardTitle>
                      <CardDescription>
                        Basic configuration for your agent
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="agent_name">Agent Name</Label>
                        <Input
                          id="agent_name"
                          {...register("agent_name")}
                          disabled={updateMutation.isPending}
                        />
                        {errors.agent_name && (
                          <p className="text-sm text-destructive">
                            {errors.agent_name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="greeting_message">Greeting Message</Label>
                        <Input
                          id="greeting_message"
                          {...register("greeting_message")}
                          placeholder="Hello! How can I help you today?"
                          disabled={updateMutation.isPending}
                        />
                        {errors.greeting_message && (
                          <p className="text-sm text-destructive">
                            {errors.greeting_message.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Prompts Tab */}
                <TabsContent value="prompts">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Prompt</CardTitle>
                      <CardDescription>
                        Define your agent&apos;s personality and behavior
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="system_prompt">System Prompt</Label>
                        <textarea
                          id="system_prompt"
                          {...register("system_prompt")}
                          className="w-full min-h-[200px] px-3 py-2 border rounded-md"
                          placeholder="You are a helpful AI assistant..."
                          disabled={updateMutation.isPending}
                        />
                        {errors.system_prompt && (
                          <p className="text-sm text-destructive">
                            {errors.system_prompt.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Voice & Model Tab */}
                <TabsContent value="voice">
                  <Card>
                    <CardHeader>
                      <CardTitle>Voice & Model Settings</CardTitle>
                      <CardDescription>
                        Configure TTS voice and AI model parameters
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="voice_id">Voice ID</Label>
                        <Input
                          id="voice_id"
                          {...register("voice_id")}
                          placeholder="voice-id-from-provider"
                          disabled={updateMutation.isPending}
                        />
                        {errors.voice_id && (
                          <p className="text-sm text-destructive">
                            {errors.voice_id.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="temperature">
                            Temperature ({watch("temperature")?.toFixed(1) || "0.7"})
                          </Label>
                          <input
                            type="range"
                            id="temperature"
                            min="0"
                            max="2"
                            step="0.1"
                            {...register("temperature", { valueAsNumber: true })}
                            className="w-full"
                            disabled={updateMutation.isPending}
                          />
                          <p className="text-xs text-muted-foreground">
                            Higher = more creative, Lower = more focused
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="max_tokens">Max Tokens</Label>
                          <Input
                            type="number"
                            id="max_tokens"
                            {...register("max_tokens", { valueAsNumber: true })}
                            disabled={updateMutation.isPending}
                          />
                          {errors.max_tokens && (
                            <p className="text-sm text-destructive">
                              {errors.max_tokens.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* RAG Tab */}
                <TabsContent value="rag">
                  <Card>
                    <CardHeader>
                      <CardTitle>Knowledge Base (RAG)</CardTitle>
                      <CardDescription>
                        Configure Retrieval-Augmented Generation settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="enable_rag"
                          {...register("enable_rag")}
                          className="h-4 w-4"
                          disabled={updateMutation.isPending}
                        />
                        <Label htmlFor="enable_rag" className="cursor-pointer">
                          Enable RAG (Retrieve from knowledge base)
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rag_top_k">
                          Top K Results ({watch("rag_top_k") || 5})
                        </Label>
                        <input
                          type="range"
                          id="rag_top_k"
                          min="1"
                          max="20"
                          step="1"
                          {...register("rag_top_k", { valueAsNumber: true })}
                          className="w-full"
                          disabled={updateMutation.isPending || !watch("enable_rag")}
                        />
                        <p className="text-xs text-muted-foreground">
                          Number of relevant chunks to retrieve from knowledge base
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Save Button */}
              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={updateMutation.isPending} size="lg">
                  {updateMutation.isPending ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
