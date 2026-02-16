'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { ProjectProvider } from '@/lib/ProjectContext';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <ThemeProvider>
                <ProjectProvider>
                    {children}
                </ProjectProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}

