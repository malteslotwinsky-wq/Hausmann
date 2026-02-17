import 'next-auth';
import { Role } from '@/types';

declare module 'next-auth' {
    interface User {
        id: string;
        role: Role;
        organizationId?: string;
        projectIds?: string[];
        assignedTradeIds?: string[];
    }

    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: Role;
            organizationId?: string;
            projectIds?: string[];
            assignedTradeIds?: string[];
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: Role;
        organizationId?: string;
        projectIds?: string[];
        assignedTradeIds?: string[];
    }
}
