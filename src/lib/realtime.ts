'use client';

import { useEffect, useRef } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface UseRealtimeOptions {
    table: string;
    event?: RealtimeEvent | '*';
    filter?: string;
    onEvent: (payload: any) => void;
    enabled?: boolean;
}

export function useRealtimeSubscription({
    table,
    event = '*',
    filter,
    onEvent,
    enabled = true,
}: UseRealtimeOptions) {
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!enabled) return;

        // Skip if supabase is not properly configured
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!url) return;

        try {
            const channelName = `realtime-${table}-${filter || 'all'}-${Date.now()}`;

            const channelConfig: any = {
                event,
                schema: 'public',
                table,
            };

            if (filter) {
                channelConfig.filter = filter;
            }

            const channel = supabaseClient
                .channel(channelName)
                .on('postgres_changes', channelConfig, (payload: any) => {
                    onEvent(payload);
                })
                .subscribe();

            channelRef.current = channel;
        } catch {
            // Silently fail if realtime is not available
        }

        return () => {
            if (channelRef.current) {
                try {
                    supabaseClient.removeChannel(channelRef.current);
                } catch {
                    // ignore cleanup errors
                }
                channelRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [table, event, filter, enabled]);
}
