// Core Types for Bauproject Timeline

// Roles
export type Role = 'client' | 'architect' | 'contractor';

// Visibility
export type Visibility = 'internal' | 'client';

// Status
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'blocked';
export type ProjectStatus = 'active' | 'completed' | 'paused' | 'archived';
export type TradeStatus = 'pending' | 'in_progress' | 'done' | 'delayed' | 'blocked';

// Photo Approval Mode
export type PhotoApprovalMode = 'manual' | 'auto';

// User
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  company?: string;
  avatarUrl?: string;
  organizationId?: string;
  assignedTradeIds?: string[];
  projectIds?: string[];
  createdAt: Date;
}

// Project
export interface Project {
  id: string;
  name: string;
  projectNumber?: string;
  address: string;
  clientId?: string;
  clientName?: string;
  architectId?: string;
  architectName?: string;
  startDate: Date;
  targetEndDate: Date;
  status: ProjectStatus;
  // BauLot Settings
  photoApprovalMode?: PhotoApprovalMode;
  escalationHours?: number;
  logoUrl?: string;
  // Relations
  trades: Trade[];
  phases?: ProjectPhase[];
  createdAt: Date;
  updatedAt: Date;
}

// Project Phase (Meilenstein)
export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  order: number;
  startDate?: Date;
  endDate?: Date;
}

// Trade (Gewerk)
export interface Trade {
  id: string;
  projectId: string;
  name: string;
  // Contractor info
  contractorId?: string;
  contractorName?: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  // Details
  description?: string;
  order: number;
  status?: TradeStatus;
  startDate?: Date;
  endDate?: Date;
  // Dependencies
  predecessorTradeId?: string;
  // Budget
  budget?: number;
  // Permissions
  canCreateSubtasks?: boolean;
  // Tasks
  tasks: Task[];
}

// Task (Aufgabe)
export interface Task {
  id: string;
  tradeId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  blockedReason?: string;
  dueDate?: Date;
  photos: Photo[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

// Photo
export interface Photo {
  id: string;
  taskId: string;
  fileUrl: string;
  thumbnailUrl: string;
  uploadedBy: string;
  uploadedByName?: string;
  uploadedAt: Date;
  visibility: Visibility;
  caption?: string;
}

// Comment
export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: Date;
  visibility: Visibility;
}

// Progress calculation helpers
export interface TradeProgress {
  tradeId: string;
  tradeName: string;
  total: number;
  done: number;
  inProgress: number;
  blocked: number;
  open: number;
  percentage: number;
}

export interface ProjectProgress {
  projectId: string;
  trades: TradeProgress[];
  totalPercentage: number;
  blockedCount: number;
}

// Form types for creation
export interface CreateProjectInput {
  name: string;
  projectNumber?: string;
  address: string;
  clientId?: string;
  architectId?: string;
  startDate: string;
  targetEndDate: string;
  photoApprovalMode?: PhotoApprovalMode;
  escalationHours?: number;
  phases?: string[];
}

export interface CreateTradeInput {
  projectId: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  description?: string;
  contractorId?: string;
  startDate?: string;
  endDate?: string;
  predecessorTradeId?: string;
  budget?: number;
  canCreateSubtasks?: boolean;
}
