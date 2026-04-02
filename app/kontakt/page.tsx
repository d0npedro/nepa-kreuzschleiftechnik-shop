import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Kontaktieren Sie NEPA Kreuzschleiftechnik für technische Beratung und Bestellungen.',
}

export default function KontaktPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-nepa-blue mb-2">Kontakt</h1>
      <p className="text-muted-foreground mb-8">
        Haben Sie Fragen zu unseren Produkten oder benötigen technische Beratung? Wir helfen Ihnen gerne weiter.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-nepa-green" />
                E-Mail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href="mailto:info@nepa.de" className="text-nepa-blue hover:underline">
                info@nepa.de
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-nepa-green" />
                Telefon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>+49 (0) XXX XXXX XXX</p>
              <p className="text-sm text-muted-foreground mt-1">
                Technische Beratung und Bestellungen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-nepa-green" />
                Adresse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>NEPA Kreuzschleiftechnik</p>
              <p>Musterstraße 1</p>
              <p>12345 Musterstadt</p>
              <p>Deutschland</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-nepa-green" />
                Geschäftszeiten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Mo – Fr: 08:00 – 17:00 Uhr</p>
              <p className="text-sm text-muted-foreground mt-1">
                Außerhalb der Geschäftszeiten erreichen Sie uns per E-Mail.
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Nachricht senden</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-nepa-blue"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">E-Mail</label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-nepa-blue"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">Betreff</label>
                  <input
                    id="subject"
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-nepa-blue"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">Nachricht</label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-nepa-blue resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-nepa-blue text-white py-2 px-4 rounded-md hover:bg-nepa-blue/90 transition-colors font-medium"
                >
                  Nachricht senden
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
