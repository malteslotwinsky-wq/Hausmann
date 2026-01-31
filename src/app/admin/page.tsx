'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { Role, Project } from '@/types';

interface UserData {
    id: string;
    email: string;
    name: string;
    role: Role;
    phone?: string;
    company?: string;
    projectIds?: string[];
    assignedTradeIds?: string[];
    createdAt: Date;
}

function AdminPageContent() {
    const { data: session, status } = useSession();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'contractors' | 'clients' | 'projects'>('contractors');
    const [users, setUsers] = useState<UserData[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);

    // Form States
    const [userForm, setUserForm] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        company: '',
        role: 'contractor' as 'contractor' | 'client',
        projectIds: [] as string[],
    });

    useEffect(() => {
        if (session?.user?.role === 'architect') {
            loadData();
        }
    }, [session]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showUserModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showUserModal]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, projectsRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/projects')
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (projectsRes.ok) {
                const projectsData = await projectsRes.json();
                setProjects(projectsData.map((p: any) => ({
                    ...p,
                    startDate: new Date(p.startDate),
                    targetEndDate: new Date(p.targetEndDate),
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt),
                    trades: p.trades?.map((t: any) => ({
                        ...t,
                        tasks: t.tasks?.map((task: any) => ({
                            ...task,
                            createdAt: new Date(task.createdAt),
                            updatedAt: new Date(task.updatedAt)
                        })) || []
                    })) || []
                })));
            }
        } catch (error) {
            showToast('Fehler beim Laden der Daten', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') return null;

    if (!session || session.user.role !== 'architect') {
        return (
            <AppShell currentPage="admin">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <span className="text-6xl block mb-4">🔒</span>
                    <p className="text-muted-foreground">Nur für Bauleitung zugänglich.</p>
                </div>
            </AppShell>
        );
    }

    const contractors = users.filter(u => u.role === 'contractor');
    const clients = users.filter(u => u.role === 'client');

    const openCreateUser = (role: 'contractor' | 'client') => {
        setEditingUser(null);
        setUserForm({
            email: '',
            password: '',
            name: '',
            phone: '',
            company: '',
            role,
            projectIds: [],
        });
        setShowUserModal(true);
    };

    const openEditUser = (user: UserData) => {
        setEditingUser(user);
        setUserForm({
            email: user.email,
            password: '',
            name: user.name,
            phone: user.phone || '',
            company: user.company || '',
            role: user.role as 'contractor' | 'client',
            projectIds: user.projectIds || [],
        });
        setShowUserModal(true);
    };

    const handleSaveUser = async () => {
        if (!userForm.email || !userForm.name || (!editingUser && !userForm.password)) {
            showToast('Bitte alle Pflichtfelder ausfüllen', 'error');
            return;
        }

        setLoading(true);
        try {
            if (editingUser) {
                const res = await fetch(`/api/users/${editingUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userForm),
                });

                if (!res.ok) {
                    const error = await res.json();
                    showToast(error.error || 'Fehler beim Aktualisieren', 'error');
                    setLoading(false);
                    return;
                }

                const updated = await res.json();
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updated } : u));
                showToast('Benutzer aktualisiert', 'success');
            } else {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userForm),
                });

                if (!res.ok) {
                    const error = await res.json();
                    showToast(error.error || 'Fehler beim Erstellen', 'error');
                    setLoading(false);
                    return;
                }

                const created = await res.json();
                setUsers([...users, created]);
                showToast('Benutzer erstellt', 'success');
            }

            setShowUserModal(false);
        } catch {
            showToast('Serverfehler', 'error');
        }
        setLoading(false);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Wirklich löschen?')) return;

        try {
            const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId));
                showToast('Benutzer gelöscht', 'success');
            }
        } catch {
            showToast('Fehler beim Löschen', 'error');
        }
    };

    return (
        <AppShell currentPage="admin">
            <div className="min-h-screen bg-background pb-32">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white border-b border-border px-4 py-4">
                    <h1 className="text-headline text-foreground">Verwaltung</h1>
                    <p className="text-sm text-muted-foreground">Benutzer und Projekte verwalten</p>
                </header>

                {/* Tab Navigation */}
                <div className="sticky top-[73px] z-20 bg-background px-4 py-3 border-b border-border">
                    <div className="flex gap-2">
                        {[
                            { id: 'contractors', label: '🔧 Handwerker', count: contractors.length },
                            { id: 'clients', label: '👤 Kunden', count: clients.length },
                            { id: 'projects', label: '🏗 Projekte', count: projects.length },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium tap-active transition-all flex-shrink-0
                                    ${activeTab === tab.id
                                        ? 'bg-accent text-white'
                                        : 'bg-muted text-muted-foreground'
                                    }
                                `}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-xs px-1.5 rounded ${activeTab === tab.id ? 'bg-white/20' : 'bg-border'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 bg-accent rounded-xl animate-pulse mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Laden...</p>
                        </div>
                    ) : (
                        <>
                            {/* Contractors Tab */}
                            {activeTab === 'contractors' && (
                                <>
                                    <button
                                        onClick={() => openCreateUser('contractor')}
                                        className="w-full card-mobile text-center py-4 tap-active border-2 border-dashed border-accent/30 bg-accent/5"
                                    >
                                        <span className="text-accent font-medium">+ Neuen Handwerker anlegen</span>
                                    </button>

                                    {contractors.length === 0 ? (
                                        <div className="card-mobile text-center py-12">
                                            <span className="text-5xl block mb-3">🔧</span>
                                            <p className="text-muted-foreground">Noch keine Handwerker</p>
                                        </div>
                                    ) : (
                                        contractors.map(user => (
                                            <UserCard key={user.id} user={user} projects={projects} onEdit={() => openEditUser(user)} />
                                        ))
                                    )}
                                </>
                            )}

                            {/* Clients Tab */}
                            {activeTab === 'clients' && (
                                <>
                                    <button
                                        onClick={() => openCreateUser('client')}
                                        className="w-full card-mobile text-center py-4 tap-active border-2 border-dashed border-accent/30 bg-accent/5"
                                    >
                                        <span className="text-accent font-medium">+ Neuen Kunden anlegen</span>
                                    </button>

                                    {clients.length === 0 ? (
                                        <div className="card-mobile text-center py-12">
                                            <span className="text-5xl block mb-3">👤</span>
                                            <p className="text-muted-foreground">Noch keine Kunden</p>
                                        </div>
                                    ) : (
                                        clients.map(user => (
                                            <UserCard key={user.id} user={user} projects={projects} onEdit={() => openEditUser(user)} />
                                        ))
                                    )}
                                </>
                            )}

                            {/* Projects Tab */}
                            {activeTab === 'projects' && (
                                <>
                                    <button className="w-full card-mobile text-center py-4 tap-active border-2 border-dashed border-accent/30 bg-accent/5">
                                        <span className="text-accent font-medium">+ Neues Projekt anlegen</span>
                                    </button>

                                    {projects.length === 0 ? (
                                        <div className="card-mobile text-center py-12">
                                            <span className="text-5xl block mb-3">🏗</span>
                                            <p className="text-muted-foreground">Noch keine Projekte</p>
                                        </div>
                                    ) : (
                                        projects.map(project => (
                                            <div key={project.id} className="card-mobile tap-active">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-foreground">{project.name}</h3>
                                                        <p className="text-sm text-muted-foreground truncate">{project.address}</p>
                                                    </div>
                                                    <div className="text-right ml-4">
                                                        <span className="text-2xl font-bold text-accent">{project.trades?.length || 0}</span>
                                                        <p className="text-xs text-muted-foreground">Gewerke</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* User Modal - Bottom Sheet with Scroll Lock */}
            {showUserModal && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
                        onClick={() => setShowUserModal(false)}
                    />
                    {/* Sheet */}
                    <div
                        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl animate-slide-up safe-area-bottom"
                        style={{ maxHeight: '85vh' }}
                    >
                        {/* Handle */}
                        <div className="sticky top-0 bg-white pt-3 pb-2 px-6 border-b border-border rounded-t-2xl">
                            <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-3" />
                            <h2 className="text-xl font-bold text-foreground">
                                {editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
                            </h2>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                            <div className="p-6 space-y-4">
                                {/* Role Toggle (only for new) */}
                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Rolle</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['contractor', 'client'].map(r => (
                                                <button
                                                    key={r}
                                                    onClick={() => setUserForm({ ...userForm, role: r as any })}
                                                    className={`py-3 rounded-xl text-sm font-medium tap-active transition-all ${userForm.role === r ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
                                                        }`}
                                                >
                                                    {r === 'contractor' ? '🔧 Handwerker' : '👤 Kunde'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <InputField label="Name *" value={userForm.name} onChange={v => setUserForm({ ...userForm, name: v })} placeholder="Max Mustermann" />
                                <InputField label="E-Mail *" type="email" value={userForm.email} onChange={v => setUserForm({ ...userForm, email: v })} placeholder="max@firma.de" />
                                <InputField label={editingUser ? "Neues Passwort (optional)" : "Passwort *"} value={userForm.password} onChange={v => setUserForm({ ...userForm, password: v })} placeholder="••••••••" />
                                <InputField label="Telefon" type="tel" value={userForm.phone} onChange={v => setUserForm({ ...userForm, phone: v })} placeholder="+49 123 456789" />
                                <InputField label="Firma" value={userForm.company} onChange={v => setUserForm({ ...userForm, company: v })} placeholder="Musterfirma GmbH" />

                                {/* Project Assignment - for BOTH contractors and clients */}
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Projekte zuweisen
                                    </label>
                                    {projects.length === 0 ? (
                                        <p className="text-sm text-muted-foreground py-2">Noch keine Projekte vorhanden</p>
                                    ) : (
                                        <div className="space-y-2 max-h-40 overflow-y-auto overscroll-contain rounded-xl border border-border p-1">
                                            {projects.map(project => (
                                                <label
                                                    key={project.id}
                                                    className="flex items-center gap-3 py-2.5 px-3 bg-muted rounded-lg cursor-pointer tap-active"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={userForm.projectIds.includes(project.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setUserForm({ ...userForm, projectIds: [...userForm.projectIds, project.id] });
                                                            } else {
                                                                setUserForm({ ...userForm, projectIds: userForm.projectIds.filter(id => id !== project.id) });
                                                            }
                                                        }}
                                                        className="w-5 h-5 rounded accent-accent"
                                                    />
                                                    <span className="text-sm text-foreground">{project.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button onClick={() => setShowUserModal(false)} className="flex-1 btn-mobile btn-mobile-secondary tap-active">
                                        Abbrechen
                                    </button>
                                    <button onClick={handleSaveUser} disabled={loading} className="flex-1 btn-mobile btn-mobile-accent tap-active disabled:opacity-50">
                                        {loading ? 'Speichern...' : (editingUser ? 'Speichern' : 'Erstellen')}
                                    </button>
                                </div>

                                {editingUser && (
                                    <button
                                        onClick={() => { handleDeleteUser(editingUser.id); setShowUserModal(false); }}
                                        className="w-full py-3 text-red-500 text-sm font-medium tap-active hover:bg-red-50 rounded-xl"
                                    >
                                        Benutzer löschen
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AppShell>
    );
}

function UserCard({ user, projects, onEdit }: { user: UserData; projects: Project[]; onEdit: () => void }) {
    const assignedProjects = projects.filter(p => user.projectIds?.includes(p.id));

    return (
        <div onClick={onEdit} className="card-mobile tap-active">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    {user.company && <p className="text-xs text-accent mt-0.5">{user.company}</p>}
                </div>
                <span className="text-muted-foreground">›</span>
            </div>
            {assignedProjects.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-1">
                        {assignedProjects.map(p => (
                            <span key={p.id} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-md">{p.name}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-base"
            />
        </div>
    );
}

export default function AdminPage() {
    return (
        <ToastProvider>
            <AdminPageContent />
        </ToastProvider>
    );
}
