import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

export default function TrekkSheet() {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const [staatid, setStaatid] = useState('1')
  const [djupne, setDjupne] = useState('')
  const [total, setTotal] = useState('0')
  const [undermals, setUndermals] = useState('0')
  const [error, setError] = useState('')

  useEffect(() => {
    function handleTrekkSelected(event) {
      setPosition(event.detail)
      setOpen(true)
      setError('')
      setStaatid('1')
      setDjupne('')
      setTotal('0')
      setUndermals('0')
    }

    window.addEventListener('trekk-selected', handleTrekkSelected)

    return () => {
      window.removeEventListener('trekk-selected', handleTrekkSelected)
    }
  }, [])

  async function handleSave() {
    if (!position) return

    const totalNumber = Number(total)
    const undermalsNumber = Number(undermals)

    if (Number.isNaN(totalNumber) || Number.isNaN(undermalsNumber)) {
      setError('Fyll inn tal.')
      return
    }

    if (undermalsNumber > totalNumber) {
      setError('Undermåls kan ikkje vere fleire enn totalt.')
      return
    }

    try {
      const response = await fetch('/trekk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: position.lat,
          lng: position.lng,
          staatid_dagar: Number(staatid),
          total_antall: totalNumber,
          undermals_antall: undermalsNumber,
          djupne: djupne === '' ? null : Number(djupne),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.detail || `HTTP ${response.status}`)
      }

      setOpen(false)
      setError('')
    } catch (err) {
      setError('Feil: ' + err.message)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)

        if (!nextOpen) {
          window.dispatchEvent(new CustomEvent('trekk-sheet-closed'))
        }
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Registrer trekk</SheetTitle>
          <SheetDescription>
            {position
              ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
              : 'Velg ein posisjon på kartet'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Stod ute</label>
            <select
              value={staatid}
              onChange={(e) => setStaatid(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="1">1 døgn</option>
              <option value="2">2 døgn</option>
              <option value="3">3 døgn</option>
              <option value="4">4 døgn</option>
              <option value="5">5 døgn eller meir</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Djupne (m)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={djupne}
              onChange={(e) => setDjupne(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hummar totalt</label>
            <input
              type="number"
              min="0"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Undermåls</label>
            <input
              type="number"
              min="0"
              value={undermals}
              onChange={(e) => setUndermals(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            Avbryt
          </Button>

          <Button className="flex-1" onClick={handleSave}>
            Lagre
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}