'use client';

import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { calculateProjectProgress, formatDate, getDaysUntil } from '@/lib/utils';

interface ProjectListProps {
    projects: Project[];
    onSelectProject: (project: Project) => void;
}

export function ProjectList({ projects, onSelectProject }: ProjectListProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Projekte</h1>
                <p className="text-gray-500">{projects.length} aktive Projekte</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="py-4 text-center">
                        <span className="text-3xl font-bold text-gray-900">{projects.length}</span>
                        <p className="text-sm text-gray-500">Aktiv</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4 text-center">
                        <span className="text-3xl font-bold text-orange-500">
                            {projects.reduce((sum, p) => {
                                return sum + p.trades.reduce((tSum, t) =>
                                    tSum + t.tasks.filter(task => task.status === 'blocked').length, 0);
                            }, 0)}
                        </span>
                        <p className="text-sm text-gray-500">Blockiert</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4 text-center">
                        <span className="text-3xl font-bold text-green-600">
                            {projects.reduce((sum, p) => {
                                const prog = calculateProjectProgress(p);
                                return sum + (prog.totalPercentage === 100 ? 1 : 0);
                            }, 0)}
                        </span>
                        <p className="text-sm text-gray-500">Fertig</p>
                    </CardContent>
                </Card>
            </div>

            {/* Project Cards */}
            <div className="space-y-4">
                {projects.map((project) => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => onSelectProject(project)}
                    />
                ))}
            </div>
        </div>
    );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
    const progress = calculateProjectProgress(project);
    const daysRemaining = getDaysUntil(project.targetEndDate);
    const totalTasks = project.trades.reduce((sum, t) => sum + t.tasks.length, 0);
    const todayUpdates = project.trades.reduce((sum, t) =>
        sum + t.tasks.filter(task => {
            const today = new Date();
            const updated = new Date(task.updatedAt);
            return updated.toDateString() === today.toDateString();
        }).length, 0);

    return (
        <Card hover onClick={onClick} className="cursor-pointer">
            <CardContent className="py-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                            {project.name.includes('Büro') ? '🏢' : '🏠'}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-500">{project.address}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">{progress.totalPercentage}%</span>
                    </div>
                </div>

                <ProgressBar percentage={progress.totalPercentage} size="md" showLabel={false} />

                <div className="flex items-center justify-between mt-3 text-sm">
                    <div className="flex items-center gap-4 text-gray-500">
                        <span>{totalTasks} Aufgaben</span>
                        {progress.blockedCount > 0 && (
                            <span className="text-orange-500 font-medium">⚠ {progress.blockedCount} blockiert</span>
                        )}
                        {todayUpdates > 0 && (
                            <span className="text-green-600 font-medium">📝 {todayUpdates} heute</span>
                        )}
                    </div>
                    <div className="text-gray-400">
                        {daysRemaining > 0 ? (
                            <span>{daysRemaining} Tage verbleibend</span>
                        ) : daysRemaining === 0 ? (
                            <span className="text-orange-500">Fällig heute</span>
                        ) : (
                            <span className="text-red-500">{Math.abs(daysRemaining)} Tage überfällig</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Kunde:</span>
                    <span className="text-xs text-gray-600">{project.clientName}</span>
                    <span className="text-xs text-gray-300 mx-2">|</span>
                    <span className="text-xs text-gray-400">Ziel:</span>
                    <span className="text-xs text-gray-600">{formatDate(project.targetEndDate)}</span>
                </div>
            </CardContent>
        </Card>
    );
}
