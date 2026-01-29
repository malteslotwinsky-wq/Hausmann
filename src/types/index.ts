// Core Types for Bauproject Timeline

// Roles
export type Role = 'client' | 'architect' | 'contractor';

// Visibility
export type Visibility = 'internal' | 'client';

// Status
export type TaskStatus = 'open' | 'in_progress' | 'done' | 'blocked';
export type ProjectStatus = 'active' | 'completed' | 'paused';

// User
export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  assignedTradeIds?: string[]; // For contractors
  projectIds?: string[]; // For clients
  createdAt: Date;
}

// Project
export interface Project {
  id: string;
  name: string;
  address: string;
  clientId: string;
  clientName?: string;
  startDate: Date;
  targetEndDate: Date;
  status: ProjectStatus;
  trades: Trade[];
  createdAt: Date;
  updatedAt: Date;
}

// Trade (Gewerk)
export interface Trade {
  id: string;
  projectId: string;
  name: string;
  contractorId?: string;
  contractorName?: string;
  order: number;
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

// Diary Entry (Bautagebuch)
export interface DiaryEntry {
  date: Date;
  entries: {
    type: 'status_change' | 'photo' | 'comment';
    tradeName: string;
    taskTitle: string;
    content: string;
    photo?: Photo;
    comment?: Comment;
    timestamp: Date;
  }[];
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
