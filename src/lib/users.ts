import { User, Role } from '@/types';
import bcrypt from 'bcryptjs';

// Demo users with hashed passwords
// Password for all demo users: "demo1234"
const DEMO_PASSWORD_HASH = bcrypt.hashSync('demo1234', 10);

export interface StoredUser extends User {
    passwordHash: string;
}

// In-memory user store (would be replaced with database in production)
const users: StoredUser[] = [
    {
        id: 'user-architect-1',
        email: 'architekt@demo.de',
        name: 'Thomas Schmidt',
        role: 'architect',
        passwordHash: DEMO_PASSWORD_HASH,
        createdAt: new Date('2025-06-01'),
    },
    {
        id: 'user-contractor-elektro',
        email: 'handwerker@demo.de',
        name: 'Elektro Meier GmbH',
        role: 'contractor',
        passwordHash: DEMO_PASSWORD_HASH,
        assignedTradeIds: ['trade-elektro', 'p2-trade-elektro'],
        createdAt: new Date('2025-09-01'),
    },
    {
        id: 'user-contractor-sanitaer',
        email: 'sanitaer@demo.de',
        name: 'Sanitär Weber',
        role: 'contractor',
        passwordHash: DEMO_PASSWORD_HASH,
        assignedTradeIds: ['trade-sanitaer'],
        createdAt: new Date('2025-09-01'),
    },
    {
        id: 'user-client-1',
        email: 'kunde@demo.de',
        name: 'Familie Müller',
        role: 'client',
        passwordHash: DEMO_PASSWORD_HASH,
        projectIds: ['project-1'],
        createdAt: new Date('2026-01-01'),
    },
    {
        id: 'user-client-2',
        email: 'schmidt@demo.de',
        name: 'Schmidt GmbH',
        role: 'client',
        passwordHash: DEMO_PASSWORD_HASH,
        projectIds: ['project-2'],
        createdAt: new Date('2025-10-15'),
    },
];

/**
 * Find user by email
 */
export function findUserByEmail(email: string): StoredUser | undefined {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Find user by ID
 */
export function findUserById(id: string): StoredUser | undefined {
    return users.find(u => u.id === id);
}

/**
 * Validate password against stored hash
 */
export function validatePassword(plainPassword: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, hashedPassword);
}

/**
 * Get all users (for admin view)
 */
export function getAllUsers(): Omit<StoredUser, 'passwordHash'>[] {
    return users.map(({ passwordHash, ...user }) => user);
}

/**
 * Create new user (returns user without password hash)
 */
export function createUser(
    email: string,
    password: string,
    name: string,
    role: Role,
    createdBy: string,
    projectIds?: string[],
    tradeIds?: string[]
): Omit<StoredUser, 'passwordHash'> | null {
    // Check if email already exists
    if (findUserByEmail(email)) {
        return null;
    }

    const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        passwordHash: bcrypt.hashSync(password, 10),
        createdAt: new Date(),
        projectIds: role === 'client' ? projectIds : undefined,
        assignedTradeIds: role === 'contractor' ? tradeIds : undefined,
    };

    users.push(newUser);

    const { passwordHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
}

/**
 * Get projects accessible by user
 */
export function getAccessibleProjectIds(user: StoredUser): string[] | 'all' {
    if (user.role === 'architect') {
        return 'all'; // Architects see all projects
    }

    if (user.role === 'client') {
        return user.projectIds || [];
    }

    // Contractors: derive from assigned trades (simplified)
    // In real app, would lookup which projects contain these trades
    return 'all'; // For now, show all (filtered by trade in UI)
}

/**
 * Check if user can access a specific project
 */
export function canAccessProject(user: StoredUser, projectId: string): boolean {
    const accessible = getAccessibleProjectIds(user);
    if (accessible === 'all') return true;
    return accessible.includes(projectId);
}
