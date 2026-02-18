'use client';

import { useState, useRef } from 'react';
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
    onPhotoUploaded?: () => void;
    onReportProblem?: (taskId: string, reason: string) => void;
    role: Role;
}

export function TaskDetailModal({
    task,
    isOpen,
    onClose,
    onUpdateStatus,
    onAddComment,
    onPhotoUploaded,
    onReportProblem,
    role
}: TaskDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'comments' | 'history'>('info');
    const [newComment, setNewComment] = useState('');
    const [commentVisibility, setCommentVisibility] = useState<'internal' | 'client'>('internal');
    const [uploading, setUploading] = useState(false);
    const [showProblemDialog, setShowProblemDialog] = useState(false);
    const [problemReason, setProblemReason] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const tabs = [
        { id: 'info', label: 'Info', icon: 'ℹ️' },
        { id: 'photos', label: `Fotos (${task.photos.length})`, icon: '📷' },
        { id: 'comments', label: `Kommentare (${task.comments.length})`, icon: '💬' },
        { id: 'history', label: 'Verlauf', icon: '📜' },
    ] as const;

    const statuses: { status: TaskStatus; label: string; shortIcon: string }[] = [
        { status: 'pending', label: 'Offen', shortIcon: '○' },
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

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('taskId', task.id);
                formData.append('visibility', 'internal');

                const res = await fetch('/api/photos', { method: 'POST', body: formData });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Upload fehlgeschlagen');
                }
            }
            onPhotoUploaded?.();
            setActiveTab('photos');
        } catch (error) {
            console.error('Photo upload failed:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleReportProblem = () => {
        if (!problemReason.trim()) return;
        if (onReportProblem) {
            onReportProblem(task.id, problemReason);
        } else if (onUpdateStatus) {
            // Fallback: set status to blocked via PATCH
            fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'blocked', blockedReason: problemReason }),
            }).then(() => {
                onUpdateStatus('blocked');
            }).catch(console.error);
        }
        setShowProblemDialog(false);
        setProblemReason('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-label={`Aufgabe: ${task.title}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal - fullscreen on mobile, centered card on desktop */}
            <div className="relative bg-white dark:bg-gray-900 sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Back arrow on mobile, hidden on desktop */}
                        <button
                            onClick={onClose}
                            aria-label="Zurück"
                            className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 -ml-2"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        </button>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{task.title}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {task.tradeName} {task.contractorName && `· ${task.contractorName}`}
                            </p>
                        </div>
                    </div>
                    {/* Close X on desktop only */}
                    <button
                        onClick={onClose}
                        aria-label="Schließen"
                        className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-gray-800 px-2 sm:px-5 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0
                ${activeTab === tab.id
                                    ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                <StatusBadge status={task.status} />
                                {task.blockedReason && (
                                    <p className="mt-2 text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded-lg">
                                        ⚠ {task.blockedReason}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            {task.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Beschreibung</label>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{task.description}</p>
                                </div>
                            )}

                            {/* Due Date */}
                            {task.dueDate && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fällig am</label>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{formatDate(task.dueDate)}</p>
                                </div>
                            )}

                            {/* Quick Status Change */}
                            {role !== 'client' && onUpdateStatus && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Status ändern</label>
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
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
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
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 space-y-1">
                                <p>Erstellt: {formatDate(task.createdAt)}</p>
                                <p>Zuletzt aktualisiert: {formatDate(task.updatedAt)}</p>
                            </div>
                        </div>
                    )}

                    {/* Photos Tab */}
                    {activeTab === 'photos' && (
                        <div>
                            {task.photos.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <svg className="text-gray-400" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <path d="M21 15l-5-5L5 21" />
                                        </svg>
                                    </div>
                                    <p>Keine Fotos vorhanden</p>
                                    {role !== 'client' && (
                                        <p className="text-sm mt-2">Nutzen Sie den Foto-Button unten</p>
                                    )}
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
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <svg className="text-gray-400" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                    </div>
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
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Kommentar schreiben..."
                                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                    />
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-500 dark:text-gray-400">Sichtbar für:</label>
                                            <select
                                                value={commentVisibility}
                                                onChange={(e) => setCommentVisibility(e.target.value as 'internal' | 'client')}
                                                className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                            {task.updatedAt.getTime() !== task.createdAt.getTime() && (
                                <div className="flex items-start gap-3 text-sm">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                        task.status === 'done' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                        task.status === 'blocked' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                                        task.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                        'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                    }`}>
                                        {task.status === 'done' ? '✓' : task.status === 'blocked' ? '⚠' : task.status === 'in_progress' ? '→' : '○'}
                                    </span>
                                    <div>
                                        <p className="text-gray-900 dark:text-gray-100">
                                            Status: {task.status === 'pending' ? 'Offen' : task.status === 'in_progress' ? 'In Arbeit' : task.status === 'done' ? 'Erledigt' : 'Blockiert'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(task.updatedAt)}</p>
                                    </div>
                                </div>
                            )}
                            {task.photos.length > 0 && (
                                <div className="flex items-start gap-3 text-sm">
                                    <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 shrink-0">📷</span>
                                    <div>
                                        <p className="text-gray-900 dark:text-gray-100">{task.photos.length} Foto{task.photos.length > 1 ? 's' : ''} hochgeladen</p>
                                    </div>
                                </div>
                            )}
                            {task.comments.length > 0 && (
                                <div className="flex items-start gap-3 text-sm">
                                    <span className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 shrink-0">💬</span>
                                    <div>
                                        <p className="text-gray-900 dark:text-gray-100">{task.comments.length} Kommentar{task.comments.length > 1 ? 'e' : ''}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3 text-sm">
                                <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 shrink-0">+</span>
                                <div>
                                    <p className="text-gray-900 dark:text-gray-100">Aufgabe erstellt</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(task.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Problem Report Dialog */}
                {showProblemDialog && (
                    <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center p-6">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 w-full max-w-sm shadow-xl">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Problem melden</h3>
                            <textarea
                                value={problemReason}
                                onChange={(e) => setProblemReason(e.target.value)}
                                placeholder="Beschreiben Sie das Problem..."
                                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                autoFocus
                            />
                            <div className="flex gap-2 mt-3">
                                <Button variant="secondary" fullWidth onClick={() => { setShowProblemDialog(false); setProblemReason(''); }}>
                                    Abbrechen
                                </Button>
                                <Button variant="primary" fullWidth onClick={handleReportProblem} disabled={!problemReason.trim()}>
                                    Melden
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                />

                {/* Footer Actions (Mobile-friendly) */}
                {role !== 'client' && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex gap-2" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
                        <Button
                            variant="secondary"
                            fullWidth
                            icon={uploading ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            )}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            Foto
                        </Button>
                        <Button variant="secondary" fullWidth icon={<span>💬</span>} onClick={() => setActiveTab('comments')}>
                            Kommentar
                        </Button>
                        {role === 'contractor' && (
                            <Button
                                variant="secondary"
                                fullWidth
                                icon={<span>⚠</span>}
                                onClick={() => setShowProblemDialog(true)}
                            >
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
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden group cursor-pointer">
            {photo.fileUrl && photo.fileUrl.startsWith('http') ? (
                <img
                    src={photo.fileUrl}
                    alt={photo.caption || 'Foto'}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="text-gray-300 dark:text-gray-600" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                    </svg>
                </div>
            )}
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
                <svg className="text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
            </div>
        </div>
    );
}

function CommentItem({ comment, role }: { comment: Comment; role: Role }) {
    const roleColors = {
        client: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        architect: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        contractor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[comment.authorRole]}`}>
                    {comment.authorRole === 'architect' ? 'Architekt' : comment.authorRole === 'contractor' ? 'Handwerker' : 'Kunde'}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{comment.authorName}</span>
                {role !== 'client' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${comment.visibility === 'client' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                        {comment.visibility === 'client' ? 'Kunde sieht' : 'Intern'}
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
            <p className="text-xs text-gray-400 mt-2">{formatDate(comment.createdAt)} · {formatTime(comment.createdAt)}</p>
        </div>
    );
}
