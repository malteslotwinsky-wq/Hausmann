'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { SwipeableSheet } from '@/components/ui/SwipeableSheet';
import { Role, Project, PhotoApprovalMode } from '@/types';
import { InputField } from '@/components/ui/InputField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface UserData {
    id: string;
    email: string;
    name: string;
    role: Role;
    phone?: string;
    company?: string;
    projectIds?: string[];
}

const DEFAULT_PHASES = ['Erdarbeiten', 'Rohbau', 'Innenausbau', 'Fertigstellung'];

function AdminPageContent() {
    const { data: session, status } = useSession();
    const { showToast } = useToast();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'contractors' | 'clients' | 'projects'>('projects');
    const [users, setUsers] = useState<UserData[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [projectStep, setProjectStep] = useState(1);
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'user' | 'project' | 'trade'; id: string; name: string } | null>(null);

    // User Form
    const [userForm, setUserForm] = useState({
        email: '', password: '', name: '', phone: '', company: '',
        role: 'contractor' as 'contractor' | 'client',
        projectIds: [] as string[],
    });

    // Project Form
    const [projectForm, setProjectForm] = useState({
        name: '',
        projectNumber: '',
        address: '',
        clientId: '',
        startDate: '',
        targetEndDate: '',
        photoApprovalMode: 'manual' as PhotoApprovalMode,
        escalationHours: 48,
        phases: [...DEFAULT_PHASES],
    });

    // Trade Form
    const [tradeForm, setTradeForm] = useState({
        name: '',
        companyName: '',
        contactPerson: '',
        phone: '',
        description: '',
        contractorId: '',
        startDate: '',
        endDate: '',
        budget: '',
        canCreateSubtasks: false,
    });
    const [_autoFilled, _setAutoFilled] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (session?.user?.role === 'architect') loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    // Lock body scroll when modal is open
    useEffect(() => {
        const isModalOpen = showUserModal || showProjectModal || showTradeModal;
        document.body.style.overflow = isModalOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showUserModal, showProjectModal, showTradeModal]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, projectsRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/projects')
            ]);
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setUsers(usersData.data || usersData);
            }
            if (projectsRes.ok) {
                const data = await projectsRes.json();
                setProjects(data.map((p: any) => ({
                    ...p,
                    startDate: new Date(p.startDate),
                    targetEndDate: new Date(p.targetEndDate),
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt),
                })));
            }
        } catch {
            showToast('Fehler beim Laden', 'error');
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

    // User handlers
    const openCreateUser = (role: 'contractor' | 'client') => {
        setEditingUser(null);
        setUserForm({ email: '', password: '', name: '', phone: '', company: '', role, projectIds: [] });
        setShowUserModal(true);
    };

    const openEditUser = (user: UserData) => {
        setEditingUser(user);
        setUserForm({
            email: user.email, password: '', name: user.name,
            phone: user.phone || '', company: user.company || '',
            role: user.role as 'contractor' | 'client',
            projectIds: user.projectIds || [],
        });
        setShowUserModal(true);
    };

    const handleSaveUser = async () => {
        if (!userForm.email || !userForm.name || (!editingUser && !userForm.password)) {
            showToast('Pflichtfelder ausfüllen', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = editingUser
                ? await fetch(`/api/users/${editingUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) })
                : await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) });

            if (!res.ok) throw new Error((await res.json()).error);
            const data = await res.json();
            setUsers(editingUser ? users.map(u => u.id === editingUser.id ? { ...u, ...data } : u) : [...users, data]);
            showToast(editingUser ? 'Aktualisiert' : 'Erstellt', 'success');
            setShowUserModal(false);
        } catch (e: any) {
            showToast(e.message || 'Fehler', 'error');
        }
        setLoading(false);
    };

    // Project handlers
    const openCreateProject = () => {
        setProjectStep(1);
        setProjectForm({
            name: '', projectNumber: '', address: '', clientId: '',
            startDate: '', targetEndDate: '',
            photoApprovalMode: 'manual', escalationHours: 48,
            phases: [...DEFAULT_PHASES],
        });
        setShowProjectModal(true);
    };

    const handleSaveProject = async () => {
        if (!projectForm.name || !projectForm.address || !projectForm.startDate || !projectForm.targetEndDate) {
            showToast('Grunddaten ausfüllen', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectForm),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            const newProject = await res.json();
            showToast('Projekt erstellt', 'success');
            setShowProjectModal(false);

            // Navigate to project detail page for template import
            router.push(`/admin/projects/${newProject.id}`);
        } catch (e: any) {
            showToast(e.message || 'Fehler', 'error');
        }
        setLoading(false);
    };

    // Delete handler
    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            let url = '';
            if (deleteConfirm.type === 'user') url = `/api/users/${deleteConfirm.id}`;
            else if (deleteConfirm.type === 'project') url = `/api/projects/${deleteConfirm.id}`;

            const res = await fetch(url, { method: 'DELETE' });
            if (!res.ok) throw new Error((await res.json()).error);

            if (deleteConfirm.type === 'user') setUsers(users.filter(u => u.id !== deleteConfirm.id));
            else if (deleteConfirm.type === 'project') setProjects(projects.filter(p => p.id !== deleteConfirm.id));

            showToast(`${deleteConfirm.name} gelöscht`, 'success');
        } catch (e: any) {
            showToast(e.message || 'Fehler beim Löschen', 'error');
        }
        setDeleteConfirm(null);
    };

    // Trade handlers
    const openAddTrade = (project: Project) => {
        setSelectedProject(project);
        setTradeForm({
            name: '', companyName: '', contactPerson: '', phone: '',
            description: '', contractorId: '', startDate: '', endDate: '',
            budget: '', canCreateSubtasks: false,
        });
        setShowTradeModal(true);
    };

    const handleSaveTrade = async () => {
        if (!tradeForm.name || !selectedProject) {
            showToast('Gewerk-Name erforderlich', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${selectedProject.id}/trades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...tradeForm,
                    budget: tradeForm.budget ? parseFloat(tradeForm.budget) : undefined,
                }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            showToast('Gewerk angelegt', 'success');
            setShowTradeModal(false);
            loadData();
        } catch (e: any) {
            showToast(e.message || 'Fehler', 'error');
        }
        setLoading(false);
    };

    return (
        <AppShell currentPage="admin">
            <div className="min-h-screen bg-background pb-32 safe-area-bottom">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-surface border-b border-border px-4 py-4">
                    <h1 className="text-headline text-foreground">Verwaltung</h1>
                    <p className="text-sm text-muted-foreground">Projekte, Handwerker & Kunden verwalten</p>
                </header>

                {/* Tabs */}
                <div className="sticky top-[73px] z-20 bg-background px-4 py-3 border-b border-border">
                    <div className="flex gap-2">
                        {[
                            { id: 'projects', label: '🏗 Projekte', count: projects.length },
                            { id: 'contractors', label: '🔧 Handwerker', count: contractors.length },
                            { id: 'clients', label: '👤 Kunden', count: clients.length },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium tap-active transition-all flex-shrink-0 ${activeTab === tab.id ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}
                            >
                                <span>{tab.label}</span>
                                <span className={`text-xs px-1.5 rounded ${activeTab === tab.id ? 'bg-white/20' : 'bg-border'}`}>{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {loading && !showProjectModal && !showTradeModal ? (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 bg-accent rounded-xl animate-pulse mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Laden...</p>
                        </div>
                    ) : (
                        <>
                            {/* Projects Tab */}
                            {activeTab === 'projects' && (
                                <>
                                    <button onClick={openCreateProject} className="w-full card-mobile text-center py-4 tap-active border-2 border-dashed border-accent/30 bg-accent/5">
                                        <span className="text-accent font-medium">+ Neues Projekt anlegen</span>
                                    </button>

                                    {projects.length === 0 ? (
                                        <div className="card-mobile text-center py-12">
                                            <span className="text-5xl block mb-3">🏗</span>
                                            <p className="text-muted-foreground">Noch keine Projekte</p>
                                        </div>
                                    ) : (
                                        projects.map(project => (
                                            <div key={project.id} className="card-mobile">
                                                <button
                                                    onClick={() => router.push(`/admin/projects/${project.id}`)}
                                                    className="w-full text-left tap-active"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-foreground">{project.name}</h3>
                                                            <p className="text-sm text-muted-foreground truncate">{project.address}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                {new Date(project.startDate).toLocaleDateString('de-DE')} – {new Date(project.targetEndDate).toLocaleDateString('de-DE')}
                                                            </p>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <span className="text-2xl font-bold text-accent">{project.trades?.length || 0}</span>
                                                            <p className="text-xs text-muted-foreground">Gewerke</p>
                                                        </div>
                                                    </div>
                                                </button>
                                                {/* Trades list */}
                                                {project.trades && project.trades.length > 0 && (
                                                    <div className="space-y-1 mb-3">
                                                        {project.trades.slice(0, 3).map(trade => (
                                                            <div key={trade.id} className="flex items-center gap-2 py-1.5 px-2 bg-muted rounded-lg text-sm">
                                                                <span className="font-medium text-foreground">{trade.name}</span>
                                                                {trade.companyName && <span className="text-muted-foreground">• {trade.companyName}</span>}
                                                            </div>
                                                        ))}
                                                        {project.trades.length > 3 && (
                                                            <p className="text-xs text-muted-foreground px-2">+{project.trades.length - 3} weitere</p>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => router.push(`/admin/projects/${project.id}`)}
                                                        className="flex-1 py-2.5 text-sm text-foreground font-medium bg-muted rounded-lg tap-active"
                                                    >
                                                        📋 Details
                                                    </button>
                                                    <button
                                                        onClick={() => openAddTrade(project)}
                                                        className="flex-1 py-2.5 text-sm text-accent font-medium bg-accent/10 rounded-lg tap-active"
                                                    >
                                                        + Gewerk
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm({ type: 'project', id: project.id, name: project.name })}
                                                        className="py-2.5 px-3 text-sm text-red-500 font-medium bg-red-500/10 rounded-lg tap-active"
                                                        aria-label="Projekt löschen"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </>
                            )}

                            {/* Contractors Tab */}
                            {activeTab === 'contractors' && (
                                <>
                                    <button onClick={() => openCreateUser('contractor')} className="w-full card-mobile text-center py-4 tap-active border-2 border-dashed border-accent/30 bg-accent/5">
                                        <span className="text-accent font-medium">+ Neuen Handwerker anlegen</span>
                                    </button>
                                    {contractors.length === 0 ? (
                                        <div className="card-mobile text-center py-12">
                                            <span className="text-5xl block mb-3">🔧</span>
                                            <p className="text-muted-foreground">Noch keine Handwerker</p>
                                        </div>
                                    ) : contractors.map(user => (
                                        <UserCard key={user.id} user={user} projects={projects} onEdit={() => openEditUser(user)} onDelete={() => setDeleteConfirm({ type: 'user', id: user.id, name: user.name })} />
                                    ))}
                                </>
                            )}

                            {/* Clients Tab */}
                            {activeTab === 'clients' && (
                                <>
                                    <button onClick={() => openCreateUser('client')} className="w-full card-mobile text-center py-4 tap-active border-2 border-dashed border-accent/30 bg-accent/5">
                                        <span className="text-accent font-medium">+ Neuen Kunden anlegen</span>
                                    </button>
                                    {clients.length === 0 ? (
                                        <div className="card-mobile text-center py-12">
                                            <span className="text-5xl block mb-3">👤</span>
                                            <p className="text-muted-foreground">Noch keine Kunden</p>
                                        </div>
                                    ) : clients.map(user => (
                                        <UserCard key={user.id} user={user} projects={projects} onEdit={() => openEditUser(user)} onDelete={() => setDeleteConfirm({ type: 'user', id: user.id, name: user.name })} />
                                    ))}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ==================== PROJECT CREATION MODAL ==================== */}
            {showProjectModal && (
                <BottomSheet onClose={() => setShowProjectModal(false)} title={`Neues Projekt (${projectStep}/3)`}>
                    {projectStep === 1 && (
                        <div className="space-y-4">
                            <p className="text-muted-foreground text-sm mb-4">Grunddaten des Bauprojekts</p>
                            <InputField label="Projektname *" value={projectForm.name} onChange={v => setProjectForm({ ...projectForm, name: v })} placeholder="Neubau EFH Familie Muster" />
                            <InputField label="Projektnummer" value={projectForm.projectNumber} onChange={v => setProjectForm({ ...projectForm, projectNumber: v })} placeholder="2026-001" />
                            <InputField label="Adresse *" value={projectForm.address} onChange={v => setProjectForm({ ...projectForm, address: v })} placeholder="Musterstraße 123, 12345 Berlin" />
                            <div className="grid grid-cols-2 gap-3">
                                <InputField label="Baubeginn *" type="date" value={projectForm.startDate} onChange={v => setProjectForm({ ...projectForm, startDate: v })} />
                                <InputField label="Fertigstellung *" type="date" value={projectForm.targetEndDate} onChange={v => setProjectForm({ ...projectForm, targetEndDate: v })} />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowProjectModal(false)} className="flex-1 btn-mobile btn-mobile-secondary tap-active">Abbrechen</button>
                                <button onClick={() => setProjectStep(2)} className="flex-1 btn-mobile btn-mobile-accent tap-active">Weiter →</button>
                            </div>
                        </div>
                    )}

                    {projectStep === 2 && (
                        <div className="space-y-4">
                            <p className="text-muted-foreground text-sm mb-4">Beteiligte zuweisen</p>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Bauherr (Kunde)</label>
                                <select
                                    value={projectForm.clientId}
                                    onChange={e => setProjectForm({ ...projectForm, clientId: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:border-accent outline-none text-base"
                                >
                                    <option value="">— Keiner ausgewählt —</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                                </select>
                            </div>
                            <div className="bg-muted p-4 rounded-xl">
                                <p className="text-sm text-muted-foreground">
                                    💡 Der Bauherr erhält Zugang zum Kundenportal und sieht freigegebene Fotos und Fortschritte.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setProjectStep(1)} className="flex-1 btn-mobile btn-mobile-secondary tap-active">← Zurück</button>
                                <button onClick={() => setProjectStep(3)} className="flex-1 btn-mobile btn-mobile-accent tap-active">Weiter →</button>
                            </div>
                        </div>
                    )}

                    {projectStep === 3 && (
                        <div className="space-y-4">
                            <p className="text-muted-foreground text-sm mb-4">BauLot-Einstellungen</p>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Foto-Freigabe</label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'manual', label: 'Manuell freigeben', desc: 'Jedes Foto einzeln prüfen' },
                                        { id: 'auto_milestone', label: 'Bei Meilenstein', desc: 'Automatisch bei Phasenabschluss' },
                                        { id: 'auto_all', label: 'Alle automatisch', desc: 'Sofort für Bauherr sichtbar' },
                                    ].map(opt => (
                                        <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer tap-active ${projectForm.photoApprovalMode === opt.id ? 'bg-accent/10 border-2 border-accent' : 'bg-muted border-2 border-transparent'}`}>
                                            <input type="radio" name="photoMode" checked={projectForm.photoApprovalMode === opt.id} onChange={() => setProjectForm({ ...projectForm, photoApprovalMode: opt.id as PhotoApprovalMode })} className="w-5 h-5 accent-accent" />
                                            <div>
                                                <p className="font-medium text-foreground">{opt.label}</p>
                                                <p className="text-xs text-muted-foreground">{opt.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Eskalationsschwelle</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min="1"
                                        value={projectForm.escalationHours}
                                        onChange={e => setProjectForm({ ...projectForm, escalationHours: parseInt(e.target.value) || 48 })}
                                        className="w-24 px-4 py-3 rounded-xl border border-border bg-surface text-center text-base"
                                    />
                                    <span className="text-muted-foreground">Stunden bis Eskalation</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 pb-safe">
                                <button onClick={() => setProjectStep(2)} className="flex-1 btn-mobile btn-mobile-secondary tap-active">← Zurück</button>
                                <button onClick={handleSaveProject} disabled={loading} className="flex-1 btn-mobile btn-mobile-accent tap-active disabled:opacity-50">
                                    {loading ? 'Erstellen...' : 'Projekt erstellen ✓'}
                                </button>
                            </div>
                        </div>
                    )}
                </BottomSheet>
            )}

            {/* ==================== TRADE CREATION MODAL ==================== */}
            {showTradeModal && selectedProject && (
                <BottomSheet
                    onClose={() => setShowTradeModal(false)}
                    title={`Gewerk für "${selectedProject.name}"`}
                    footer={
                        <div className="flex gap-3 pb-safe">
                            <button onClick={() => setShowTradeModal(false)} className="flex-1 btn-mobile btn-mobile-secondary tap-active">Abbrechen</button>
                            <button onClick={handleSaveTrade} disabled={loading} className="flex-1 btn-mobile btn-mobile-accent tap-active disabled:opacity-50">
                                {loading ? 'Speichern...' : 'Gewerk anlegen ✓'}
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <InputField label="Gewerk-Bezeichnung *" value={tradeForm.name} onChange={v => setTradeForm({ ...tradeForm, name: v })} placeholder="z.B. Sanitär-Rohinstallation" />
                        <InputField label="Firma" value={tradeForm.companyName} onChange={v => setTradeForm({ ...tradeForm, companyName: v })} placeholder="Elektro Meier GmbH" />
                        <InputField label="Ansprechpartner" value={tradeForm.contactPerson} onChange={v => setTradeForm({ ...tradeForm, contactPerson: v })} placeholder="Max Müller" />
                        <InputField label="Mobilnummer" type="tel" value={tradeForm.phone} onChange={v => setTradeForm({ ...tradeForm, phone: v })} placeholder="+49 171 1234567" />
                        <InputField label="Leistungsbeschreibung" value={tradeForm.description} onChange={v => setTradeForm({ ...tradeForm, description: v })} placeholder="Kurze Beschreibung der Arbeiten" />

                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Startdatum" type="date" value={tradeForm.startDate} onChange={v => setTradeForm({ ...tradeForm, startDate: v })} />
                            <InputField label="Enddatum" type="date" value={tradeForm.endDate} onChange={v => setTradeForm({ ...tradeForm, endDate: v })} />
                        </div>

                        <InputField label="Budget (€)" type="number" value={tradeForm.budget} onChange={v => setTradeForm({ ...tradeForm, budget: v })} placeholder="z.B. 15000" />

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Handwerker zuweisen</label>
                            <select
                                value={tradeForm.contractorId}
                                onChange={e => setTradeForm({ ...tradeForm, contractorId: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:border-accent outline-none text-base"
                            >
                                <option value="">— Später zuweisen —</option>
                                {contractors.map(c => <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
                            </select>
                        </div>

                        <label className="flex items-center gap-3 py-3 cursor-pointer tap-active">
                            <input type="checkbox" checked={tradeForm.canCreateSubtasks} onChange={e => setTradeForm({ ...tradeForm, canCreateSubtasks: e.target.checked })} className="w-5 h-5 rounded accent-accent" />
                            <span className="text-foreground">Handwerker darf Unteraufträge anlegen</span>
                        </label>
                    </div>
                </BottomSheet>
            )}

            {/* ==================== DELETE CONFIRMATION ==================== */}
            <ConfirmDialog
                isOpen={deleteConfirm !== null}
                title={deleteConfirm?.type === 'project' ? 'Projekt löschen?' : 'Benutzer löschen?'}
                message={`Möchten Sie "${deleteConfirm?.name}" wirklich unwiderruflich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
                confirmLabel="Endgültig löschen"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(null)}
            />

            {/* ==================== USER MODAL ==================== */}
            {showUserModal && (
                <BottomSheet
                    onClose={() => setShowUserModal(false)}
                    title={editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
                    footer={
                        <div className="flex gap-3 pb-safe">
                            <button onClick={() => setShowUserModal(false)} className="flex-1 btn-mobile btn-mobile-secondary tap-active">Abbrechen</button>
                            <button onClick={handleSaveUser} disabled={loading} className="flex-1 btn-mobile btn-mobile-accent tap-active disabled:opacity-50">
                                {loading ? 'Speichern...' : (editingUser ? 'Speichern' : 'Erstellen')}
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        {!editingUser && (
                            <div className="grid grid-cols-2 gap-2">
                                {['contractor', 'client'].map(r => (
                                    <button key={r} onClick={() => setUserForm({ ...userForm, role: r as any })} className={`py-3 rounded-xl text-sm font-medium tap-active ${userForm.role === r ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                                        {r === 'contractor' ? '🔧 Handwerker' : '👤 Kunde'}
                                    </button>
                                ))}
                            </div>
                        )}
                        <InputField label="Name *" value={userForm.name} onChange={v => setUserForm({ ...userForm, name: v })} placeholder="Max Mustermann" />
                        <InputField label="E-Mail *" type="email" value={userForm.email} onChange={v => setUserForm({ ...userForm, email: v })} placeholder="max@firma.de" />
                        <InputField label={editingUser ? "Neues Passwort" : "Passwort *"} value={userForm.password} onChange={v => setUserForm({ ...userForm, password: v })} placeholder="••••••••" />
                        <InputField label="Telefon" type="tel" value={userForm.phone} onChange={v => setUserForm({ ...userForm, phone: v })} placeholder="+49 123 456789" />
                        <InputField label="Firma" value={userForm.company} onChange={v => setUserForm({ ...userForm, company: v })} placeholder="Musterfirma GmbH" />

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Projekte zuweisen</label>
                            {projects.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-2">Noch keine Projekte</p>
                            ) : (
                                <div className="space-y-2 max-h-40 overflow-y-auto overscroll-contain rounded-xl border border-border p-1">
                                    {projects.map(project => (
                                        <label key={project.id} className="flex items-center gap-3 py-2.5 px-3 bg-muted rounded-lg cursor-pointer tap-active">
                                            <input type="checkbox" checked={userForm.projectIds.includes(project.id)} onChange={e => {
                                                if (e.target.checked) setUserForm({ ...userForm, projectIds: [...userForm.projectIds, project.id] });
                                                else setUserForm({ ...userForm, projectIds: userForm.projectIds.filter(id => id !== project.id) });
                                            }} className="w-5 h-5 rounded accent-accent" />
                                            <span className="text-sm text-foreground">{project.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </BottomSheet>
            )}
        </AppShell>
    );
}

// ==================== HELPER COMPONENTS ====================

function BottomSheet({ onClose, title, children, footer }: { onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode }) {
    return (
        <SwipeableSheet isOpen={true} onClose={onClose} title={title} maxHeight="85dvh" footer={footer}>
            {children}
        </SwipeableSheet>
    );
}

function UserCard({ user, projects, onEdit, onDelete }: { user: UserData; projects: Project[]; onEdit: () => void; onDelete: () => void }) {
    const assignedProjects = projects.filter(p => user.projectIds?.includes(p.id));
    return (
        <div onClick={onEdit} className="card-mobile tap-active">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-lg flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    {user.company && <p className="text-xs text-accent mt-0.5">{user.company}</p>}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    aria-label="Benutzer löschen"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
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

export default function AdminPage() {
    return (
        <ToastProvider>
            <AdminPageContent />
        </ToastProvider>
    );
}
