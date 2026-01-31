'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { Role, Project, Trade } from '@/types';

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

const TRADE_TEMPLATES = [
    'Abbrucharbeiten', 'Rohbau', 'Elektroinstallation', 'Sanitärinstallation',
    'Heizung/Klima', 'Trockenbau', 'Estrich', 'Fliesenleger', 'Malerarbeiten',
    'Bodenbeläge', 'Schreiner/Tischler', 'Dachdecker', 'Fenster/Türen', 'Außenanlagen',
];

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
    const [showProjectModal, setShowProjectModal] = useState(false);

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

    const [projectForm, setProjectForm] = useState({
        name: '',
        address: '',
        clientName: '',
        startDate: '',
        targetEndDate: '',
        trades: [] as string[],
    });

    useEffect(() => {
        if (session?.user?.role === 'architect') {
            loadData();
        }
    }, [session]);

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
            password: '', // Don't show password
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
                // Update existing user
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
                // Create new user
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
            <div className="max-w-5xl mx-auto p-4 pb-32">
                {/* Header */}
                <header className="mb-6">
                    <h1 className="text-headline text-foreground">Verwaltung</h1>
                    <p className="text-muted-foreground">Benutzer und Projekte verwalten</p>
                </header>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
                    {[
                        { id: 'contractors', label: '🔧 Handwerker', count: contractors.length },
                        { id: 'clients', label: '👤 Kunden', count: clients.length },
                        { id: 'projects', label: '🏗 Projekte', count: projects.length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap tap-active transition-all
                                ${activeTab === tab.id
                                    ? 'bg-accent text-white shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }
                            `}
                        >
                            {tab.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-white/20' : 'bg-border'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 bg-accent rounded-xl animate-pulse mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Laden...</p>
                    </div>
                ) : (
                    <>
                        {/* Contractors Tab */}
                        {activeTab === 'contractors' && (
                            <div className="space-y-4">
                                <button
                                    onClick={() => openCreateUser('contractor')}
                                    className="w-full card-mobile card-mobile-interactive text-center py-4 tap-active border-2 border-dashed border-border"
                                >
                                    <span className="text-accent font-medium">+ Neuen Handwerker anlegen</span>
                                </button>

                                {contractors.length === 0 ? (
                                    <div className="card-mobile text-center py-12">
                                        <span className="text-5xl block mb-3">🔧</span>
                                        <p className="text-muted-foreground">Noch keine Handwerker angelegt</p>
                                    </div>
                                ) : (
                                    contractors.map(user => (
                                        <UserCard
                                            key={user.id}
                                            user={user}
                                            projects={projects}
                                            onEdit={() => openEditUser(user)}
                                            onDelete={() => handleDeleteUser(user.id)}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {/* Clients Tab */}
                        {activeTab === 'clients' && (
                            <div className="space-y-4">
                                <button
                                    onClick={() => openCreateUser('client')}
                                    className="w-full card-mobile card-mobile-interactive text-center py-4 tap-active border-2 border-dashed border-border"
                                >
                                    <span className="text-accent font-medium">+ Neuen Kunden anlegen</span>
                                </button>

                                {clients.length === 0 ? (
                                    <div className="card-mobile text-center py-12">
                                        <span className="text-5xl block mb-3">👤</span>
                                        <p className="text-muted-foreground">Noch keine Kunden angelegt</p>
                                    </div>
                                ) : (
                                    clients.map(user => (
                                        <UserCard
                                            key={user.id}
                                            user={user}
                                            projects={projects}
                                            onEdit={() => openEditUser(user)}
                                            onDelete={() => handleDeleteUser(user.id)}
                                        />
                                    ))
                                )}
                            </div>
                        )}

                        {/* Projects Tab */}
                        {activeTab === 'projects' && (
                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowProjectModal(true)}
                                    className="w-full card-mobile card-mobile-interactive text-center py-4 tap-active border-2 border-dashed border-border"
                                >
                                    <span className="text-accent font-medium">+ Neues Projekt anlegen</span>
                                </button>

                                {projects.length === 0 ? (
                                    <div className="card-mobile text-center py-12">
                                        <span className="text-5xl block mb-3">🏗</span>
                                        <p className="text-muted-foreground">Noch keine Projekte angelegt</p>
                                    </div>
                                ) : (
                                    projects.map(project => (
                                        <div key={project.id} className="card-mobile card-mobile-interactive tap-active">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-foreground">{project.name}</h3>
                                                    <p className="text-sm text-muted-foreground truncate">{project.address}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Kunde: {project.clientName || 'Nicht zugewiesen'}
                                                    </p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <span className="text-2xl font-bold text-accent">{project.trades?.length || 0}</span>
                                                    <p className="text-xs text-muted-foreground">Gewerke</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* User Modal */}
            {showUserModal && (
                <Modal onClose={() => setShowUserModal(false)}>
                    <h2 className="text-xl font-bold text-foreground mb-4">
                        {editingUser ? 'Benutzer bearbeiten' : 'Neuen Benutzer anlegen'}
                    </h2>

                    <div className="space-y-4">
                        {/* Role Toggle (only for new users) */}
                        {!editingUser && (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Rolle</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setUserForm({ ...userForm, role: 'contractor' })}
                                        className={`py-3 rounded-xl text-sm font-medium transition-colors tap-active ${userForm.role === 'contractor'
                                                ? 'bg-accent text-white'
                                                : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        🔧 Handwerker
                                    </button>
                                    <button
                                        onClick={() => setUserForm({ ...userForm, role: 'client' })}
                                        className={`py-3 rounded-xl text-sm font-medium transition-colors tap-active ${userForm.role === 'client'
                                                ? 'bg-accent text-white'
                                                : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        👤 Kunde
                                    </button>
                                </div>
                            </div>
                        )}

                        <InputField
                            label="Name *"
                            value={userForm.name}
                            onChange={(v) => setUserForm({ ...userForm, name: v })}
                            placeholder="Max Mustermann"
                        />

                        <InputField
                            label="E-Mail *"
                            type="email"
                            value={userForm.email}
                            onChange={(v) => setUserForm({ ...userForm, email: v })}
                            placeholder="max@firma.de"
                        />

                        <InputField
                            label={editingUser ? "Neues Passwort (leer lassen = unverändert)" : "Passwort *"}
                            value={userForm.password}
                            onChange={(v) => setUserForm({ ...userForm, password: v })}
                            placeholder="Mindestens 6 Zeichen"
                        />

                        <InputField
                            label="Telefon"
                            type="tel"
                            value={userForm.phone}
                            onChange={(v) => setUserForm({ ...userForm, phone: v })}
                            placeholder="+49 123 456789"
                        />

                        <InputField
                            label="Firma"
                            value={userForm.company}
                            onChange={(v) => setUserForm({ ...userForm, company: v })}
                            placeholder="Musterfirma GmbH"
                        />

                        {/* Project Assignment for Clients */}
                        {userForm.role === 'client' && (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Projekte zuweisen
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {projects.map(project => (
                                        <label
                                            key={project.id}
                                            className="flex items-center gap-3 py-2.5 px-3 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 tap-active"
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
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => setShowUserModal(false)}
                            className="flex-1 btn-mobile btn-mobile-secondary tap-active"
                        >
                            Abbrechen
                        </button>
                        <button
                            onClick={handleSaveUser}
                            disabled={loading}
                            className="flex-1 btn-mobile btn-mobile-accent tap-active disabled:opacity-50"
                        >
                            {loading ? 'Speichern...' : (editingUser ? 'Speichern' : 'Erstellen')}
                        </button>
                    </div>

                    {/* Delete Button for existing users */}
                    {editingUser && (
                        <button
                            onClick={() => {
                                handleDeleteUser(editingUser.id);
                                setShowUserModal(false);
                            }}
                            className="w-full mt-4 py-3 text-red-500 text-sm font-medium tap-active hover:bg-red-50 rounded-xl"
                        >
                            Benutzer löschen
                        </button>
                    )}
                </Modal>
            )}
        </AppShell>
    );
}

// User Card Component
function UserCard({
    user,
    projects,
    onEdit,
    onDelete,
}: {
    user: UserData;
    projects: Project[];
    onEdit: () => void;
    onDelete: () => void;
}) {
    const assignedProjects = projects.filter(p => user.projectIds?.includes(p.id));

    return (
        <div
            onClick={onEdit}
            className="card-mobile card-mobile-interactive tap-active"
        >
            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    {user.phone && (
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                    )}
                    {user.company && (
                        <p className="text-xs text-accent mt-1">{user.company}</p>
                    )}
                </div>

                {/* Edit indicator */}
                <span className="text-muted-foreground text-lg">›</span>
            </div>

            {/* Assigned Projects (for clients) */}
            {user.role === 'client' && assignedProjects.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1.5">Projekte:</p>
                    <div className="flex flex-wrap gap-1">
                        {assignedProjects.map(project => (
                            <span key={project.id} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-md">
                                {project.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Modal Component
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                onClick={onClose}
            />
            {/* Content */}
            <div className="fixed inset-x-4 bottom-0 top-auto max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl z-50 p-6 animate-slide-up safe-area-bottom">
                <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-4" />
                {children}
            </div>
        </>
    );
}

// Input Field Component
function InputField({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-base"
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
