/**
 * API Types - TypeScript definitions for backend API
 */

// ============================================================================
// User & Auth Types
// ============================================================================

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "superadmin" | "admin";
  company_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  company_number: number; // Required - company admins must provide company ID (sequential)
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginResponse {
  user: User;
  tokens: TokenResponse;
}

// ============================================================================
// Company Types
// ============================================================================

export interface Company {
  id: number;
  name: string;
  phone_number: string;
  description?: string;
  industry?: string;
  status: "active" | "suspended" | "inactive";
  subscription_tier?: "free" | "basic" | "pro" | "enterprise";
  ai_provider?: "openai" | "anthropic" | "gemini"| "groq";
  stt_provider?: "deepgram" | "assemblyai" | "whisper" | "groq";
  tts_provider?: "elevenlabs" | "playht" | "openai";
  max_users?: number;
  max_monthly_calls?: number;
  current_call_count?: number;
  created_at: string;
  updated_at: string;
  total_calls?: number;
  total_admins?: number;
}

export interface CompanyCreate {
  name: string;
  phone_number: string;
  status?: string;
  subscription_tier?: string;
  ai_provider?: string;
  stt_provider?: string;
  tts_provider?: string;
  max_users?: number;
  max_monthly_calls?: number;
}

export interface CompanyUpdate {
  name?: string;
  phone_number?: string;
  status?: string;
  subscription_tier?: string;
  ai_provider?: string;
  stt_provider?: string;
  tts_provider?: string;
  max_users?: number;
  max_monthly_calls?: number;
}

export interface CompanyListResponse {
  companies: Company[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// Call Types
// ============================================================================

export interface Call {
  id: string;
  company_id: string;
  call_sid: string;
  from_number: string;
  to_number: string;
  status: "queued" | "in_progress" | "completed" | "failed" | "no_answer";
  direction: "inbound" | "outbound";
  duration_seconds?: number;
  transcript?: string;
  summary?: string;
  sentiment?: string;
  recording_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CallListResponse {
  items: Call[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ============================================================================
// Knowledge Base Types
// ============================================================================

export interface KnowledgeDocument {
  id: string;
  company_id: string;
  title: string;
  filename: string;
  file_size: number;
  content_type: string;
  chunk_count: number;
  status: "processing" | "active" | "failed";
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeUploadResponse {
  document_id: string;
  title: string;
  filename: string;
  chunk_count: number;
  message: string;
}

export interface KnowledgeListResponse {
  items: KnowledgeDocument[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ============================================================================
// Agent Configuration Types
// ============================================================================

export interface AgentConfig {
  id: string;
  company_id: string;
  agent_name: string;
  system_prompt: string;
  greeting_message: string;
  voice_id: string;
  temperature: number;
  max_tokens: number;
  enable_rag: boolean;
  rag_top_k: number;
  created_at: string;
  updated_at: string;
}

export interface AgentConfigUpdate {
  agent_name?: string;
  system_prompt?: string;
  greeting_message?: string;
  voice_id?: string;
  temperature?: number;
  max_tokens?: number;
  enable_rag?: boolean;
  rag_top_k?: number;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface DashboardMetrics {
  total_calls: number;
  active_calls: number;
  completed_calls: number;
  failed_calls: number;
  total_duration_minutes: number;
  avg_call_duration_seconds: number;
  knowledge_docs_count: number;
  knowledge_chunks_count: number;
}

export interface SuperAdminAnalytics {
  total_companies: number;
  active_companies: number;
  suspended_companies: number;
  total_users: number;
  total_calls_all_companies: number;
  active_calls_all_companies: number;
  total_subscriptions_revenue: number;
}

export interface CallsByStatus {
  status: string;
  count: number;
}

export interface CallsByDay {
  date: string;
  count: number;
}

// ============================================================================
// Pagination & Query Params
// ============================================================================

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface CallQueryParams extends PaginationParams {
  status_filter?: string;
  date_from?: string;
  date_to?: string;
}

export interface CompanyQueryParams extends PaginationParams {
  status_filter?: string;
  search?: string;
}
