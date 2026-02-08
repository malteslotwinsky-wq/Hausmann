import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findUserByEmail, validatePassword } from './users';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'E-Mail', type: 'email' },
                password: { label: 'Passwort', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await findUserByEmail(credentials.email);

                if (!user || !user.passwordHash) {
                    return null;
                }

                const isValid = await validatePassword(credentials.password, user.passwordHash);

                if (!isValid) {
                    return null;
                }

                // Return user object (without password hash!)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    projectIds: user.projectIds,
                    assignedTradeIds: user.assignedTradeIds,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Add custom fields to JWT token
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.projectIds = user.projectIds;
                token.assignedTradeIds = user.assignedTradeIds;
            }
            return token;
        },
        async session({ session, token }) {
            // Add custom fields to session
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as 'architect' | 'contractor' | 'client';
                session.user.projectIds = token.projectIds as string[] | undefined;
                session.user.assignedTradeIds = token.assignedTradeIds as string[] | undefined;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};
