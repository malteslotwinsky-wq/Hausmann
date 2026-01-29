'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ClientDashboard } from '@/components/views/ClientDashboard';
import { ArchitectDashboard } from '@/components/views/ArchitectDashboard';
import { ContractorDashboard } from '@/components/views/ContractorDashboard';
import { ProjectList } from '@/components/features/ProjectList';
import { demoProjects } from '@/lib/demo-data';
import { Project, TaskStatus, Role } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';

function HomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectList, setShowProjectList] = useState(true);

  // Get user info from session
  const user = session?.user;
  const role = user?.role as Role | undefined;

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data: any[] = await res.json();

        // Parse dates
        const parsedProjects: Project[] = data.map(p => ({
          ...p,
          startDate: new Date(p.startDate),
          targetEndDate: new Date(p.targetEndDate),
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          trades: p.trades.map((t: any) => ({
            ...t,
            tasks: t.tasks.map((task: any) => ({
              ...task,
              createdAt: new Date(task.createdAt),
              updatedAt: new Date(task.updatedAt),
              // Photos and comments also need parsing if they exist
            }))
          }))
        }));

        // Filter projects based on user access
        let accessibleProjects = parsedProjects;
        if (role === 'client' && user?.projectIds) {
          accessibleProjects = parsedProjects.filter(p => user.projectIds?.includes(p.id));
        } else if (role === 'contractor') {
          // Contractors see projects with their assigned trades
          // For simplicity, show all projects for now, filter tasks later
          accessibleProjects = parsedProjects;
        }
        setProjects(accessibleProjects);

        // Auto-select if only one project (Logic preserved)
        if (role === 'client' && accessibleProjects.length === 1) {
          setSelectedProject(accessibleProjects[0]);
          setShowProjectList(false);
        }
      } else {
        console.error('Failed to fetch projects:', res.statusText);
      }
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🏗</span>
          </div>
          <p className="text-gray-500">Laden...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - should be handled by middleware, but just in case
  if (!session || !user) {
    router.push('/login');
    return null;
  }

  // Handle task status updates
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    if (!selectedProject) return;
    setSelectedProject(prev => prev ? {
      ...prev,
      trades: prev.trades.map(trade => ({
        ...trade,
        tasks: trade.tasks.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus, updatedAt: new Date() }
            : task
        ),
      })),
    } : null);
  };

  // Handle photo visibility toggle
  const handleTogglePhotoVisibility = (photoId: string) => {
    if (!selectedProject) return;
    setSelectedProject(prev => prev ? {
      ...prev,
      trades: prev.trades.map(trade => ({
        ...trade,
        tasks: trade.tasks.map(task => ({
          ...task,
          photos: task.photos.map(photo =>
            photo.id === photoId
              ? { ...photo, visibility: photo.visibility === 'client' ? 'internal' : 'client' }
              : photo
          ),
        })),
      })),
    } : null);
  };

  // Handle reporting a problem
  const handleReportProblem = (taskId: string, reason: string) => {
    if (!selectedProject) return;
    setSelectedProject(prev => prev ? {
      ...prev,
      trades: prev.trades.map(trade => ({
        ...trade,
        tasks: trade.tasks.map(task =>
          task.id === taskId
            ? { ...task, status: 'blocked' as TaskStatus, blockedReason: reason, updatedAt: new Date() }
            : task
        ),
      })),
    } : null);
  };

  // Show project list for multiple projects
  if (showProjectList && projects.length > 1) {
    return (
      <AppShell currentPage="dashboard">
        <div className="max-w-4xl mx-auto p-4">
          <ProjectList
            projects={projects}
            onSelectProject={(p) => {
              setSelectedProject(p);
              setShowProjectList(false);
            }}
          />
        </div>
      </AppShell>
    );
  }

  // Auto-select first project if only one
  const project = selectedProject || projects[0];
  if (!project) {
    return (
      <AppShell currentPage="dashboard">
        <div className="max-w-4xl mx-auto p-4 text-center py-16">
          <span className="text-6xl block mb-4">🏗</span>
          <p className="text-gray-500">Keine Projekte verfügbar</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell currentPage="dashboard">
      {/* Back button for architects/contractors with multiple projects */}
      {projects.length > 1 && !showProjectList && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <button
            onClick={() => setShowProjectList(true)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            ← Alle Projekte
          </button>
        </div>
      )}

      {role === 'client' && <ClientDashboard project={project} />}

      {role === 'architect' && (
        <ArchitectDashboard
          project={project}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onTogglePhotoVisibility={handleTogglePhotoVisibility}
        />
      )}

      {role === 'contractor' && (
        <ContractorDashboard
          project={project}
          contractorId={user.id}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onReportProblem={handleReportProblem}
        />
      )}
    </AppShell>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <HomeContent />
    </ToastProvider>
  );
}
