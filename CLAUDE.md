# BauLot - Bauprojekt-Management App

## Projektbeschreibung
BauLot ist eine Web-App zur Verwaltung von Bauprojekten mit Gewerke-Timeline, Aufgabenverwaltung, Bautagebuch und Fotodokumentation. Die App richtet sich an drei Benutzerrollen: Bauleitung (architect), Auftragnehmer (contractor) und Bauherr (client).

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Sprache:** TypeScript 5
- **Styling:** Tailwind CSS v4 (PostCSS-Plugin)
- **Datenbank:** Supabase (PostgreSQL)
- **Auth:** NextAuth v4 (Credentials Provider, JWT-Strategie)
- **UI:** React 19, Mobile-First Design
- **Deployment:** Vercel
- **Repo:** https://github.com/malteslotwinsky-wq/Hausmann.git

## Projektstruktur
```
/
├── src/
│   ├── app/                    # Next.js App Router Pages
│   │   ├── page.tsx            # Landing Page
│   │   ├── login/              # Login-Seite
│   │   ├── dashboard/          # Dashboard (rollenbasiert)
│   │   ├── tasks/              # Aufgabenverwaltung
│   │   ├── photos/             # Fotodokumentation
│   │   ├── diary/              # Bautagebuch
│   │   ├── activity/           # Aktivitätsfeed
│   │   ├── contacts/           # Kontakte
│   │   ├── admin/              # Admin-Bereich (nur Bauleitung)
│   │   │   └── projects/[id]/  # Projektdetail-Editor
│   │   ├── settings/           # Einstellungen
│   │   │   ├── profile/        # Profil bearbeiten
│   │   │   ├── notifications/  # Benachrichtigungen
│   │   │   ├── projects/       # Meine Projekte
│   │   │   └── help/           # Hilfe & Support
│   │   ├── api/                # API Route Handlers
│   │   │   ├── auth/[...nextauth]/ # NextAuth Endpunkt
│   │   │   ├── projects/       # GET (Liste), POST (Erstellen)
│   │   │   ├── projects/[id]/  # GET, PUT, DELETE (Einzelprojekt)
│   │   │   ├── projects/[id]/trades/          # POST (Gewerk anlegen)
│   │   │   ├── projects/[id]/trades/[tradeId]/ # PATCH, DELETE (Gewerk)
│   │   │   ├── users/          # GET (Liste), POST (Erstellen)
│   │   │   ├── users/[id]/     # PUT, DELETE (Einzelbenutzer)
│   │   │   ├── messages/       # GET (Nachrichten)
│   │   │   └── seed/           # POST (DB Seeding, nur Bauleitung)
│   │   ├── layout.tsx          # Root Layout (Providers)
│   │   ├── providers.tsx       # SessionProvider + ThemeProvider
│   │   └── globals.css         # Tailwind + CSS-Variablen (Light/Dark)
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx    # Haupt-Layout (Sidebar + BottomNav + Header)
│   │   │   ├── Sidebar.tsx     # Desktop-Navigation
│   │   │   ├── BottomNav.tsx   # Mobile-Navigation
│   │   │   └── Header.tsx      # Top-Bar mit Suche + Benachrichtigungen
│   │   ├── views/
│   │   │   ├── ArchitectDashboard.tsx  # Dashboard Bauleitung
│   │   │   ├── ContractorDashboard.tsx # Dashboard Auftragnehmer
│   │   │   └── ClientDashboard.tsx     # Dashboard Bauherr
│   │   ├── features/
│   │   │   ├── TimelineView.tsx    # Gantt-ähnliche Gewerke-Timeline
│   │   │   ├── ProjectList.tsx     # Projektliste
│   │   │   ├── DiaryView.tsx       # Bautagebuch-Ansicht
│   │   │   └── ActivityFeed.tsx    # Aktivitätsfeed
│   │   ├── modals/
│   │   │   ├── TaskDetailModal.tsx # Aufgabendetail-Modal
│   │   │   └── PhotoLightbox.tsx   # Foto-Vollansicht
│   │   └── ui/                 # Wiederverwendbare UI-Komponenten
│   │       ├── InputField.tsx      # Geteiltes Formular-Input
│   │       ├── SwipeableSheet.tsx  # Bottom Sheet (mobile)
│   │       ├── Toast.tsx           # Toast-Benachrichtigungen
│   │       ├── Button.tsx, Card.tsx, StatusBadge.tsx
│   │       ├── CircularProgress.tsx, ProgressBar.tsx
│   │       ├── GanttTimeline.tsx, CalendarExport.tsx
│   │       ├── DraggableList.tsx, Skeleton.tsx
│   │       ├── OfflineIndicator.tsx, ProfileDropdown.tsx
│   │       └── ThemeProvider.tsx   # Dark/Light Mode
│   ├── lib/
│   │   ├── supabase.ts        # Supabase Clients (Client + Server)
│   │   ├── auth.ts            # NextAuth Konfiguration
│   │   ├── users.ts           # User CRUD + Passwort-Validierung
│   │   ├── trade-templates.ts # Gewerke-Vorlagen + Datums-Berechnung
│   │   ├── branding.ts        # App-Branding Konstanten
│   │   ├── calendar.ts        # iCal-Export Helper
│   │   ├── utils.ts           # Utility-Funktionen
│   │   └── demo-data.ts       # Demo-Daten (nicht mehr importiert)
│   ├── middleware.ts           # Auth-Middleware (Route Protection)
│   └── types/
│       ├── index.ts            # Alle TypeScript Interfaces
│       └── next-auth.d.ts      # NextAuth Type Extensions
├── public/                     # Statische Assets
├── supabase_schema.sql         # Haupt-Datenbankschema
├── supabase_migration_trades.sql # Trades-Migration
├── supabase_tasks_schema.sql   # Tasks-Schema
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── .gitignore

```

