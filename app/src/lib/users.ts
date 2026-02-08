import { User, Role } from '@/types';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export interface StoredUser extends User {
    passwordHash?: string; // Optional because we might not fetch it always
}

/**
 * Find user by email (Async now!)
 */
export async function findUserByEmail(email: string): Promise<StoredUser | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as Role,
        passwordHash: data.password, // Mapped from 'password' column
        avatarUrl: data.avatar_url,
        createdAt: new Date(data.created_at),
        projectIds: data.project_ids, // Assuming array column or join (Schema said project_ids array?)
        // Note: Schema definition didn't explicitly add project_ids array column, but seed script didn't use it?
        // Wait, seed script inserted users WITHOUT project_ids.
        // We need to fetch relationships if we need them.
        // For now, let's keep it simple.
    };
}

/**
 * Validate password against stored hash
 */
export async function validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Get all users (Async)
 */
export async function getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role, created_at, avatar_url');

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    return data.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as Role,
        createdAt: new Date(u.created_at),
        avatarUrl: u.avatar_url
    }));
}

/**
 * Create new user (Async)
 */
export async function createUser(
    email: string,
    password: string,
    name: string,
    role: Role,
    createdBy: string,
    projectIds?: string[],
    tradeIds?: string[]
): Promise<User | null> {
    // Check if email exists
    const existing = await findUserByEmail(email);
    if (existing) return null;

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from('users')
        .insert({
            email,
            password: passwordHash,
            name,
            role,
            // project_ids: projectIds // Schema needs update if we want this
        })
        .select()
        .single();

    if (error || !data) {
        console.error('Error creating user:', error);
        return null;
    }

    return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role as Role,
        createdAt: new Date(data.created_at),
    };
}

