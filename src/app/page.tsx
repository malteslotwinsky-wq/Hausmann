'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { defaultTheme } from '@/lib/branding';
import { BauLotIcon } from '@/components/ui/Logo';

export default function LandingPage() {
  const { data: _session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* === NAVIGATION === */}
      <nav className="sticky top-0 z-50 bg-surface/70 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-accent-foreground">
              <BauLotIcon size={16} />
            </div>
            <span className="font-semibold text-lg text-foreground tracking-tight">{defaultTheme.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="btn-mobile btn-mobile-accent tap-active text-sm px-6"
            >
              Anmelden
            </Link>
          </div>
        </div>
      </nav>

      {/* === HERO SECTION === */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-muted text-accent rounded-full text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Jetzt verfügbar – Version 3.0
          </div>
          <h1 className="text-4xl md:text-[3.25rem] font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
            Die digitale Schaltzentrale für{' '}
            <span className="text-accent">Ihre Baustelle</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {defaultTheme.name} verbindet Bauleitung, Handwerker und Bauherren auf einer Plattform.
            Echtzeit-Updates, Foto-Dokumentation und automatisches Bautagebuch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="btn-mobile btn-mobile-lg btn-mobile-accent tap-active"
            >
              Kostenlos starten
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="/login" className="btn-mobile btn-mobile-lg btn-mobile-secondary tap-active">
              Demo ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section className="py-20 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
              Alles, was Sie für die Bauleitung brauchen
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Eine Plattform, die Ihr gesamtes Baustellenmanagement vereinfacht und digitalisiert.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<ChartIcon />}
              title="Live-Fortschritt"
              description="Sehen Sie in Echtzeit, welche Gewerke arbeiten und wie weit Ihr Projekt ist."
            />
            <FeatureCard
              icon={<CameraIcon />}
              title="Foto-Dokumentation"
              description="Handwerker dokumentieren ihre Arbeit mit Fotos. Alles revisionssicher gespeichert."
            />
            <FeatureCard
              icon={<BookIcon />}
              title="Automatisches Bautagebuch"
              description="Das Bautagebuch schreibt sich selbst. Jede Aktivität wird protokolliert."
            />
            <FeatureCard
              icon={<MobileIcon />}
              title="Mobile-First"
              description="Optimiert für die Baustelle. Große Buttons, schnelle Bedienung, offline-fähig."
            />
            <FeatureCard
              icon={<BellFeatureIcon />}
              title="Sofort-Benachrichtigungen"
              description="Wissen Sie sofort, wenn etwas blockiert ist oder Aufmerksamkeit braucht."
            />
            <FeatureCard
              icon={<ShieldIcon />}
              title="Rollen & Rechte"
              description="Bauleitung, Handwerker und Bauherren sehen genau das, was sie sehen sollen."
            />
          </div>
        </div>
      </section>

      {/* === PRICING SECTION === */}
      <section className="py-20 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
              Einfache, transparente Preise
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Wählen Sie das passende Paket für Ihre Projekte. Jederzeit kündbar.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="0"
              description="Für kleine Projekte"
              features={[
                '1 aktives Projekt',
                'Bis zu 3 Benutzer',
                'Foto-Dokumentation',
                'Basis-Bautagebuch',
              ]}
              cta="Kostenlos starten"
              highlighted={false}
            />
            <PricingCard
              name="Professional"
              price="49"
              description="Für professionelle Bauleitung"
              features={[
                'Unbegrenzte Projekte',
                'Bis zu 20 Benutzer',
                'Vollständiges Bautagebuch',
                'PDF-Export',
                'Prioritäts-Support',
              ]}
              cta="14 Tage kostenlos testen"
              highlighted={true}
            />
            <PricingCard
              name="Enterprise"
              price="149"
              description="Für Bauunternehmen"
              features={[
                'Alles aus Professional',
                'Unbegrenzte Benutzer',
                'Multi-Mandanten',
                'API-Zugang',
                'Dedizierter Support',
                'SLA-Garantie',
              ]}
              cta="Kontakt aufnehmen"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* === CTA SECTION === */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">
            Bereit, Ihre Baustelle zu digitalisieren?
          </h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto">
            Starten Sie noch heute kostenlos und überzeugen Sie sich selbst.
          </p>
          <Link
            href="/login"
            className="btn-mobile btn-mobile-lg bg-accent text-accent-foreground tap-active inline-flex hover:bg-accent-light transition-colors"
          >
            Jetzt loslegen
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="py-8 border-t border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center text-accent-foreground">
              <BauLotIcon size={12} />
            </div>
            <span className="font-medium text-foreground text-sm">{defaultTheme.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 {defaultTheme.name} · Made in Germany · DSGVO-konform
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card-mobile p-6 group">
      <div className="w-10 h-10 bg-accent-muted rounded-xl flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-200">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  highlighted,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}) {
  return (
    <div className={`
        card-mobile p-6 flex flex-col relative
        ${highlighted ? 'ring-2 ring-accent' : ''}
    `}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
          BELIEBT
        </div>
      )}
      <h3 className="font-semibold text-lg text-foreground">{name}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground tracking-tight">€{price}</span>
        <span className="text-muted-foreground text-sm">/Monat</span>
      </div>
      <ul className="space-y-3 mb-6 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2.5 text-sm text-foreground">
            <svg className="text-accent shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/login"
        className={`
            btn-mobile tap-active text-center
            ${highlighted ? 'btn-mobile-accent' : 'btn-mobile-secondary'}
        `}
      >
        {cta}
      </Link>
    </div>
  );
}

// Feature SVG Icons
function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function BellFeatureIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 12 15 16 10" />
    </svg>
  );
}
