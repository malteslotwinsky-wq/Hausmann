'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { defaultTheme } from '@/lib/branding';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 bg-accent rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* === NAVIGATION === */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-xl text-foreground">{defaultTheme.name}</span>
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
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
            Die digitale Schaltzentrale für <span className="text-accent">Ihre Baustelle</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {defaultTheme.name} verbindet Bauleitung, Handwerker und Bauherren auf einer Plattform.
            Echtzeit-Updates, Foto-Dokumentation und automatisches Bautagebuch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="btn-mobile btn-mobile-lg btn-mobile-accent tap-active"
            >
              Kostenlos starten
            </Link>
            <Link href="/login" className="btn-mobile btn-mobile-lg btn-mobile-secondary tap-active">
              Demo ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">
            Alles, was Sie für die Bauleitung brauchen
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📊"
              title="Live-Fortschritt"
              description="Sehen Sie in Echtzeit, welche Gewerke arbeiten und wie weit Ihr Projekt ist."
            />
            <FeatureCard
              icon="📷"
              title="Foto-Dokumentation"
              description="Handwerker dokumentieren ihre Arbeit mit Fotos. Alles revisionssicher gespeichert."
            />
            <FeatureCard
              icon="📓"
              title="Automatisches Bautagebuch"
              description="Das Bautagebuch schreibt sich selbst. Jede Aktivität wird protokolliert."
            />
            <FeatureCard
              icon="📱"
              title="Mobile-First"
              description="Optimiert für die Baustelle. Große Buttons, schnelle Bedienung, offline-fähig."
            />
            <FeatureCard
              icon="🔔"
              title="Sofort-Benachrichtigungen"
              description="Wissen Sie sofort, wenn etwas blockiert ist oder Aufmerksamkeit braucht."
            />
            <FeatureCard
              icon="🔐"
              title="Rollen & Rechte"
              description="Bauleitung, Handwerker und Bauherren sehen genau das, was sie sehen sollen."
            />
          </div>
        </div>
      </section>

      {/* === PRICING SECTION === */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-4">
            Einfache, transparente Preise
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Wählen Sie das passende Paket für Ihre Projekte. Jederzeit kündbar.
          </p>
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
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Bereit, Ihre Baustelle zu digitalisieren?
          </h2>
          <p className="text-white/70 mb-8">
            Starten Sie noch heute kostenlos und überzeugen Sie sich selbst.
          </p>
          <Link
            href="/login"
            className="btn-mobile btn-mobile-lg bg-white text-primary tap-active inline-flex"
          >
            Jetzt loslegen
          </Link>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="py-8 border-t border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-medium text-foreground">{defaultTheme.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 {defaultTheme.name} · Made in Germany 🇩🇪 · DSGVO-konform
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="card-mobile text-center p-6">
      <span className="text-4xl block mb-4">{icon}</span>
      <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
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
            ${highlighted ? 'border-2 border-accent shadow-lg' : ''}
        `}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
          BELIEBT
        </div>
      )}
      <h3 className="font-bold text-xl text-foreground">{name}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">€{price}</span>
        <span className="text-muted-foreground">/Monat</span>
      </div>
      <ul className="space-y-3 mb-6 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
            <span className="text-accent">✓</span>
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
