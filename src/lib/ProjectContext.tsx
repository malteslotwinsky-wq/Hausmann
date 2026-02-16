'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ProjectContextType {
    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType>({
    selectedProjectId: null,
    setSelectedProjectId: () => {},
});

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('baulot_selected_project');
        if (stored) {
            setSelectedProjectIdState(stored);
        }
        setLoaded(true);
    }, []);

    const setSelectedProjectId = (id: string | null) => {
        setSelectedProjectIdState(id);
        if (id) {
            localStorage.setItem('baulot_selected_project', id);
        } else {
            localStorage.removeItem('baulot_selected_project');
        }
    };

    if (!loaded) return <>{children}</>;

    return (
        <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjectContext() {
    return useContext(ProjectContext);
}
