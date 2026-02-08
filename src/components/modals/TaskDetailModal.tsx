'use client';

import { useState } from 'react';
import { Task, TaskStatus, Photo, Comment, Role } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatTime } from '@/lib/utils';

interface TaskDetailModalProps {
    task: Task & { tradeName?: string; contractorName?: string };
    isOpen: boolean;
    onClose: () => void;
    onUpdateStatus?: (status: TaskStatus) => void;
    onAddComment?: (content: string, visibility: 'internal' | 'client') => void;
    role: Role;
}

export function TaskDetailModal({
    task,
    isOpen,
    onClose,
    onUpdateStatus,
    onAddComment,
    role
}: TaskDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'comments' | 'history'>('info');
    const [newComment, setNewComment] = useState('');
    const [commentVisibility, setCommentVisibility] = useState<'internal' | 'client'>('internal');

    if (!isOpen) return null;

    const tabs = [
        { id: 'info', label: 'Info', icon: 'ℹ️' },
        { id: 'photos', label: `Fotos (${task.photos.length})`, icon: '📷' },
        { id: 'comments', label: `Kommentare (${task.comments.length})`, icon: '💬' },
        { id: 'history', label: 'Verlauf', icon: '📜' },
    ] as const;

    const statuses: { status: TaskStatus; label: string; shortIcon: string }[] = [
        { status: 'open', label: 'Offen', shortIcon: '○' },
        { status: 'in_progress', label: 'In Arbeit', shortIcon: '→' },
        { status: 'done', label: 'Erledigt', shortIcon: '✓' },
        { status: 'blocked', label: 'Blockiert', shortIcon: '⚠' },
    ];

    const handleSubmitComment = () => {
        if (newComment.trim()) {
            onAddComment?.(newComment, commentVisibility);
            setNewComment('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Aufgabe: ${task.title}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-gray-100">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 truncate">{task.title}</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {task.tradeName} {task.contractorName && `· ${task.contractorName}`}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Schließen"
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                                }
              `}
                        >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    {/* Info Tab */}
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            {/* Current Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <StatusBadge status={task.status} />
                                {task.blockedReason && (
                                    <p className="mt-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                                        ⚠ {task.blockedReason}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            {task.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
                                    <p className="text-gray-600 text-sm">{task.description}</p>
                                </div>
                            )}

                            {/* Due Date */}
                            {task.dueDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fällig am</label>
                                    <p className="text-gray-600 text-sm">{formatDate(task.dueDate)}</p>
                                </div>
                            )}

                            {/* Quick Status Change */}
                            {role !== 'client' && onUpdateStatus && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Status ändern</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {statuses.map(({ status, label, shortIcon }) => (
                                            <button
                                                key={status}
                                                onClick={() => onUpdateStatus(status)}
                                                className={`
                          py-3 rounded-xl text-sm font-medium transition-all duration-200
                          ${task.status === status
                                                        ? status === 'done'
                                                            ? 'bg-green-500 text-white'
                                                            : status === 'in_progress'
                                                                ? 'bg-blue-500 text-white'
                                                                : status === 'blocked'
                                                                    ? 'bg-orange-500 text-white'
                                                                    : 'bg-gray-400 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }
                        `}
                                            >
                                                <span className="text-lg">{shortIcon}</span>
                                                <span className="hidden sm:inline ml-1">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
                                <p>Erstellt: {formatDate(task.createdAt)}</p>
                                <p>Zuletzt aktualisiert: {formatDate(task.updatedAt)}</p>
                            </div>
                        </div>
                    )}

                    {/* Photos Tab */}
                    {activeTab === 'photos' && (
                        <div>
                            {task.photos.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <span className="text-4xl block mb-3">📷</span>
                                    <p>Keine Fotos vorhanden</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {task.photos.map((photo) => (
                                        <PhotoThumbnail key={photo.id} photo={photo} role={role} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Comments Tab */}
                    {activeTab === 'comments' && (
                        <div className="space-y-4">
                            {/* Existing Comments */}
                            {task.comments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="text-4xl block mb-3">💬</span>
                                    <p>Noch keine Kommentare</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {task.comments
                                        .filter(c => role !== 'client' || c.visibility === 'client')
                                        .map((comment) => (
                                            <CommentItem key={comment.id} comment={comment} role={role} />
                                        ))}
                                </div>
                            )}

                            {/* Add Comment */}
                            {role !== 'client' && (
                                <div className="pt-4 border-t border-gray-100">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Kommentar schreiben..."
                                        className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-500">Sichtbar für:</label>
                                            <select
                                                value={commentVisibility}
                                                onChange={(e) => setCommentVisibility(e.target.value as 'internal' | 'client')}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                                            >
                                                <option value="internal">Nur intern</option>
                                                <option value="client">Auch für Kunde</option>
                                            </select>
                                        </div>
                                        <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()}>
                                            Senden
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* History Tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 text-sm">
                                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">✓</span>
                                <div>
                                    <p className="text-gray-900">Status auf "In Arbeit" gesetzt</p>
                                    <p className="text-xs text-gray-500">{formatDate(task.updatedAt)} · System</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">+</span>
                                <div>
                                    <p className="text-gray-900">Aufgabe erstellt</p>
                                    <p className="text-xs text-gray-500">{formatDate(task.createdAt)} · System</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions (Mobile-friendly) */}
                {role !== 'client' && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
                        <Button variant="secondary" fullWidth icon={<span>📷</span>}>
                            Foto
                        </Button>
                        <Button variant="secondary" fullWidth icon={<span>💬</span>} onClick={() => setActiveTab('comments')}>
                            Kommentar
                        </Button>
                        {role === 'contractor' && (
                            <Button variant="secondary" fullWidth icon={<span>⚠</span>}>
                                Problem
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function PhotoThumbnail({ photo, role }: { photo: Photo; role: Role }) {
    return (
        <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-300">
                📷
            </div>
            {/* Visibility Badge */}
            {role !== 'client' && (
                <div className="absolute top-2 right-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${photo.visibility === 'client'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-800/70 text-white'
                        }`}>
                        {photo.visibility === 'client' ? 'Kunde' : 'Intern'}
                    </span>
                </div>
            )}
            {/* Caption */}
            {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs truncate">{photo.caption}</p>
                </div>
            )}
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white text-2xl">🔍</span>
            </div>
        </div>
    );
}

function CommentItem({ comment, role }: { comment: Comment; role: Role }) {
    const roleColors = {
        client: 'bg-emerald-100 text-emerald-700',
        architect: 'bg-blue-100 text-blue-700',
        contractor: 'bg-amber-100 text-amber-700',
    };

    return (
        <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[comment.authorRole]}`}>
                    {comment.authorRole === 'architect' ? 'Architekt' : comment.authorRole === 'contractor' ? 'Handwerker' : 'Kunde'}
                </span>
                <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                {role !== 'client' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${comment.visibility === 'client' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                        {comment.visibility === 'client' ? '👁 Kunde sieht' : '🔒 Intern'}
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
            <p className="text-xs text-gray-400 mt-2">{formatDate(comment.createdAt)} · {formatTime(comment.createdAt)}</p>
        </div>
    );
}
