'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { demoProjects, generateId } from '@/lib/demo-data';
import { Role, Project, Trade } from '@/types';

interface UserData {
    id: string;
    email: string;
    name: string;
    role: Role;
    projectIds?: string[];
    assignedTradeIds?: string[];
    createdAt: Date;
}

// Available trade templates
const TRADE_TEMPLATES = [
    'Abbrucharbeiten',
    'Rohbau',
    'Elektroinstallation',
    'Sanitärinstallation',
    'Heizung/Klima',
    'Trockenbau',
    'Estrich',
    'Fliesenleger',
    'Malerarbeiten',
    'Bodenbeläge',
    'Schreiner/Tischler',
    'Dachdecker',
    'Fenster/Türen',
    'Außenanlagen',
];

function AdminPageContent() {
    const { data: session, status } = useSession();
    const { showToast } = useToast();

    // Data States
    const [activeTab, setActiveTab] = useState<'users' | 'projects'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Data Fetch
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
                    trades: p.trades.map((t: any) => ({
                        ...t,
                        tasks: t.tasks.map((task: any) => ({
                            ...task,
                            createdAt: new Date(task.createdAt),
                            updatedAt: new Date(task.updatedAt)
                        }))
                    }))
                })));
            }
        } catch (error) {
            showToast('Fehler beim Laden der Daten', 'error');
        } finally {
            setLoading(false);
        }
    };
    const [showUserModal, setShowUserModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showAddTradeModal, setShowAddTradeModal] = useState(false);

    // New user form state
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        name: '',
        role: 'contractor' as 'contractor' | 'client',
        projectIds: [] as string[],
        tradeIds: [] as string[],
    });

    // New project form state
    const [newProject, setNewProject] = useState({
        name: '',
        address: '',
        clientName: '',
        startDate: '',
        targetEndDate: '',
        trades: [] as string[], // Trade names to create
    });

    // New trade form state
    const [newTrade, setNewTrade] = useState({
        name: '',
        contractorId: '',
    });

    // Load users
    useEffect(() => {
        if (session?.user?.role === 'architect') {
            fetch('/api/users')
                .then(res => res.json())
                .then(data => setUsers(data))
                .catch(err => console.error(err));
        }
    }, [session]);

    if (status === 'loading') return null;

    if (!session || session.user.role !== 'architect') {
        return (
            <AppShell currentPage="dashboard">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <span className="text-6xl block mb-4">🔒</span>
                    <p className="text-gray-500">Nur für Architekten zugänglich.</p>
                </div>
            </AppShell>
        );
    }

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password || !newUser.name) {
            showToast('Bitte alle Pflichtfelder ausfüllen', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (!res.ok) {
                const error = await res.json();
                showToast(error.error || 'Fehler beim Erstellen', 'error');
                setLoading(false);
                return;
            }

            const created = await res.json();
            setUsers([...users, created]);
            setShowUserModal(false);
            setNewUser({ email: '', password: '', name: '', role: 'contractor', projectIds: [], tradeIds: [] });
            showToast('Benutzer erstellt', 'success');
        } catch {
            showToast('Serverfehler', 'error');
        }
        setLoading(false);
    };

    const handleCreateProject = async () => {
        if (!newProject.name || !newProject.address) {
            showToast('Name und Adresse sind Pflichtfelder', 'error');
            return;
        }

        // Create project with trades
        const newProjectData: Project = {
            id: `project-${generateId().slice(0, 8)}`,
            name: newProject.name,
            address: newProject.address,
            clientId: '',
            clientName: newProject.clientName || 'Nicht zugewiesen',
            startDate: newProject.startDate ? new Date(newProject.startDate) : new Date(),
            targetEndDate: newProject.targetEndDate ? new Date(newProject.targetEndDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            trades: newProject.trades.map((tradeName, index) => ({
                id: `trade-${generateId().slice(0, 8)}`,
                projectId: '',
                name: tradeName,
                tasks: [],
                order: index,
            })),
        };

        // Update project IDs in trades
        newProjectData.trades.forEach(trade => {
            trade.projectId = newProjectData.id;
        });

        setProjects([...projects, newProjectData]);
        setShowProjectModal(false);
        setNewProject({ name: '', address: '', clientName: '', startDate: '', targetEndDate: '', trades: [] });
        showToast('Projekt erstellt', 'success');
    };

    const handleAddTrade = () => {
        if (!newTrade.name || !selectedProject) {
            showToast('Bitte Gewerk auswählen', 'error');
            return;
        }

        const trade: Trade = {
            id: `trade-${generateId().slice(0, 8)}`,
            projectId: selectedProject.id,
            name: newTrade.name,
            contractorId: newTrade.contractorId || undefined,
            tasks: [],
            order: selectedProject.trades.length,
        };

        const updatedProject = {
            ...selectedProject,
            trades: [...selectedProject.trades, trade],
        };

        setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
        setSelectedProject(updatedProject);
        setShowAddTradeModal(false);
        setNewTrade({ name: '', contractorId: '' });
        showToast('Gewerk hinzugefügt', 'success');
    };

    const handleAssignContractor = (tradeId: string, contractorId: string) => {
        if (!selectedProject) return;

        const updatedProject = {
            ...selectedProject,
            trades: selectedProject.trades.map(trade =>
                trade.id === tradeId ? { ...trade, contractorId: contractorId || undefined } : trade
            ),
        };

        setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
        setSelectedProject(updatedProject);
        showToast('Handwerker zugewiesen', 'success');
    };

    const contractors = users.filter(u => u.role === 'contractor');
    const clients = users.filter(u => u.role === 'client');

    // Get contractor name by ID
    const getContractorName = (contractorId?: string) => {
        if (!contractorId) return null;
        const contractor = contractors.find(c => c.id === contractorId);
        return contractor?.name || null;
    };

    return (
        <AppShell currentPage="dashboard">
            <div className="max-w-5xl mx-auto p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Verwaltung</h1>
                        <p className="text-gray-500">Benutzer und Projekte verwalten</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        👥 Benutzer
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        🏗 Projekte
                    </button>
                </div>

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <Button onClick={() => setShowUserModal(true)}>+ Neuen Benutzer anlegen</Button>

                        <Card>
                            <CardHeader>
                                <h3 className="font-medium">🔧 Handwerker</h3>
                                <p className="text-sm text-gray-500">{contractors.length} registriert</p>
                            </CardHeader>
                            <CardContent>
                                {contractors.length === 0 ? (
                                    <p className="text-gray-400 text-sm">Noch keine Handwerker angelegt</p>
                                ) : (
                                    <div className="space-y-2">
                                        {contractors.map(user => (
                                            <div key={user.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {user.assignedTradeIds?.length || 0} Gewerke
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <h3 className="font-medium">👤 Kunden</h3>
                                <p className="text-sm text-gray-500">{clients.length} registriert</p>
                            </CardHeader>
                            <CardContent>
                                {clients.length === 0 ? (
                                    <p className="text-gray-400 text-sm">Noch keine Kunden angelegt</p>
                                ) : (
                                    <div className="space-y-2">
                                        {clients.map(user => (
                                            <div key={user.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {user.projectIds?.length || 0} Projekte
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                    <div className="space-y-6">
                        <Button onClick={() => setShowProjectModal(true)}>+ Neues Projekt anlegen</Button>

                        <div className="space-y-3">
                            {projects.map(project => (
                                <Card key={project.id} hover onClick={() => setSelectedProject(project)} className="cursor-pointer">
                                    <CardContent className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                                <p className="text-sm text-gray-500">{project.address}</p>
                                                <p className="text-sm text-gray-400 mt-1">Kunde: {project.clientName || 'Nicht zugewiesen'}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-blue-600">{project.trades.length}</span>
                                                <p className="text-xs text-gray-400">Gewerke</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* User Modal */}
                {showUserModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Neuen Benutzer anlegen</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rolle</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setNewUser({ ...newUser, role: 'contractor' })}
                                            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${newUser.role === 'contractor' ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            🔧 Handwerker
                                        </button>
                                        <button
                                            onClick={() => setNewUser({ ...newUser, role: 'client' })}
                                            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${newUser.role === 'client' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            👤 Kunde
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        placeholder="Max Mustermann"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail *</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        placeholder="max@firma.de"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Passwort *</label>
                                    <input
                                        type="text"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        placeholder="Mindestens 6 Zeichen"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Wird sicher gehasht gespeichert</p>
                                </div>

                                {newUser.role === 'client' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Projekte zuweisen</label>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {projects.map(project => (
                                                <label key={project.id} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                                    <input
                                                        type="checkbox"
                                                        checked={newUser.projectIds.includes(project.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setNewUser({ ...newUser, projectIds: [...newUser.projectIds, project.id] });
                                                            } else {
                                                                setNewUser({ ...newUser, projectIds: newUser.projectIds.filter(id => id !== project.id) });
                                                            }
                                                        }}
                                                        className="w-5 h-5 rounded"
                                                    />
                                                    <span className="text-sm">{project.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button variant="secondary" onClick={() => setShowUserModal(false)} fullWidth>Abbrechen</Button>
                                <Button onClick={handleCreateUser} disabled={loading} fullWidth>
                                    {loading ? 'Erstellen...' : 'Benutzer erstellen'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Project Modal (Create) */}
                {showProjectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">Neues Projekt anlegen</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Projektname *</label>
                                    <input
                                        type="text"
                                        value={newProject.name}
                                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                        placeholder="Sanierung Villa Müller"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse *</label>
                                    <input
                                        type="text"
                                        value={newProject.address}
                                        onChange={(e) => setNewProject({ ...newProject, address: e.target.value })}
                                        placeholder="Musterstraße 1, 80331 München"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Kundenname</label>
                                    <input
                                        type="text"
                                        value={newProject.clientName}
                                        onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                                        placeholder="Familie Müller"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Startdatum</label>
                                        <input
                                            type="date"
                                            value={newProject.startDate}
                                            onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Zieldatum</label>
                                        <input
                                            type="date"
                                            value={newProject.targetEndDate}
                                            onChange={(e) => setNewProject({ ...newProject, targetEndDate: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Trade Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gewerke auswählen</label>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                        {TRADE_TEMPLATES.map(trade => (
                                            <label key={trade} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                                <input
                                                    type="checkbox"
                                                    checked={newProject.trades.includes(trade)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setNewProject({ ...newProject, trades: [...newProject.trades, trade] });
                                                        } else {
                                                            setNewProject({ ...newProject, trades: newProject.trades.filter(t => t !== trade) });
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded"
                                                />
                                                <span className="text-sm">{trade}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">{newProject.trades.length} Gewerke ausgewählt</p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button variant="secondary" onClick={() => setShowProjectModal(false)} fullWidth>Abbrechen</Button>
                                <Button onClick={handleCreateProject} disabled={loading} fullWidth>
                                    {loading ? 'Erstellen...' : 'Projekt erstellen'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Project Detail Modal */}
                {selectedProject && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedProject.name}</h2>
                                    <p className="text-sm text-gray-500">{selectedProject.address}</p>
                                    <p className="text-sm text-gray-400">Kunde: {selectedProject.clientName}</p>
                                </div>
                                <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                            </div>

                            {/* Trades List */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium">Gewerke ({selectedProject.trades.length})</h3>
                                    <Button size="sm" onClick={() => setShowAddTradeModal(true)}>+ Gewerk hinzufügen</Button>
                                </div>

                                {selectedProject.trades.length === 0 ? (
                                    <p className="text-gray-400 text-sm py-4 text-center">Noch keine Gewerke zugeordnet</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedProject.trades.map(trade => (
                                            <div key={trade.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                                                <div>
                                                    <p className="font-medium text-gray-900">{trade.name}</p>
                                                    <p className="text-xs text-gray-400">{trade.tasks.length} Aufgaben</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={trade.contractorId || ''}
                                                        onChange={(e) => handleAssignContractor(trade.id, e.target.value)}
                                                        className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white"
                                                    >
                                                        <option value="">Handwerker zuweisen...</option>
                                                        {contractors.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                    {getContractorName(trade.contractorId) && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                            ✓ {getContractorName(trade.contractorId)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button variant="secondary" onClick={() => setSelectedProject(null)} fullWidth>Schließen</Button>
                        </div>
                    </div>
                )}

                {/* Add Trade Modal */}
                {showAddTradeModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6">
                            <h2 className="text-xl font-bold mb-4">Gewerk hinzufügen</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Gewerk auswählen</label>
                                    <select
                                        value={newTrade.name}
                                        onChange={(e) => setNewTrade({ ...newTrade, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Gewerk wählen...</option>
                                        {TRADE_TEMPLATES.filter(t => !selectedProject?.trades.some(pt => pt.name === t)).map(trade => (
                                            <option key={trade} value={trade}>{trade}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Handwerker (optional)</label>
                                    <select
                                        value={newTrade.contractorId}
                                        onChange={(e) => setNewTrade({ ...newTrade, contractorId: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Später zuweisen...</option>
                                        {contractors.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button variant="secondary" onClick={() => setShowAddTradeModal(false)} fullWidth>Abbrechen</Button>
                                <Button onClick={handleAddTrade} fullWidth>Hinzufügen</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}

export default function AdminPage() {
    return (
        <ToastProvider>
            <AdminPageContent />
        </ToastProvider>
    );
}
