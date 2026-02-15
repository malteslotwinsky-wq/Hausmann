
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// POST seed database (Architect only, development only)
export async function POST() {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const hashedPassword = await bcrypt.hash('demo1234', 10);

        // 1. Clean up existing data (Delete in reverse order of dependencies)
        await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('trades').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        // 1.5 Create Organization
        const orgId = '00000000-0000-0000-0000-000000000001';
        await supabase.from('organizations').upsert({
            id: orgId,
            name: 'Hausmann Bau',
            slug: 'hausmann',
            primary_color: '#1E3A5F'
        });

        // 2. Create Users
        const architectId = uuidv4();
        const clientId = uuidv4();
        const contractorElektroId = uuidv4();
        const contractorSanitaerId = uuidv4();
        const contractorTrockenbauId = uuidv4();
        const contractorAbbruchId = uuidv4();

        const users = [
            { id: architectId, organization_id: orgId, email: 'architekt@buero-schmidt.de', name: 'Thomas Schmidt', role: 'architect', password: hashedPassword },
            { id: clientId, organization_id: orgId, email: 'mueller@email.de', name: 'Familie Müller', role: 'client', password: hashedPassword },
            { id: contractorElektroId, organization_id: orgId, email: 'info@elektro-meier.de', name: 'Elektro Meier GmbH', role: 'contractor', password: hashedPassword },
            { id: contractorSanitaerId, organization_id: orgId, email: 'info@sanitaer-weber.de', name: 'Sanitär Weber', role: 'contractor', password: hashedPassword },
            { id: contractorTrockenbauId, organization_id: orgId, email: 'info@innenausbau-krause.de', name: 'Innenausbau Krause', role: 'contractor', password: hashedPassword },
            { id: contractorAbbruchId, organization_id: orgId, email: 'info@bau-koenig.de', name: 'Bau König GmbH', role: 'contractor', password: hashedPassword },
        ];

        const { error: usersError } = await supabase.from('users').insert(users);
        if (usersError) throw new Error(`Users Error: ${usersError.message}`);

        // 3. Create Project
        const projectId = uuidv4();
        const project = {
            id: projectId,
            organization_id: orgId,
            name: 'Sanierung Villa Müller',
            address: 'Gartenstraße 15, 80331 München',
            client_id: clientId,
            start_date: new Date('2026-01-15').toISOString(),
            target_end_date: new Date('2026-06-30').toISOString(),
            status: 'active',
            created_at: new Date('2026-01-10').toISOString(),
        };

        const { error: projectError } = await supabase.from('projects').insert(project);
        if (projectError) throw new Error(`Project Error: ${projectError.message}`);

        // 4. Create Trades
        const tradesData = [
            { name: 'Abbrucharbeiten', contractor_id: contractorAbbruchId, order: 1 },
            { name: 'Elektroinstallation', contractor_id: contractorElektroId, order: 2 },
            { name: 'Sanitärinstallation', contractor_id: contractorSanitaerId, order: 3 },
            { name: 'Trockenbau', contractor_id: contractorTrockenbauId, order: 4 },
            { name: 'Malerarbeiten', contractor_id: null, order: 5 },
        ];

        const trades = [];
        for (const t of tradesData) {
            const tradeId = uuidv4();
            trades.push({
                id: tradeId,
                project_id: projectId,
                name: t.name,
                contractor_id: t.contractor_id,
                order: t.order,
                status: 'pending',
                progress: 0
            });
        }

        const { error: tradesError } = await supabase.from('trades').insert(trades);
        if (tradesError) throw new Error(`Trades Error: ${tradesError.message}`);

        // 5. Create Tasks (Sample for Elektro)
        const elektroTrade = trades.find(t => t.name === 'Elektroinstallation');
        if (elektroTrade) {
            const tasks = [
                {
                    trade_id: elektroTrade.id,
                    name: 'Leitungen verlegen',
                    status: 'done',
                    start_date: new Date('2026-01-20').toISOString(),
                    end_date: new Date('2026-01-25').toISOString(),
                },
                {
                    trade_id: elektroTrade.id,
                    name: 'Unterverteilung installieren',
                    status: 'in_progress',
                    start_date: new Date('2026-01-22').toISOString(),
                    end_date: new Date('2026-01-28').toISOString(),
                },
            ];
            await supabase.from('tasks').insert(tasks);
        }

        return NextResponse.json({ success: true, message: 'Database seeded successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
