'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { demoProjects } from '@/lib/demo-data';
import { Role, Trade } from '@/types';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: Role;
    recipientId: string;
    content: string;
    createdAt: Date;
    read: boolean;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    assignedTradeIds?: string[];
}

interface ContractorContact extends User {
    trade: string;
    phone?: string; // Optional real phone
    contactPerson?: string; // Optional real contact person
}

function ContactsPageContent() {
    const { data: session, status } = useSession();
    const { showToast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]); // Empty initially
    const [projectContractors, setProjectContractors] = useState<ContractorContact[]>([]);
    const [selectedContractor, setSelectedContractor] = useState<ContractorContact | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState<any | null>(null); // New state for project

    const role = session?.user?.role as Role | undefined;

    useEffect(() => {
        if (status === 'authenticated' && session.user) {
            fetchContractors();
            fetchMessages();

            // Polling for new messages (simple real-time alternative)
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [session, status]);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/messages');
            if (res.ok) {
                const data = await res.json();
                // Map DB snake_case to app camelCase
                const mappedMessages: Message[] = data.map((m: any) => ({
                    id: m.id,
                    senderId: m.sender_id,
                    senderName: m.sender_id === session?.user.id ? 'Ich' : 'Partner', // Ideally fetch name
                    senderRole: 'contractor', // simplified
                    recipientId: m.recipient_id,
                    content: m.content,
                    createdAt: new Date(m.created_at),
                    read: m.read
                }));
                setMessages(mappedMessages);
            }
        } catch (error) {
            console.error('Error fetching messages');
        }
    };

    const fetchContractors = async () => {
        try {
            // Fetch all users (now allowed for client)
            const res = await fetch('/api/users');
            if (!res.ok) throw new Error('Failed to fetch users');
            const allUsers: User[] = await res.json();

            // Fetch projects
            const projectsRes = await fetch('/api/projects');
            if (!projectsRes.ok) throw new Error('Failed to fetch projects');
            const projectsData: any[] = await projectsRes.json();

            // Find client's project
            const accessibleProjects = role === 'client' && session?.user.projectIds
                ? projectsData.filter(p => session.user.projectIds?.includes(p.id))
                : [];

            const currentProject = accessibleProjects[0];

            if (!currentProject) {
                setLoading(false);
                setProject(null); // Ensure project state is null
                return;
            }

            setProject(currentProject); // Set the project state

            // Map trades to contractors
            const contractors: ContractorContact[] = [];

            currentProject.trades.forEach((trade: any) => {
                if (trade.contractorId) {
                    const user = allUsers.find(u => u.id === trade.contractorId);
                    if (user) {
                        // Check if already in list (one contractor might have multiple trades)
                        const existing = contractors.find(c => c.id === user.id);
                        if (existing) {
                            existing.trade += `, ${trade.name}`;
                        } else {
                            contractors.push({
                                ...user,
                                trade: trade.name,
                                contactPerson: user.name, // Use user name as contact person
                                phone: '+49 123 4567890', // Placeholder as User model has no phone
                            });
                        }
                    }
                }
            });

            setProjectContractors(contractors);
        } catch (error) {
            console.error('Error loading contractors:', error);
            showToast('Fehler beim Laden der Kontakte', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || !session) return null;

    if (!project) {
        return (
            <AppShell currentPage="contacts">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <span className="text-6xl block mb-4">🏗</span>
                    <p className="text-muted-foreground">Kein Projekt verfügbar</p>
                </div>
            </AppShell>
        );
    }

    // Get messages for selected contractor
    const conversationMessages = selectedContractor
        ? messages.filter(m =>
            (m.senderId === selectedContractor.id && m.recipientId === session.user.id) ||
            (m.senderId === session.user.id && m.recipientId === selectedContractor.id)
        ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        : [];

    const getUnreadCount = (contractorId: string) => {
        return messages.filter(m =>
            m.senderId === contractorId &&
            m.recipientId === session.user.id &&
            !m.read
        ).length;
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedContractor) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipientId: selectedContractor.id,
                    content: newMessage.trim()
                })
            });

            if (res.ok) {
                const savedMsg = await res.json();
                const message: Message = {
                    id: savedMsg.id,
                    senderId: session!.user.id,
                    senderName: session!.user.name || 'Ich',
                    senderRole: role!,
                    recipientId: selectedContractor.id,
                    content: newMessage.trim(),
                    createdAt: new Date(),
                    read: false,
                };

                setMessages([...messages, message]);
                setNewMessage('');
                showToast('Nachricht gesendet', 'success');
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showToast('Fehler beim Senden', 'error');
        }
    };

    const markAsRead = (contractorId: string) => {
        setMessages(messages.map(m =>
            m.senderId === contractorId && m.recipientId === session.user.id
                ? { ...m, read: true }
                : m
        ));
    };

    return (
        <AppShell currentPage="contacts">
            <div className="max-w-5xl mx-auto p-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Ansprechpartner</h1>
                    <p className="text-gray-500">{project.name}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Contractors List */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <h3 className="font-medium">🔧 Firmen auf Ihrer Baustelle</h3>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-4 text-center text-gray-400">Laden...</div>
                                ) : projectContractors.length === 0 ? (
                                    <p className="text-gray-400 text-sm p-4">Noch keine Firmen zugeordnet</p>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {projectContractors.map(contractor => {
                                            const unreadCount = getUnreadCount(contractor.id);
                                            const isSelected = selectedContractor?.id === contractor.id;
                                            return (
                                                <button
                                                    key={contractor.id}
                                                    onClick={() => {
                                                        setSelectedContractor(contractor);
                                                        markAsRead(contractor.id);
                                                    }}
                                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{contractor.name}</p>
                                                            <p className="text-xs text-gray-500">{contractor.trade}</p>
                                                        </div>
                                                        {unreadCount > 0 && (
                                                            <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                                                {unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Messages / Contact Info */}
                    <div className="lg:col-span-2">
                        {selectedContractor ? (
                            <Card className="h-[600px] flex flex-col">
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">{selectedContractor.name}</h3>
                                            <p className="text-sm text-gray-500">{selectedContractor.trade}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedContractor(null)}
                                            className="lg:hidden text-gray-400 hover:text-gray-600"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </CardHeader>

                                <div className="px-4 py-3 bg-gray-50 border-b flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">👤</span>
                                        <span>{selectedContractor.contactPerson}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">📧</span>
                                        <a href={`mailto:${selectedContractor.email}`} className="text-blue-600 hover:underline">
                                            {selectedContractor.email}
                                        </a>
                                    </div>
                                    {selectedContractor.phone && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">📞</span>
                                            <a href={`tel:${selectedContractor.phone}`} className="text-blue-600 hover:underline">
                                                {selectedContractor.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {conversationMessages.length === 0 ? (
                                        <div className="text-center py-12">
                                            <span className="text-4xl block mb-2">💬</span>
                                            <p className="text-gray-400">Noch keine Nachrichten</p>
                                            <p className="text-sm text-gray-400">Schreiben Sie eine Nachricht an {selectedContractor.contactPerson}</p>
                                        </div>
                                    ) : (
                                        conversationMessages.map(message => {
                                            const isOwn = message.senderId === session.user.id;
                                            return (
                                                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                                                        }`}>
                                                        <p className="text-sm">{message.content}</p>
                                                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                                                            {new Date(message.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <div className="p-4 border-t">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Nachricht schreiben..."
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                                        />
                                        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                                            Senden
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <Card className="h-[600px] flex items-center justify-center">
                                <div className="text-center">
                                    <span className="text-6xl block mb-4">👈</span>
                                    <p className="text-gray-500">Wählen Sie eine Firma aus der Liste</p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

export default function ContactsPage() {
    return (
        <ToastProvider>
            <ContactsPageContent />
        </ToastProvider>
    );
}
