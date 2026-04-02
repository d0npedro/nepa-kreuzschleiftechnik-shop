import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MachineActions } from '@/components/admin/machine-actions'

export const dynamic = "force-dynamic"

export default async function MaschinenAdminPage() {
  const machines = await prisma.machine.findMany({
    include: {
      _count: { select: { products: true } },
    },
    orderBy: [{ manufacturer: 'asc' }, { name: 'asc' }],
  })

  // Group by manufacturer
  const grouped = machines.reduce(
    (acc, machine) => {
      if (!acc[machine.manufacturer]) {
        acc[machine.manufacturer] = []
      }
      acc[machine.manufacturer].push(machine)
      return acc
    },
    {} as Record<
      string,
      (typeof machines)[number][]
    >
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maschinen</h2>
          <p className="text-muted-foreground">
            {machines.length} Maschinen von{' '}
            {Object.keys(grouped).length} Herstellern
          </p>
        </div>
        <MachineActions />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
          Noch keine Maschinen vorhanden.
        </div>
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([manufacturer, manufacturerMachines]) => (
            <div key={manufacturer} className="space-y-2">
              <h3 className="text-lg font-semibold">{manufacturer}</h3>
              <div className="rounded-lg border bg-white">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead className="text-center">
                        Kompatible Produkte
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manufacturerMachines.map((machine) => (
                      <TableRow key={machine.id}>
                        <TableCell className="font-medium">
                          {machine.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {machine.slug}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {machine.description || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {machine._count.products}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))
      )}
    </div>
  )
}
