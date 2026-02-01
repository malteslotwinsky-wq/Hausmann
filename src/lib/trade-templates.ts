/**
 * Trade Templates for Quick-Add functionality
 * Standard trades with typical durations and phases for construction projects
 */

export interface TradeTemplate {
    id: string;
    name: string;
    icon: string;
    phase: string;
    typicalDurationDays: number;
    description: string;
    category: 'foundation' | 'structure' | 'interior' | 'finishing' | 'exterior';
}

export const TRADE_TEMPLATES: TradeTemplate[] = [
    // Foundation & Earthwork
    {
        id: 'erdarbeiten',
        name: 'Erdarbeiten',
        icon: '⛏️',
        phase: 'Erdarbeiten',
        typicalDurationDays: 14,
        description: 'Aushub, Baugrube, Erdtransport',
        category: 'foundation',
    },
    {
        id: 'fundament',
        name: 'Fundament & Bodenplatte',
        icon: '🧱',
        phase: 'Erdarbeiten',
        typicalDurationDays: 10,
        description: 'Streifenfundament oder Bodenplatte',
        category: 'foundation',
    },
    {
        id: 'kanalisation',
        name: 'Kanalisation',
        icon: '🚰',
        phase: 'Erdarbeiten',
        typicalDurationDays: 7,
        description: 'Entwässerung, Abwasseranschlüsse',
        category: 'foundation',
    },

    // Structure
    {
        id: 'rohbau',
        name: 'Rohbau / Maurer',
        icon: '🏗️',
        phase: 'Rohbau',
        typicalDurationDays: 42,
        description: 'Mauerwerk, Betonarbeiten',
        category: 'structure',
    },
    {
        id: 'zimmermann',
        name: 'Zimmermann / Dachstuhl',
        icon: '🪚',
        phase: 'Rohbau',
        typicalDurationDays: 14,
        description: 'Dachstuhl, Holzkonstruktion',
        category: 'structure',
    },
    {
        id: 'dachdecker',
        name: 'Dachdecker',
        icon: '🏠',
        phase: 'Rohbau',
        typicalDurationDays: 14,
        description: 'Dacheindeckung, Dachrinnen',
        category: 'structure',
    },
    {
        id: 'spengler',
        name: 'Spengler / Klempner',
        icon: '🔩',
        phase: 'Rohbau',
        typicalDurationDays: 5,
        description: 'Blecharbeiten, Verwahrungen',
        category: 'structure',
    },

    // Interior - Installation
    {
        id: 'fenster',
        name: 'Fenster & Türen',
        icon: '🪟',
        phase: 'Innenausbau',
        typicalDurationDays: 7,
        description: 'Fenstereinbau, Haustür, Innentüren',
        category: 'interior',
    },
    {
        id: 'elektro',
        name: 'Elektroinstallation',
        icon: '⚡',
        phase: 'Innenausbau',
        typicalDurationDays: 21,
        description: 'Leitungen, Verteilung, Schalter, Steckdosen',
        category: 'interior',
    },
    {
        id: 'sanitaer',
        name: 'Sanitärinstallation',
        icon: '🚿',
        phase: 'Innenausbau',
        typicalDurationDays: 21,
        description: 'Wasserleitungen, Abwasser, Armaturen',
        category: 'interior',
    },
    {
        id: 'heizung',
        name: 'Heizung',
        icon: '🔥',
        phase: 'Innenausbau',
        typicalDurationDays: 14,
        description: 'Heizungsanlage, Fußbodenheizung, Heizkörper',
        category: 'interior',
    },
    {
        id: 'lueftung',
        name: 'Lüftung / Klima',
        icon: '💨',
        phase: 'Innenausbau',
        typicalDurationDays: 7,
        description: 'Kontrollierte Wohnraumlüftung',
        category: 'interior',
    },

    // Interior - Finishing
    {
        id: 'trockenbau',
        name: 'Trockenbau',
        icon: '📐',
        phase: 'Innenausbau',
        typicalDurationDays: 21,
        description: 'Gipskarton, Decken, Vorwände',
        category: 'interior',
    },
    {
        id: 'estrich',
        name: 'Estrich',
        icon: '🪣',
        phase: 'Innenausbau',
        typicalDurationDays: 7,
        description: 'Zementestrich, Anhydrit, Trockenzeit',
        category: 'interior',
    },
    {
        id: 'innenputz',
        name: 'Innenputz',
        icon: '🪠',
        phase: 'Innenausbau',
        typicalDurationDays: 14,
        description: 'Gipsputz, Kalkputz',
        category: 'interior',
    },

    // Finishing
    {
        id: 'fliesen',
        name: 'Fliesenleger',
        icon: '🔲',
        phase: 'Fertigstellung',
        typicalDurationDays: 14,
        description: 'Bad, Küche, Flur',
        category: 'finishing',
    },
    {
        id: 'maler',
        name: 'Maler & Lackierer',
        icon: '🎨',
        phase: 'Fertigstellung',
        typicalDurationDays: 14,
        description: 'Tapezieren, Streichen, Lackieren',
        category: 'finishing',
    },
    {
        id: 'boden',
        name: 'Bodenbeläge',
        icon: '🪵',
        phase: 'Fertigstellung',
        typicalDurationDays: 7,
        description: 'Parkett, Laminat, Vinyl',
        category: 'finishing',
    },
    {
        id: 'schreiner',
        name: 'Schreiner / Tischler',
        icon: '🪑',
        phase: 'Fertigstellung',
        typicalDurationDays: 10,
        description: 'Einbauschränke, Treppen, Küche',
        category: 'finishing',
    },

    // Exterior
    {
        id: 'fassade',
        name: 'Fassade / WDVS',
        icon: '🧱',
        phase: 'Fertigstellung',
        typicalDurationDays: 21,
        description: 'Außenputz, Wärmedämmung',
        category: 'exterior',
    },
    {
        id: 'aussenanlagen',
        name: 'Außenanlagen',
        icon: '🌳',
        phase: 'Fertigstellung',
        typicalDurationDays: 14,
        description: 'Terrasse, Zufahrt, Garten',
        category: 'exterior',
    },
    {
        id: 'garage',
        name: 'Garage / Carport',
        icon: '🚗',
        phase: 'Fertigstellung',
        typicalDurationDays: 14,
        description: 'Garagenbau, Carport',
        category: 'exterior',
    },
];

