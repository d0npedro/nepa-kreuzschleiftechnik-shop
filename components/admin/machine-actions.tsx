'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function MachineActions() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [manufacturer, setManufacturer] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    // Auto-generate slug from manufacturer + name
    const combined = manufacturer ? `${manufacturer} ${value}` : value
    setSlug(slugify(combined))
  }

  function handleManufacturerChange(value: string) {
    setManufacturer(value)
    if (name) {
      setSlug(slugify(`${value} ${name}`))
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!manufacturer.trim() || !name.trim() || !slug.trim()) {
      toast.error('Hersteller, Name und Slug sind erforderlich')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manufacturer: manufacturer.trim(),
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Fehler beim Erstellen')
      }

      toast.success('Maschine erstellt')
      setManufacturer('')
      setName('')
      setSlug('')
      setDescription('')
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Fehler beim Erstellen'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-nepa-blue hover:bg-nepa-blue/90">
            <Plus className="mr-2 h-4 w-4" />
            Neue Maschine
          </Button>
        }
      />
      <DialogContent>
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>Neue Maschine</DialogTitle>
            <DialogDescription>
              Erfassen Sie eine neue Maschine für die Kompatibilitätszuordnung.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="machine-manufacturer">Hersteller *</Label>
              <Input
                id="machine-manufacturer"
                value={manufacturer}
                onChange={(e) => handleManufacturerChange(e.target.value)}
                placeholder="z.B. Sunnen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="machine-name">Name *</Label>
              <Input
                id="machine-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="z.B. MBB-1660"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="machine-slug">Slug *</Label>
              <Input
                id="machine-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="sunnen-mbb-1660"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="machine-description">Beschreibung</Label>
              <Input
                id="machine-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optionale Beschreibung"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="bg-nepa-blue hover:bg-nepa-blue/90"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Erstellen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
