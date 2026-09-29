import { useEffect, useState } from 'react'
import { lagreTrekk, hentAlleTrekk } from '@/utils/indexeddb-trekk.js'
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
      // Store locally in IndexedDB
      await lagreTrekk({
        lat: position.lat,
        lng: position.lng,
        staatid_dagar: Number(staatid),
        total_antall: totalNumber,
        undermaals_antall: undermalsNumber,
        djupne: djupne === '' ? null : Number(djupne),
      })

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
        <SheetContent side="right" className="z-[2001] h-full w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Registrer trekk</SheetTitle>
            <SheetDescription>
              {position
                  ? `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`
                  : 'Velg ein posisjon på kartet'}
            </SheetDescription>
          </SheetHeader>
          {/* ... rest of form remains the same ... */}
        </SheetContent>
      </Sheet>
  )
}