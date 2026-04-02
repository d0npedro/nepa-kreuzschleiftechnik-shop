import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
}

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-nepa-blue mb-6">Datenschutzerklärung</h1>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Datenschutz auf einen Blick</h2>
          <h3 className="text-lg font-medium mb-1">Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
            Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Datenerfassung auf dieser Website</h2>
          <h3 className="text-lg font-medium mb-1">Wer ist verantwortlich für die Datenerfassung?</h3>
          <p>
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
            Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
          </p>
          <h3 className="text-lg font-medium mb-1">Wie erfassen wir Ihre Daten?</h3>
          <p>
            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei
            kann es sich z. B. um Daten handeln, die Sie bei einer Bestellung eingeben.
          </p>
          <p>
            Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst.
            Das sind vor allem technische Daten (z. B. Internetbrowser, Betriebssystem oder Uhrzeit
            des Seitenaufrufs).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. Zahlungsabwicklung</h2>
          <p>
            Für die Zahlungsabwicklung nutzen wir den Dienst Stripe. Ihre Zahlungsdaten werden
            direkt von Stripe verarbeitet und nicht auf unseren Servern gespeichert. Die
            Datenschutzerklärung von Stripe finden Sie unter https://stripe.com/de/privacy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Hosting</h2>
          <p>
            Diese Website wird bei Vercel gehostet. Die Datenschutzerklärung von Vercel finden
            Sie unter https://vercel.com/legal/privacy-policy.
          </p>
          <p>
            Die Datenbank wird bei Supabase gehostet. Weitere Informationen finden Sie unter
            https://supabase.com/privacy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Ihre Rechte</h2>
          <p>
            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und
            Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem
            ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen.
          </p>
        </section>
      </div>
    </div>
  )
}