/**
 * Project templates with pre-configured trades
 */
export interface ProjectTemplate {
    id: string;
    name: string;
    icon: string;
    description: string;
    tradeIds: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
    {
        id: 'neubau_efh',
        name: 'Neubau EFH',
        icon: '🏡',
        description: 'Einfamilienhaus Neubau mit allen Gewerken',
        tradeIds: [
            'erdarbeiten', 'fundament', 'kanalisation',
            'rohbau', 'zimmermann', 'dachdecker',
            'fenster', 'elektro', 'sanitaer', 'heizung',
            'trockenbau', 'estrich', 'innenputz',
            'fliesen', 'maler', 'boden', 'schreiner',
            'fassade', 'aussenanlagen'
        ],
    },
    {
        id: 'sanierung',
        name: 'Sanierung',
        icon: '🔧',
        description: 'Kernsanierung Bestandsimmobilie',
        tradeIds: [
            'elektro', 'sanitaer', 'heizung',
            'fenster', 'trockenbau', 'estrich',
            'fliesen', 'maler', 'boden'
        ],
    },
    {
        id: 'anbau',
        name: 'Anbau / Erweiterung',
        icon: '➕',
        description: 'Erweiterung mit Rohbau',
        tradeIds: [
            'erdarbeiten', 'fundament',
            'rohbau', 'dachdecker',
            'fenster', 'elektro', 'sanitaer',
            'trockenbau', 'estrich',
            'fliesen', 'maler', 'boden'
        ],
    },
    {
        id: 'dachausbau',
        name: 'Dachausbau',
        icon: '🏠',
        description: 'Ausbau Dachgeschoss',
        tradeIds: [
            'zimmermann', 'dachdecker',
            'fenster', 'elektro', 'heizung',
            'trockenbau',
            'maler', 'boden'
        ],
    },
    {
        id: 'baeder',
        name: 'Badsanierung',
        icon: '🚿',
        description: 'Komplettsanierung Badezimmer',
        tradeIds: [
            'sanitaer', 'elektro',
            'fliesen', 'maler'
        ],
    },
];

/**
 * Get trades for a project template
 */
export function getTradesForTemplate(templateId: string): TradeTemplate[] {
    const template = PROJECT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return [];

    return template.tradeIds
        .map(id => TRADE_TEMPLATES.find(t => t.id === id))
        .filter((t): t is TradeTemplate => t !== undefined);
}

/**
 * Calculate dates for trades based on project start
 * Chains trades sequentially within phases
 */
export function calculateTradeDates(
    trades: TradeTemplate[],
    projectStartDate: Date
): { template: TradeTemplate; startDate: Date; endDate: Date }[] {
    const result: { template: TradeTemplate; startDate: Date; endDate: Date }[] = [];
    let currentDate = new Date(projectStartDate);

    // Group by phase and process sequentially
    const phases = ['Erdarbeiten', 'Rohbau', 'Innenausbau', 'Fertigstellung'];

    for (const phase of phases) {
        const phaseTrades = trades.filter(t => t.phase === phase);

        for (const trade of phaseTrades) {
            const startDate = new Date(currentDate);
            const endDate = new Date(currentDate);
            endDate.setDate(endDate.getDate() + trade.typicalDurationDays);

            result.push({ template: trade, startDate, endDate });

            // Move current date forward (with some overlap for parallel trades)
            currentDate.setDate(currentDate.getDate() + Math.ceil(trade.typicalDurationDays * 0.7));
        }
    }

    return result;
}

/**
 * Get template by ID
 */
export function getTradeTemplate(id: string): TradeTemplate | undefined {
    return TRADE_TEMPLATES.find(t => t.id === id);
}

/**
 * Group templates by category
 */
export function getTemplatesByCategory(): Record<string, TradeTemplate[]> {
    return {
        'Erdarbeiten & Fundament': TRADE_TEMPLATES.filter(t => t.category === 'foundation'),
        'Rohbau': TRADE_TEMPLATES.filter(t => t.category === 'structure'),
        'Innenausbau': TRADE_TEMPLATES.filter(t => t.category === 'interior'),
        'Fertigstellung': TRADE_TEMPLATES.filter(t => t.category === 'finishing'),
        'Außenbereich': TRADE_TEMPLATES.filter(t => t.category === 'exterior'),
    };
}