## Umgebungsvariablen
```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase Projekt-URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase Anon Key (Client)
SUPABASE_SERVICE_ROLE_KEY=       # Supabase Service Role Key (Server, optional)
NEXTAUTH_SECRET=                 # NextAuth JWT Secret
NEXTAUTH_URL=                    # App-URL (z.B. http://localhost:3000)
```

## Benutzerrollen & Berechtigungen
| Rolle | Deutsch | Zugriff |
|-------|---------|---------|
| `architect` | Bauleitung | Voller Zugriff: Projekte, Benutzer, Gewerke, Admin |
| `contractor` | Auftragnehmer | Eigene Gewerke, Aufgaben, Fotos |
| `client` | Bauherr | Leseansicht, nur "client"-sichtbare Inhalte |

## Architektur-Entscheidungen
- **Server-Supabase:** `supabase` (mit Service Role Key, umgeht RLS)
- **Client-Supabase:** `supabaseClient` (mit Anon Key, respektiert RLS)
- **Auth:** JWT-basiert, Session in NextAuth gespeichert, `getServerSession()` in API-Routes
- **Middleware:** Schützt alle Routen außer `/`, `/login`, `/api/auth`
- **DB-Mapping:** `snake_case` (DB) → `camelCase` (TypeScript) in API-Routes
- **UI-Pattern:** Mobile-First mit `AppShell` (Sidebar desktop, BottomNav mobile)
- **Shared Components:** `InputField` wird in Profile, Admin und Projektedit verwendet

## API-Endpunkte
| Methode | Pfad | Auth | Beschreibung |
|---------|------|------|-------------|
| GET | `/api/projects` | Ja | Alle Projekte mit Trades + Tasks |
| POST | `/api/projects` | Architect | Neues Projekt erstellen |
| GET | `/api/projects/[id]` | Ja | Einzelprojekt |
| PUT | `/api/projects/[id]` | Architect (Owner) | Projekt aktualisieren |
| DELETE | `/api/projects/[id]` | Architect (Owner) | Projekt löschen |
| POST | `/api/projects/[id]/trades` | Architect | Gewerk hinzufügen |
| PATCH | `/api/projects/[id]/trades/[tradeId]` | Architect | Gewerk aktualisieren |
| DELETE | `/api/projects/[id]/trades/[tradeId]` | Architect | Gewerk löschen |
| GET | `/api/users` | Ja | Alle Benutzer |
| POST | `/api/users` | Architect | Neuen Benutzer erstellen |
| PUT | `/api/users/[id]` | Self/Architect | Benutzer aktualisieren |
| DELETE | `/api/users/[id]` | Architect | Benutzer löschen (nicht sich selbst) |
| GET | `/api/messages` | Ja | Nachrichten |
| POST | `/api/seed` | Architect | Datenbank mit Demodaten befüllen |

## Abgeschlossene Verbesserungen
1. **Security:** `/api/seed` gesichert (POST + Auth), bcrypt async, Service Role Key
2. **Bugs:** `await createUser()`, `updatedAt`-Mapping, Date-Mutation in `calculateTradeDates`
3. **API:** Fehlende Endpunkte erstellt (Users CRUD, Trades CRUD), Ownership-Checks
4. **Dead Code:** AuthContext, LoginScreen, PhotoGallery, PullToRefresh, DiaryEntry-Type entfernt
5. **UI:** Sidebar Dashboard-Link, SwipeableSheet Dark Mode, Notification Badges, Settings currentPage
6. **A11y:** aria-labels, role="dialog", aria-modal auf Modals/Sheets
7. **UX:** Notification-Settings in localStorage, stale closure in PhotoLightbox behoben
8. **Shared Component:** `InputField` extrahiert und in 3 Seiten wiederverwendet
9. **Projektstruktur:** Von `app/`-Subdirectory zu Repo-Root verschoben

## Offene Punkte / TODO
### Kritisch
- [ ] Task-Statusänderungen werden nicht persistiert (kein `/api/tasks` Endpoint)
- [ ] Fotos/Kommentare kommen immer leer vom API zurück (keine separaten Tabellen/Queries)
- [ ] Foto-Upload nicht implementiert (kein File-Input, kein Supabase Storage)

### Wichtig
- [ ] PDF-Export ist nur Platzhalter (`alert()`)
- [ ] Keine Echtzeit-Updates (kein WebSocket/Polling)
- [ ] Timeline nutzt fiktive Positionierungslogik
- [ ] TaskDetailModal Verlaufs-Tab ist hardcoded
- [ ] Keine Error Boundaries (`error.tsx` / `not-found.tsx`)
- [ ] `.env.example` Datei fehlt
- [ ] Passwortänderung prüft nicht das aktuelle Passwort
- [ ] Alle Seiten nutzen `projects[0]` (kein Multi-Projekt-Selektor)
- [ ] `demo-data.ts` existiert noch (wird aber nicht mehr importiert)
- [ ] Seed-Route sollte nur im Dev-Modus verfügbar sein (`NODE_ENV`-Check)

### Nice-to-have
- [ ] No pagination on lists
- [ ] Kein Suchfeld funktional (nur UI)
- [ ] Keine Tests vorhanden
- [ ] Kein Loading-State bei API-Calls (teilweise)
- [ ] Kein Service Worker / PWA Support
- [ ] Hard-coded Organization ID verhindert Multi-Tenancy

## Befehle
```bash
npm run dev      # Entwicklungsserver starten
npm run build    # Produktions-Build
npm run start    # Produktionsserver starten
npm run lint     # ESLint ausführen
```
