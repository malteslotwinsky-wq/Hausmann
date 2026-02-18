export type OrganizationTheme = {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    logoUrl?: string;
};

export const defaultTheme: OrganizationTheme = {
    name: 'BauLot',
    colors: {
        primary: '#111111',
        secondary: '#71717A',
        accent: '#18181B',
    },
};

export function getOrganizationTheme(): OrganizationTheme {
    return defaultTheme;
}
