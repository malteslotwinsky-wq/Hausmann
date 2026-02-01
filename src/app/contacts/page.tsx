'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { SwipeableSheet } from '@/components/ui/SwipeableSheet';
import { Role } from '@/types';

interface Contact {
    id: string;
    name: string;
    email: string;
    role: Role;
    phone?: string;
    company?: string;
    trade?: string;
    projectNames?: string[];
    lastContacted?: Date;
    contactCount?: number;
}

function ContactsPageContent() {
    const { data: session, status } = useSession();
    const { showToast } = useToast();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [filter, setFilter] = useState<'all' | 'contractor' | 'client'>('all');

    const role = session?.user?.role as Role | undefined;

    useEffect(() => {
        if (status === 'authenticated') {
            fetchContacts();
        }
    }, [session, status]);

    const fetchContacts = async () => {
        try {
            const [usersRes, projectsRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/projects')
            ]);

            if (!usersRes.ok || !projectsRes.ok) throw new Error();

            const allUsers = await usersRes.json();
            const allProjects = await projectsRes.json();

            // Build contact list (exclude current user and architects)
            const contactList: Contact[] = allUsers
                .filter((u: any) => u.id !== session?.user.id && u.role !== 'architect')
                .map((u: any) => {
                    // Find projects this user is assigned to
                    const userProjects = allProjects.filter((p: any) => {
                        if (u.role === 'client') return u.projectIds?.includes(p.id);
                        if (u.role === 'contractor') {
                            return p.trades?.some((t: any) => t.contractorId === u.id);
                        }
                        return false;
                    });

                    // Find trade name for contractors
                    let tradeName = '';
                    if (u.role === 'contractor') {
                        allProjects.forEach((p: any) => {
                            p.trades?.forEach((t: any) => {
                                if (t.contractorId === u.id) {
                                    tradeName = tradeName ? `${tradeName}, ${t.name}` : t.name;
                                }
                            });
                        });
                    }

                    return {
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        role: u.role,
                        phone: u.phone,
                        company: u.company,
                        trade: tradeName || undefined,
                        projectNames: userProjects.map((p: any) => p.name),
                        contactCount: Math.floor(Math.random() * 10), // Mock data
                        lastContacted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                    };
                });

            setContacts(contactList);
        } catch (error) {
            showToast('Fehler beim Laden der Kontakte', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || !session) return null;

    // Filter contacts
    const filteredContacts = filter === 'all' ? contacts : contacts.filter(c => c.role === filter);

    // Top 3 most contacted
    const topContacts = [...contacts].sort((a, b) => (b.contactCount || 0) - (a.contactCount || 0)).slice(0, 3);

    // Group remaining by role
    const contractors = filteredContacts.filter(c => c.role === 'contractor');
    const clients = filteredContacts.filter(c => c.role === 'client');

    return (
        <AppShell currentPage="contacts">
            <div className="min-h-screen bg-background pb-32">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-white border-b border-border px-4 py-4">
                    <h1 className="text-headline text-foreground">Kontakte</h1>
                    <p className="text-sm text-muted-foreground">{contacts.length} Kontakte</p>
                </header>

                {/* Filter */}
                <div className="sticky top-[73px] z-20 bg-background border-b border-border">
                    <div className="flex gap-2 px-4 py-3">
                        {[
                            { id: 'all', label: 'Alle' },
                            { id: 'contractor', label: '🔧 Handwerker' },
                            { id: 'client', label: '👤 Kunden' },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id as any)}
                                className={`
                                    px-4 py-2 rounded-full text-sm font-medium tap-active transition-all flex-shrink-0
                                    ${filter === f.id ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}
                                `}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="w-12 h-12 bg-accent rounded-xl animate-pulse mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Laden...</p>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <span className="text-6xl block mb-4">📇</span>
                        <p className="text-muted-foreground">Noch keine Kontakte</p>
                        <p className="text-sm text-muted-foreground mt-1">Füge Handwerker oder Kunden im Admin-Bereich hinzu</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-6">
                        {/* Top Contacts */}
                        {filter === 'all' && topContacts.length > 0 && (
                            <section>
                                <h2 className="text-caption text-muted-foreground mb-3 px-1">HÄUFIG KONTAKTIERT</h2>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
                                    {topContacts.map(contact => (
                                        <div
                                            key={contact.id}
                                            onClick={() => setSelectedContact(contact)}
                                            className="flex-shrink-0 w-24 text-center tap-active"
                                        >
                                            <div className="w-16 h-16 mx-auto bg-accent rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                                                {contact.name.charAt(0).toUpperCase()}
                                            </div>
                                            <p className="font-medium text-foreground text-sm truncate">{contact.name.split(' ')[0]}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {contact.role === 'contractor' ? '🔧' : '👤'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Contractors Section */}
                        {contractors.length > 0 && (
                            <section>
                                <h2 className="text-caption text-muted-foreground mb-3 px-1">
                                    🔧 HANDWERKER ({contractors.length})
                                </h2>
                                <div className="space-y-2">
                                    {contractors.map(contact => (
                                        <ContactCard key={contact.id} contact={contact} onClick={() => setSelectedContact(contact)} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Clients Section */}
                        {clients.length > 0 && (
                            <section>
                                <h2 className="text-caption text-muted-foreground mb-3 px-1">
                                    👤 KUNDEN ({clients.length})
                                </h2>
                                <div className="space-y-2">
                                    {clients.map(contact => (
                                        <ContactCard key={contact.id} contact={contact} onClick={() => setSelectedContact(contact)} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            {/* Contact Detail Sheet - Now with Swipe to Dismiss */}
            <SwipeableSheet
                isOpen={!!selectedContact}
                onClose={() => setSelectedContact(null)}
                maxHeight="70vh"
            >
                {selectedContact && (
                    <div>
                        {/* Avatar & Name */}
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 mx-auto bg-accent rounded-full flex items-center justify-center text-white font-bold text-3xl mb-3">
                                {selectedContact.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{selectedContact.name}</h2>
                            {selectedContact.company && (
                                <p className="text-muted-foreground">{selectedContact.company}</p>
                            )}
                            {selectedContact.trade && (
                                <p className="text-sm text-accent mt-1">{selectedContact.trade}</p>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <a href={`tel:${selectedContact.phone || ''}`} className="card-mobile text-center py-4 tap-active">
                                <span className="text-2xl block mb-1">📞</span>
                                <span className="text-xs text-muted-foreground">Anrufen</span>
                            </a>
                            <a href={`mailto:${selectedContact.email}`} className="card-mobile text-center py-4 tap-active">
                                <span className="text-2xl block mb-1">✉️</span>
                                <span className="text-xs text-muted-foreground">E-Mail</span>
                            </a>
                            <button className="card-mobile text-center py-4 tap-active">
                                <span className="text-2xl block mb-1">💬</span>
                                <span className="text-xs text-muted-foreground">Nachricht</span>
                            </button>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <ContactInfoRow icon="📧" label="E-Mail" value={selectedContact.email} href={`mailto:${selectedContact.email}`} />
                            {selectedContact.phone && (
                                <ContactInfoRow icon="📞" label="Telefon" value={selectedContact.phone} href={`tel:${selectedContact.phone}`} />
                            )}
                            {selectedContact.projectNames && selectedContact.projectNames.length > 0 && (
                                <div className="py-3 border-t border-border">
                                    <p className="text-xs text-muted-foreground mb-2">PROJEKTE</p>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedContact.projectNames.map((name, i) => (
                                            <span key={i} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-md">{name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Swipe hint */}
                        <p className="text-center text-xs text-muted-foreground mt-6">
                            Nach unten wischen zum Schließen
                        </p>
                    </div>
                )}
            </SwipeableSheet>
        </AppShell>
    );
}

function ContactCard({ contact, onClick }: { contact: Contact; onClick: () => void }) {
    return (
        <div onClick={onClick} className="card-mobile tap-active">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-accent rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                        {contact.company || contact.trade || contact.email}
                    </p>
                </div>
                <span className="text-muted-foreground">›</span>
            </div>
        </div>
    );
}

function ContactInfoRow({ icon, label, value, href }: { icon: string; label: string; value: string; href?: string }) {
    const content = (
        <div className="flex items-center gap-3 py-3 border-t border-border">
            <span className="text-lg">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-foreground truncate">{value}</p>
            </div>
        </div>
    );

    if (href) {
        return <a href={href} className="block tap-active">{content}</a>;
    }
    return content;
}

export default function ContactsPage() {
    return (
        <ToastProvider>
            <ContactsPageContent />
        </ToastProvider>
    );
}

