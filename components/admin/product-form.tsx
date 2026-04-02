'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2 } from 'lucide-react'

const ProductSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  sku: z.string().min(1, 'SKU ist erforderlich'),
  slug: z.string().min(1, 'Slug ist erforderlich'),
  price: z.number().positive('Preis muss positiv sein'),
  stock: z.number().int().min(0, 'Bestand darf nicht negativ sein'),
  categoryId: z.string().min(1, 'Kategorie ist erforderlich'),
  description: z.string().optional(),
  pdfUrl: z.string().optional(),
  isUsed: z.boolean().optional(),
  isB2BOnly: z.boolean().optional(),
  machineIds: z.array(z.string()).optional(),
})

type ProductFormData = {
  id?: string
  name: string
  sku: string
  slug: string
  description: string
  price: number
  stock: number
  categoryId: string
  isUsed: boolean
  isB2BOnly: boolean
  pdfUrl: string
  machineIds: string[]
}

type CategoryOption = { id: string; name: string }
type MachineOption = { id: string; manufacturer: string; name: string }

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

export function ProductForm({
  product,
  categories,
  machines,
}: {
  product?: ProductFormData
  categories: CategoryOption[]
  machines: MachineOption[]
}) {
  const router = useRouter()
  const isEditing = !!product?.id

  const [form, setForm] = useState<ProductFormData>({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    stock: product?.stock ?? 0,
    categoryId: product?.categoryId ?? '',
    isUsed: product?.isUsed ?? false,
    isB2BOnly: product?.isB2BOnly ?? false,
    pdfUrl: product?.pdfUrl ?? '',
    machineIds: product?.machineIds ?? [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleNameChange = useCallback(
    (value: string) => {
      setForm((prev) => ({
        ...prev,
        name: value,
        // Auto-generate slug only if slug was not manually edited or is empty
        slug: !prev.slug || prev.slug === slugify(prev.name) ? slugify(value) : prev.slug,
      }))
    },
    []
  )

  const toggleMachine = useCallback((machineId: string) => {
    setForm((prev) => ({
      ...prev,
      machineIds: prev.machineIds.includes(machineId)
        ? prev.machineIds.filter((id) => id !== machineId)
        : [...prev.machineIds, machineId],
    }))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const parsed = ProductSchema.safeParse({
      ...form,
      description: form.description || undefined,
      pdfUrl: form.pdfUrl || undefined,
    })

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString()
        if (key) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)

    try {
      const url = isEditing
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Fehler beim Speichern')
      }

      toast.success(
        isEditing
          ? 'Produkt erfolgreich aktualisiert'
          : 'Produkt erfolgreich erstellt'
      )
      router.push('/admin/produkte')
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Group machines by manufacturer
  const machinesByManufacturer = machines.reduce(
    (acc, machine) => {
      if (!acc[machine.manufacturer]) {
        acc[machine.manufacturer] = []
      }
      acc[machine.manufacturer].push(machine)
      return acc
    },
    {} as Record<string, MachineOption[]>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Allgemeine Informationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="z.B. Honleiste K12-Standard"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  placeholder="z.B. HL-K12-001"
                  aria-invalid={!!errors.sku}
                />
                {errors.sku && (
                  <p className="text-xs text-destructive">{errors.sku}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="honleiste-k12-standard"
                  aria-invalid={!!errors.slug}
                />
                {errors.slug && (
                  <p className="text-xs text-destructive">{errors.slug}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Produktbeschreibung..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdfUrl">PDF-URL (Datenblatt)</Label>
              <Input
                id="pdfUrl"
                value={form.pdfUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, pdfUrl: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing and inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Preis & Bestand</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preis (EUR) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price || ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  aria-invalid={!!errors.price}
                />
                {errors.price && (
                  <p className="text-xs text-destructive">{errors.price}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Bestand *</Label>
                <Input
                  id="stock"
                  type="number"
                  step="1"
                  min="0"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      stock: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  aria-invalid={!!errors.stock}
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">{errors.stock}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Kategorie *</Label>
              <select
                id="categoryId"
                value={form.categoryId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, categoryId: e.target.value }))
                }
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-invalid={!!errors.categoryId}
              >
                <option value="">Kategorie wählen...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId}</p>
              )}
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isUsed">Gebraucht</Label>
                  <p className="text-xs text-muted-foreground">
                    Als gebrauchtes Produkt markieren
                  </p>
                </div>
                <Switch
                  id="isUsed"
                  checked={form.isUsed}
                  onCheckedChange={(checked: boolean) =>
                    setForm((prev) => ({ ...prev, isUsed: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isB2BOnly">Nur B2B</Label>
                  <p className="text-xs text-muted-foreground">
                    Nur für Geschäftskunden sichtbar
                  </p>
                </div>
                <Switch
                  id="isB2BOnly"
                  checked={form.isB2BOnly}
                  onCheckedChange={(checked: boolean) =>
                    setForm((prev) => ({ ...prev, isB2BOnly: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compatible machines */}
      <Card>
        <CardHeader>
          <CardTitle>Kompatible Maschinen</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(machinesByManufacturer).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Keine Maschinen vorhanden. Erstellen Sie zuerst Maschinen unter
              &quot;Maschinen&quot;.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(machinesByManufacturer)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([manufacturer, manufacturerMachines]) => (
                  <div key={manufacturer}>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                      {manufacturer}
                    </h4>
                    <div className="space-y-1.5">
                      {manufacturerMachines.map((machine) => (
                        <label
                          key={machine.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                        >
                          <input
                            type="checkbox"
                            checked={form.machineIds.includes(machine.id)}
                            onChange={() => toggleMachine(machine.id)}
                            className="h-4 w-4 rounded border-input text-nepa-blue focus:ring-nepa-blue"
                          />
                          {machine.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/produkte')}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          className="bg-nepa-blue hover:bg-nepa-blue/90"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEditing ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </form>
  )
}
