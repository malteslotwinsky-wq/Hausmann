'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { SwipeableSheet } from '@/components/ui/SwipeableSheet';
import { CalendarIconButton } from '@/components/ui/CalendarExport';
import { GanttTimeline } from '@/components/ui/GanttTimeline';
import { DraggableList, DragHandle } from '@/components/ui/DraggableList';
import { createProjectEvent, createTradeEvent } from '@/lib/calendar';
import { TRADE_TEMPLATES, getTemplatesByCategory, TradeTemplate, PROJECT_TEMPLATES } from '@/lib/trade-templates';
import { Project, Trade, Role } from '@/types';
import { InputField } from '@/components/ui/InputField';

interface UserData {
    id: string;
    name: string;
    email: string;
    role: Role;
    company?: string;
}

type ViewMode = 'list' | 'timeline' | 'reorder';

function ProjectDetailContent() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToast();

    const [project, setProject] = useState<Project | null>(null);
    const [contractors, setContractors] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<TradeTemplate | null>(null);
    const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('list');

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

    useEffect(() => {
        if (session?.user?.role === 'architect') {
            loadProject();
            loadContractors();
        }
    }, [session, id]);

    const loadProject = async () => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (res.ok) {
                const data = await res.json();
                setProject({
                    ...data,
                    startDate: new Date(data.startDate),
                    targetEndDate: new Date(data.targetEndDate),
                });
            } else {
                showToast('Projekt nicht gefunden', 'error');
                router.push('/admin');
            }
        } catch {
            showToast('Fehler beim Laden', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadContractors = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const users = await res.json();
                setContractors(users.filter((u: UserData) => u.role === 'contractor'));
            }
        } catch { }
    };

    const openTradeModal = (template?: TradeTemplate) => {
        setSelectedTemplate(template || null);

        // Calculate next available start date
        const lastTrade = project?.trades?.[project.trades.length - 1];
        const nextStart = lastTrade?.endDate
            ? new Date(lastTrade.endDate).toISOString().split('T')[0]
            : project?.startDate
                ? new Date(project.startDate).toISOString().split('T')[0]
                : '';

        const endDate = template && nextStart
            ? (() => {
                const d = new Date(nextStart);
                d.setDate(d.getDate() + template.typicalDurationDays);
                return d.toISOString().split('T')[0];
            })()
            : '';

        setTradeForm({
            name: template?.name || '',
            companyName: '',
            contactPerson: '',
            phone: '',
            description: template?.description || '',
            contractorId: '',
            startDate: nextStart,
            endDate: endDate,
            budget: '',
            canCreateSubtasks: false,
        });

        setShowQuickAdd(false);
        setShowTradeModal(true);
    };

    const handleSaveTrade = async () => {
        if (!tradeForm.name || !project) {
            showToast('Gewerk-Name erforderlich', 'error');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${project.id}/trades`, {
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
            loadProject();
        } catch (e: any) {
            showToast(e.message || 'Fehler', 'error');
        }
        setLoading(false);
    };

    // Handle bulk import of multiple trades from a project template
    const handleBulkImport = async (templateId: string) => {
        const template = PROJECT_TEMPLATES.find(t => t.id === templateId);
        if (!template || !project) return;

        setLoading(true);
        try {
            let currentDate = new Date(project.startDate);

            for (const tradeId of template.tradeIds) {
                const tradeTemplate = TRADE_TEMPLATES.find(t => t.id === tradeId);
                if (!tradeTemplate) continue;

                const endDate = new Date(currentDate);
                endDate.setDate(endDate.getDate() + tradeTemplate.typicalDurationDays);

                await fetch(`/api/projects/${project.id}/trades`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: tradeTemplate.name,
                        description: tradeTemplate.description,
                        startDate: currentDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                    }),
                });

                // Next trade starts after this one ends
                currentDate = new Date(endDate);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            showToast(`${template.tradeIds.length} Gewerke importiert`, 'success');
            setShowBulkImport(false);
            loadProject();
        } catch (e: any) {
            showToast(e.message || 'Fehler beim Import', 'error');
        }
        setLoading(false);
    };

    // Handle trade reordering
    const handleReorderTrades = useCallback(async (reorderedTrades: Trade[]) => {
        if (!project) return;

        // Optimistic update
        setProject({
            ...project,
            trades: reorderedTrades.map((t, i) => ({ ...t, order: i + 1 })),
        });

        // Update on server (in background)
        try {
            await Promise.all(
                reorderedTrades.map((trade, index) =>
                    fetch(`/api/projects/${project.id}/trades/${trade.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ order: index + 1 }),
                    })
                )
            );
        } catch {
            // Reload if update fails
            loadProject();
            showToast('Fehler beim Speichern der Reihenfolge', 'error');
        }
    }, [project]);

    if (loading) {
        return (
            <AppShell currentPage="admin">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="w-12 h-12 bg-accent rounded-xl animate-pulse" />
                </div>
            </AppShell>
        );
    }

    if (!project) {
        return (
            <AppShell currentPage="admin">
                <div className="p-4 text-center py-16">
                    <span className="text-6xl block mb-4">❌</span>
                    <p className="text-muted-foreground">Projekt nicht gefunden</p>
                </div>
            </AppShell>
        );
    }

    const templatesByCategory = getTemplatesByCategory();
    const projectCalendarEvent = createProjectEvent(
        project.name,
        project.address,
        new Date(project.startDate),
        new Date(project.targetEndDate)
    );

    return (
        <AppShell currentPage="admin">
            <div className="min-h-screen bg-background pb-32">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-surface border-b border-border px-4 py-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <button
                                onClick={() => router.push('/admin')}
                                className="text-sm text-accent mb-2 tap-active"
                            >
                                ← Zurück zur Übersicht
                            </button>
                            <h1 className="text-headline text-foreground">{project.name}</h1>
                            <p className="text-sm text-muted-foreground">{project.address}</p>
                        </div>
                        <CalendarIconButton event={projectCalendarEvent} size="lg" />
                    </div>
                </header>

                {/* Project Stats */}
                <div className="px-4 py-4 grid grid-cols-3 gap-3">
                    <div className="card-mobile text-center py-4">
                        <span className="text-2xl font-bold text-accent">{project.trades?.length || 0}</span>
                        <p className="text-xs text-muted-foreground mt-1">Gewerke</p>
                    </div>
                    <div className="card-mobile text-center py-4">
                        <span className="text-2xl font-bold text-foreground">
                            {new Date(project.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">Baubeginn</p>
                    </div>
                    <div className="card-mobile text-center py-4">
                        <span className="text-2xl font-bold text-foreground">
                            {new Date(project.targetEndDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">Fertigstellung</p>
                    </div>
                </div>

                {/* Quick Add Section */}
                <div className="px-4 mb-4">
                    <button
                        onClick={() => setShowQuickAdd(!showQuickAdd)}
                        className="w-full card-mobile flex items-center justify-between py-4 tap-active"
                    >
                        <span className="font-medium text-accent">⚡ Schnell hinzufügen</span>
                        <span className="text-muted-foreground">{showQuickAdd ? '▲' : '▼'}</span>
                    </button>

                    {showQuickAdd && (
                        <div className="mt-2 p-4 bg-accent/5 rounded-xl border border-accent/20 space-y-4 animate-fade-in">
                            {Object.entries(templatesByCategory).map(([category, templates]) => (
                                <div key={category}>
                                    <p className="text-xs text-muted-foreground mb-2">{category.toUpperCase()}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {templates.map(template => (
                                            <button
                                                key={template.id}
                                                onClick={() => openTradeModal(template)}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-surface rounded-lg text-sm tap-active border border-border hover:border-accent"
                                            >
                                                <span>{template.icon}</span>
                                                <span>{template.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Trades List */}
                <div className="px-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-caption text-muted-foreground">GEWERKE</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowBulkImport(true)}
                                className="text-sm text-accent font-medium tap-active px-2"
                            >
                                📦 Import
                            </button>
                            <button
                                onClick={() => openTradeModal()}
                                className="text-sm text-accent font-medium tap-active"
                            >
                                + Neu
                            </button>
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    {project.trades && project.trades.length > 0 && (
                        <div className="flex gap-1 bg-muted p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex-1 py-2 text-sm rounded-md transition-all ${viewMode === 'list' ? 'bg-surface shadow-sm font-medium' : 'text-muted-foreground'
                                    }`}
                            >
                                📋 Liste
                            </button>
                            <button
                                onClick={() => setViewMode('timeline')}
                                className={`flex-1 py-2 text-sm rounded-md transition-all ${viewMode === 'timeline' ? 'bg-surface shadow-sm font-medium' : 'text-muted-foreground'
                                    }`}
                            >
                                📊 Timeline
                            </button>
                            <button
                                onClick={() => setViewMode('reorder')}
                                className={`flex-1 py-2 text-sm rounded-md transition-all ${viewMode === 'reorder' ? 'bg-surface shadow-sm font-medium' : 'text-muted-foreground'
                                    }`}
                            >
                                ↕️ Sortieren
                            </button>
                        </div>
                    )}

                    {!project.trades || project.trades.length === 0 ? (
                        <div className="card-mobile text-center py-12">
                            <span className="text-5xl block mb-3">🔧</span>
                            <p className="text-muted-foreground mb-4">Noch keine Gewerke</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowBulkImport(true)}
                                    className="text-accent font-medium tap-active px-4 py-2 bg-accent/10 rounded-lg"
                                >
                                    📦 Vorlage importieren
                                </button>
                                <button
                                    onClick={() => setShowQuickAdd(true)}
                                    className="text-accent font-medium tap-active"
                                >
                                    Einzeln hinzufügen →
                                </button>
                            </div>
                        </div>
                    ) : viewMode === 'timeline' ? (
                        // Timeline View
                        <GanttTimeline
                            trades={project.trades}
                            projectStartDate={new Date(project.startDate)}
                            projectEndDate={new Date(project.targetEndDate)}
                            onTradeClick={(trade) => setExpandedTrade(trade.id)}
                        />
                    ) : viewMode === 'reorder' ? (
                        // Drag & Drop Reorder View
                        <DraggableList
                            items={project.trades}
                            onReorder={handleReorderTrades}
                            renderItem={(trade, index) => (
                                <div className="card-mobile flex items-center gap-3">
                                    <DragHandle />
                                    <span className="text-lg font-medium text-muted-foreground w-6">
                                        {index + 1}.
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium text-foreground">{trade.name}</p>
                                        {trade.companyName && (
                                            <p className="text-sm text-muted-foreground">{trade.companyName}</p>
                                        )}
                                    </div>
                                    {trade.startDate && trade.endDate && (
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(trade.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            )}
                        />
                    ) : (
                        // Default List View
                        project.trades.map((trade, index) => {
                            const isExpanded = expandedTrade === trade.id;
                            const tradeCalendarEvent = createTradeEvent(
                                trade.name,
                                project.name,
                                new Date(trade.startDate || project.startDate),
                                new Date(trade.endDate || project.targetEndDate),
                                trade.companyName
                            );

                            return (
                                <div key={trade.id} className="card-mobile overflow-hidden">
                                    <button
                                        onClick={() => setExpandedTrade(isExpanded ? null : trade.id)}
                                        className="w-full flex items-center justify-between tap-active"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{index + 1}.</span>
                                            <div className="text-left">
                                                <p className="font-medium text-foreground">{trade.name}</p>
                                                {trade.companyName && (
                                                    <p className="text-sm text-muted-foreground">{trade.companyName}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {trade.startDate && trade.endDate && (
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(trade.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                                                    {' - '}
                                                    {new Date(trade.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                                                </span>
                                            )}
                                            <span className="text-muted-foreground">{isExpanded ? '▲' : '▼'}</span>
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                                            {trade.description && (
                                                <p className="text-sm text-muted-foreground">{trade.description}</p>
                                            )}

                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                {trade.contactPerson && (
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Ansprechpartner</p>
                                                        <p className="text-foreground">{trade.contactPerson}</p>
                                                    </div>
                                                )}
                                                {trade.phone && (
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Telefon</p>
                                                        <a href={`tel:${trade.phone}`} className="text-accent">{trade.phone}</a>
                                                    </div>
                                                )}
                                                {trade.budget && (
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Budget</p>
                                                        <p className="text-foreground">{trade.budget.toLocaleString('de-DE')} €</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Aufgaben</p>
                                                    <p className="text-foreground">{trade.tasks?.length || 0} Aufgaben</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <CalendarIconButton event={tradeCalendarEvent} size="sm" />
                                                <button className="flex-1 text-sm text-muted-foreground hover:text-foreground tap-active py-2 rounded-lg hover:bg-muted">
                                                    ✏️ Bearbeiten
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Bulk Import Modal */}
            <SwipeableSheet
                isOpen={showBulkImport}
                onClose={() => setShowBulkImport(false)}
                title="📦 Projekt-Vorlage importieren"
            >
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Wähle eine Vorlage, um alle zugehörigen Gewerke automatisch hinzuzufügen.
                        Die Termine werden automatisch verkettet.
                    </p>

                    {PROJECT_TEMPLATES.map(template => (
                        <button
                            key={template.id}
                            onClick={() => handleBulkImport(template.id)}
                            disabled={loading}
                            className="w-full card-mobile text-left tap-active hover:border-accent transition-colors disabled:opacity-50"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-foreground">{template.name}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {template.tradeIds.length} Gewerke · ~{template.tradeIds.reduce((sum, id) => {
                                            const t = TRADE_TEMPLATES.find(tt => tt.id === id);
                                            return sum + (t?.typicalDurationDays || 0);
                                        }, 0)} Tage
                                    </p>
                                </div>
                                <span className="text-2xl">{template.icon}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1">
                                {template.tradeIds.slice(0, 5).map(tid => {
                                    const t = TRADE_TEMPLATES.find(tt => tt.id === tid);
                                    return t ? (
                                        <span key={tid} className="text-xs bg-muted px-2 py-0.5 rounded">
                                            {t.icon} {t.name}
                                        </span>
                                    ) : null;
                                })}
                                {template.tradeIds.length > 5 && (
                                    <span className="text-xs text-muted-foreground">
                                        +{template.tradeIds.length - 5} weitere
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </SwipeableSheet>

            {/* Trade Modal */}
            <SwipeableSheet
                isOpen={showTradeModal}
                onClose={() => setShowTradeModal(false)}
                title={selectedTemplate ? `${selectedTemplate.icon} ${selectedTemplate.name}` : 'Neues Gewerk'}
                footer={
                    <div className="flex gap-3">
                        <button onClick={() => setShowTradeModal(false)} className="flex-1 btn-mobile btn-mobile-secondary tap-active">
                            Abbrechen
                        </button>
                        <button onClick={handleSaveTrade} disabled={loading} className="flex-1 btn-mobile btn-mobile-accent tap-active disabled:opacity-50">
                            {loading ? 'Speichern...' : 'Gewerk anlegen ✓'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {selectedTemplate && (
                        <div className="bg-accent/10 p-3 rounded-xl text-sm text-muted-foreground">
                            💡 Vorausgefüllt mit typischen Werten für "{selectedTemplate.name}"
                        </div>
                    )}

                    <InputField
                        label="Gewerk-Bezeichnung *"
                        value={tradeForm.name}
                        onChange={v => setTradeForm({ ...tradeForm, name: v })}
                        placeholder="z.B. Sanitär-Rohinstallation"
                    />
                    <InputField
                        label="Firma"
                        value={tradeForm.companyName}
                        onChange={v => setTradeForm({ ...tradeForm, companyName: v })}
                        placeholder="Elektro Meier GmbH"
                    />
                    <InputField
                        label="Ansprechpartner"
                        value={tradeForm.contactPerson}
                        onChange={v => setTradeForm({ ...tradeForm, contactPerson: v })}
                        placeholder="Max Müller"
                    />
                    <InputField
                        label="Mobilnummer"
                        type="tel"
                        value={tradeForm.phone}
                        onChange={v => setTradeForm({ ...tradeForm, phone: v })}
                        placeholder="+49 171 1234567"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <InputField
                            label="Startdatum"
                            type="date"
                            value={tradeForm.startDate}
                            onChange={v => setTradeForm({ ...tradeForm, startDate: v })}
                        />
                        <InputField
                            label="Enddatum"
                            type="date"
                            value={tradeForm.endDate}
                            onChange={v => setTradeForm({ ...tradeForm, endDate: v })}
                        />
                    </div>

                    <InputField
                        label="Budget (€)"
                        type="number"
                        value={tradeForm.budget}
                        onChange={v => setTradeForm({ ...tradeForm, budget: v })}
                        placeholder="z.B. 15000"
                    />

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Handwerker zuweisen</label>
                        <select
                            value={tradeForm.contractorId}
                            onChange={e => setTradeForm({ ...tradeForm, contractorId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:border-accent outline-none text-base"
                        >
                            <option value="">— Später zuweisen —</option>
                            {contractors.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} {c.company ? `(${c.company})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center gap-3 py-3 cursor-pointer tap-active">
                        <input
                            type="checkbox"
                            checked={tradeForm.canCreateSubtasks}
                            onChange={e => setTradeForm({ ...tradeForm, canCreateSubtasks: e.target.checked })}
                            className="w-5 h-5 rounded accent-accent"
                        />
                        <span className="text-foreground">Handwerker darf Unteraufträge anlegen</span>
                    </label>
                </div>
            </SwipeableSheet>
        </AppShell>
    );
}


export default function ProjectDetailPage() {
    return (
        <ToastProvider>
            <ProjectDetailContent />
        </ToastProvider>
    );
}
