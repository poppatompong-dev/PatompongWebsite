// TypeScript Types and Interfaces for Portfolio System

// ============================================
// CLIENT TYPES
// ============================================

export interface IClient {
  id: string;
  clientId: string;
  clientName: string;
  slug: string;
  projectCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClientWithProjects extends IClient {
  projects: IProject[];
}

// ============================================
// CATEGORY TYPES
// ============================================

export interface ICategory {
  id: string;
  categoryId: string;
  name: string;
  projectCount: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategoryWithProjects extends ICategory {
  projects: IProject[];
}

// ============================================
// PROJECT TYPES
// ============================================

export interface IProject {
  id: string;
  projectId: string;
  projectNumber: number;
  projectName: string;
  slug: string;
  clientId: string;
  type: string;
  categoryId: string;
  subcategory: string;
  url?: string | null;
  description?: string | null;
  tags?: string | null; // JSON array stored as string
  keywords?: string | null; // JSON array stored as string
  status: "completed" | "in_progress" | "planning";
  startDate?: Date | null;
  completedDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectWithRelations extends IProject {
  client: IClient;
  category: ICategory;
}

export interface IProjectWithParsedTags extends Omit<IProject, "tags" | "keywords"> {
  tags: string[];
  keywords: string[];
  client: IClient;
  category: ICategory;
}

// ============================================
// PORTFOLIO METADATA TYPES
// ============================================

export interface IPortfolioMetadata {
  id: string;
  owner: string;
  position: string;
  startDate?: Date | null;
  description?: string | null;
  totalProjects: number;
  lastUpdated: Date;
  generatedDate: Date;
  updatedAt: Date;
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface IProjectStatistics {
  id: string;
  totalProjects: number;
  byType: Record<string, number>; // JSON parsed
  byCategory: Record<string, number>; // JSON parsed
  byClient: Record<string, number>; // JSON parsed
  byStatus: Record<string, number>; // JSON parsed
  lastUpdated: Date;
  updatedAt: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ISearchParams {
  clientId?: string;
  categoryId?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
  q?: string; // search query
}

// ============================================
// CREATE/UPDATE REQUEST TYPES
// ============================================

export interface ICreateProjectRequest {
  projectId: string;
  projectNumber: number;
  projectName: string;
  slug: string;
  clientId: string;
  type: string;
  categoryId: string;
  subcategory: string;
  url?: string;
  description?: string;
  tags?: string[];
  keywords?: string[];
  status?: "completed" | "in_progress" | "planning";
  startDate?: string | Date;
  completedDate?: string | Date;
}

export interface IUpdateProjectRequest {
  projectName?: string;
  description?: string;
  url?: string;
  status?: "completed" | "in_progress" | "planning";
  tags?: string[];
  keywords?: string[];
  completedDate?: string | Date;
}

export interface ICreateClientRequest {
  clientId: string;
  clientName: string;
  slug: string;
  projectCount?: number;
}

export interface ICreateCategoryRequest {
  categoryId: string;
  name: string;
  projectCount?: number;
  color?: string;
}

// ============================================
// FILTER & QUERY TYPES
// ============================================

export interface IProjectFilter {
  clientId?: string;
  categoryId?: string;
  type?: string;
  status?: string;
  searchQuery?: string;
}

export interface IPaginationOptions {
  page: number;
  limit: number;
  sortBy?: "name" | "date" | "number";
  sortOrder?: "asc" | "desc";
}

// ============================================
// EXPORT TYPES
// ============================================

export interface IProjectExportData {
  projectName: string;
  projectNumber: number;
  clientName: string;
  type: string;
  category: string;
  subcategory: string;
  url?: string;
  description?: string;
  tags?: string;
  keywords?: string;
  status: string;
  startDate?: string;
  completedDate?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type ProjectType =
  | "Google Earth Map"
  | "AppSheet"
  | "Google Looker Studio"
  | "React/Netlify"
  | "React/Netlify - Public View"
  | "React/Vercel"
  | "Google Apps Script"
  | "Firebase";

export type ProjectStatus = "completed" | "in_progress" | "planning";

export type SortField = "projectNumber" | "projectName" | "startDate" | "completedDate";

export type SortOrder = "asc" | "desc";

// ============================================
// HELPER FUNCTIONS FOR TYPES
// ============================================

/**
 * Parse tags from JSON string to array
 */
export const parseTags = (tags: string | null): string[] => {
  if (!tags) return [];
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
};

/**
 * Parse keywords from JSON string to array
 */
export const parseKeywords = (keywords: string | null): string[] => {
  if (!keywords) return [];
  try {
    return JSON.parse(keywords);
  } catch {
    return [];
  }
};

/**
 * Serialize tags array to JSON string
 */
export const serializeTags = (tags: string[] | null): string | null => {
  if (!tags || tags.length === 0) return null;
  return JSON.stringify(tags);
};

/**
 * Serialize keywords array to JSON string
 */
export const serializeKeywords = (keywords: string[] | null): string | null => {
  if (!keywords || keywords.length === 0) return null;
  return JSON.stringify(keywords);
};

/**
 * Convert project to export format
 */
export const projectToExportData = (project: IProjectWithRelations): IProjectExportData => {
  return {
    projectName: project.projectName,
    projectNumber: project.projectNumber,
    clientName: project.client.clientName,
    type: project.type,
    category: project.category.name,
    subcategory: project.subcategory,
    url: project.url || undefined,
    description: project.description || undefined,
    tags: project.tags || undefined,
    keywords: project.keywords || undefined,
    status: project.status,
    startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : undefined,
    completedDate: project.completedDate ? project.completedDate.toISOString().split('T')[0] : undefined,
  };
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | null | undefined): string => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Get status badge color
 */
export const getStatusColor = (status: ProjectStatus): string => {
  switch (status) {
    case "completed":
      return "green";
    case "in_progress":
      return "blue";
    case "planning":
      return "yellow";
    default:
      return "gray";
  }
};

/**
 * Get status label in Thai
 */
export const getStatusLabel = (status: ProjectStatus): string => {
  switch (status) {
    case "completed":
      return "เสร็จสิ้น";
    case "in_progress":
      return "กำลังดำเนิน";
    case "planning":
      return "วางแผน";
    default:
      return "ไม่ระบุ";
  }
};
