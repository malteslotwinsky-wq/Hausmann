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
├── supabase_schema.sql         # Konsolidiertes Datenbankschema
├── .github/workflows/ci.yml   # CI/CD Pipeline
├── vitest.config.ts            # Test-Konfiguration
├── .env.example                # Umgebungsvariablen-Vorlage
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
- **Client-Supabase:** Entfernt (kein Client-Export mehr, `server-only` erzwungen)
- **Auth:** JWT-basiert (7 Tage), Session in NextAuth gespeichert, `getServerSession()` in API-Routes
- **Validierung:** Zod v4 für alle API-Inputs (`src/lib/validations.ts`)
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
| GET | `/api/tasks` | Ja | Tasks (filter: tradeId, projectId) |
| POST | `/api/tasks` | Architect/Contractor | Neue Aufgabe erstellen |
| PATCH | `/api/tasks/[taskId]` | Architect/Contractor | Aufgabe aktualisieren |
| DELETE | `/api/tasks/[taskId]` | Architect | Aufgabe löschen |
| GET | `/api/messages` | Ja | Nachrichten |
| POST | `/api/messages` | Ja | Nachricht senden |
| POST | `/api/seed` | Architect (nur Dev) | Datenbank mit Demodaten befüllen |

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

### Security-Härtung (2026-02-15)
10. **Zod-Validierung:** Alle API-Routes mit Input-Validierung (Typ, Länge, Format, UUID-Check)
11. **Security Headers:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options in next.config.ts
12. **Seed nur Dev:** `NODE_ENV === 'production'` Check auf `/api/seed`
13. **Passwort-Verifikation:** Aktuelles Passwort wird bei Änderung geprüft (bcrypt.compare)
14. **RLS gehärtet:** Client-Supabase-Export entfernt, `server-only` erzwungen, echte RLS-Policies
15. **Contractor-Filterung:** GET /api/projects zeigt nur Projekte mit zugewiesenen Gewerken
16. **Error-Sanitierung:** Keine Supabase-Fehlerdetails an Client, generische deutsche Meldungen
17. **Ownership-Checks:** Trades POST/PATCH/DELETE prüft architect_id am Projekt
18. **DB-Schema konsolidiert:** CHECK-Constraints, Indizes, updated_at-Trigger, Tasks-Spalten ergänzt
19. **JWT auf 7 Tage:** Session-Dauer von 30 auf 7 Tage reduziert

### Phase 2 (2026-02-15)
20. **Tasks API:** Vollständiger CRUD-Endpoint (`/api/tasks`, `/api/tasks/[taskId]`)
21. **Task-Persistierung:** Frontend ruft API bei Status-Änderungen auf (Tasks-Seite + Dashboard)
22. **Error Boundaries:** `error.tsx` für alle Route-Segmente + `not-found.tsx` + `loading.tsx`
23. **TaskStatus konsistent:** `'open'` → `'pending'` in gesamter Codebase (passend zur DB)
24. **Aufräumung:** `demo-data.ts`, alte SQL-Migrations, altes `app/`-Verzeichnis entfernt
25. **`.env.example`** erstellt

### Phase 3 (2026-02-15)
26. **Pagination:** GET `/api/users`, `/api/messages`, `/api/tasks` mit `PaginatedResponse<T>` Format
27. **Frontend-Pagination:** Admin, Contacts, Projekt-Editor extrahieren `.data` aus paginierter Antwort
28. **Tests:** Vitest + @testing-library eingerichtet, 78 Tests (validations, utils, trade-templates)
29. **CI/CD:** GitHub Actions Pipeline (Lint, TypeCheck, Test, Build) in `.github/workflows/ci.yml`

### Phase 5 - Production Launch (2026-02-18)
30. **Tests repariert:** Vitest Config (testTimeout, hookTimeout, pool: forks), server-only Mock, tsconfig excludes
31. **Rate Limiting Fix:** `apiWriteRateLimit` nutzt jetzt `inMemoryLimit` Fallback statt `{ success: true }`
32. **Supabase Client Fix:** Kein Fake-Client mehr (`placeholder.supabase.co` entfernt), `null` bei fehlenden Env-Vars
33. **Suchfunktion:** Header-Suche durchsucht Projekte, Gewerke und Aufgaben (Cmd+K Shortcut)
34. **Turbopack Root:** `process.cwd()` als Root konfiguriert
35. **Housekeeping:** Debug-Scripts in `.gitignore`, `branding.ts` vereinfacht, `SelectField` committed
36. **`getOrganizationTheme`:** Vereinfacht (synchron, kein Placeholder-Kommentar mehr)

## Offene Punkte / TODO
### Kritisch
- [x] ~~Fotos/Kommentare kommen immer leer vom API zurück~~ (Phase 4: Photos + Comments API)
- [x] ~~Foto-Upload nicht implementiert~~ (Phase 4: Supabase Storage)
- [x] ~~CSRF-Schutz fehlt~~ (Origin-Header-Validierung in Middleware)
- [x] ~~Rate Limiting fehlt~~ (Upstash Redis + In-Memory-Fallback)

### Wichtig
- [x] ~~PDF-Export ist nur Platzhalter~~ (Phase 4: jspdf)
- [x] ~~Keine Echtzeit-Updates~~ (Phase 4: Supabase Realtime)
- [ ] Timeline nutzt fiktive Positionierungslogik
- [ ] TaskDetailModal Verlaufs-Tab ist hardcoded
- [ ] Passwort-vergessen benötigt E-Mail-Provider (Resend konfigurieren)
- [x] ~~Alle Seiten nutzen `projects[0]`~~ (Phase 4: Multi-Projekt-Selektor)
- [ ] Kein Error-Tracking (Sentry o.ä.)

### Nice-to-have
- [x] ~~Kein Suchfeld funktional~~ (Phase 5: Header-Suche mit Cmd+K)
- [ ] Kein Loading-State bei API-Calls (teilweise)
- [ ] Kein Service Worker / PWA Support
- [ ] Hard-coded Organization ID verhindert Multi-Tenancy

## Befehle
```bash
npm run dev        # Entwicklungsserver starten
npm run build      # Produktions-Build
npm run start      # Produktionsserver starten
npm run lint       # ESLint ausführen
npm test           # Tests ausführen (vitest)
npm run test:watch # Tests im Watch-Modus
```
