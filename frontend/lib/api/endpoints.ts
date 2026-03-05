/**
 * API Endpoints - All backend API calls
 */

import apiClient from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Company,
  CompanyCreate,
  CompanyUpdate,
  CompanyListResponse,
  CompanyQueryParams,
  Call,
  CallListResponse,
  CallQueryParams,
  KnowledgeDocument,
  KnowledgeListResponse,
  KnowledgeUploadResponse,
  AgentConfig,
  AgentConfigUpdate,
  DashboardMetrics,
  SuperAdminAnalytics,
  CallsByStatus,
  CallsByDay,
  PaginationParams,
} from "./types";

// ============================================================================
// Authentication API
// ============================================================================

export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/api/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/api/auth/register", data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/api/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/api/auth/me");
    return response.data;
  },
};

// ============================================================================
// SuperAdmin API
// ============================================================================

export const superAdminAPI = {
  // Company Management
  listCompanies: async (params?: CompanyQueryParams): Promise<CompanyListResponse> => {
    const response = await apiClient.get<CompanyListResponse>("/api/superadmin/companies", {
      params,
    });
    return response.data;
  },

  getCompany: async (companyId: number): Promise<Company> => {
    const response = await apiClient.get<Company>(`/api/superadmin/companies/${companyId}`);
    return response.data;
  },

  createCompany: async (data: CompanyCreate): Promise<Company> => {
    const response = await apiClient.post<Company>("/api/superadmin/companies", data);
    return response.data;
  },

  updateCompany: async (companyId: number, data: CompanyUpdate): Promise<Company> => {
    const response = await apiClient.put<Company>(
      `/api/superadmin/companies/${companyId}`,
      data
    );
    return response.data;
  },

  deleteCompany: async (companyId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/api/superadmin/companies/${companyId}`
    );
    return response.data;
  },

  // User Management
  listUsers: async (params?: PaginationParams): Promise<{ items: User[]; total: number }> => {
    const response = await apiClient.get<{ items: User[]; total: number }>(
      "/api/superadmin/users",
      { params }
    );
    return response.data;
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await apiClient.get<User>(`/api/superadmin/users/${userId}`);
    return response.data;
  },

  createUser: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>("/api/superadmin/users", data);
    return response.data;
  },

  updateUser: async (
    userId: number,
    data: Partial<User>
  ): Promise<User> => {
    const response = await apiClient.put<User>(`/api/superadmin/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/api/superadmin/users/${userId}`
    );
    return response.data;
  },

  // Analytics
  getAnalytics: async (): Promise<SuperAdminAnalytics> => {
    const response = await apiClient.get<SuperAdminAnalytics>("/api/superadmin/analytics");
    return response.data;
  },

  getCallsByStatus: async (): Promise<CallsByStatus[]> => {
    const response = await apiClient.get<CallsByStatus[]>("/api/superadmin/analytics/calls-by-status");
    return response.data;
  },

  getCallsByDay: async (days: number = 30): Promise<CallsByDay[]> => {
    const response = await apiClient.get<CallsByDay[]>("/api/superadmin/analytics/calls-by-day", {
      params: { days },
    });
    return response.data;
  },
};

// ============================================================================
// Admin API
// ============================================================================

export const adminAPI = {
  // Dashboard
  getDashboard: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get<DashboardMetrics>("/api/admin/dashboard");
    return response.data;
  },

  // Calls
  listCalls: async (params?: CallQueryParams): Promise<CallListResponse> => {
    const response = await apiClient.get<CallListResponse>("/api/admin/calls", { params });
    return response.data;
  },

  getCall: async (callId: string): Promise<Call> => {
    const response = await apiClient.get<Call>(`/api/admin/calls/${callId}`);
    return response.data;
  },

  // Knowledge Base
  listKnowledge: async (params?: PaginationParams): Promise<KnowledgeListResponse> => {
    const response = await apiClient.get<KnowledgeListResponse>("/api/admin/knowledge", {
      params,
    });
    return response.data;
  },

  getKnowledge: async (docId: string): Promise<KnowledgeDocument> => {
    const response = await apiClient.get<KnowledgeDocument>(`/api/admin/knowledge/${docId}`);
    return response.data;
  },

  uploadKnowledge: async (file: File, title: string): Promise<KnowledgeUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    const response = await apiClient.post<KnowledgeUploadResponse>(
      "/api/admin/knowledge/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteKnowledge: async (docId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/api/admin/knowledge/${docId}`
    );
    return response.data;
  },

  // Agent Configuration
  getAgentConfig: async (): Promise<AgentConfig> => {
    const response = await apiClient.get<AgentConfig>("/api/admin/agent/config");
    return response.data;
  },

  updateAgentConfig: async (data: AgentConfigUpdate): Promise<AgentConfig> => {
    const response = await apiClient.put<AgentConfig>("/api/admin/agent/config", data);
    return response.data;
  },

  testAgentVoice: async (voiceId: string, text: string): Promise<{ audio_url: string }> => {
    const response = await apiClient.post<{ audio_url: string }>(
      "/api/admin/agent/test-voice",
      { voice_id: voiceId, test_text: text }
    );
    return response.data;
  },
};
