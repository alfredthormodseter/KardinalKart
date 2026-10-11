import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function ColourSwitch() {
    const [isChecked, setIsChecked] = useState(false)

    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent('sjoKart-toggle', { detail: { svartKvitt: isChecked } })
        )
    }, [isChecked])

    return (
        <div className="flex flex-col items-center gap-0">
            <Label htmlFor="sjokart" className="text-[10px] text-[#0f172a]" style={{fontFamily: 'Almendra, serif'}}>Sjøkart</Label>
            <Switch id="sjokart" checked={isChecked} onCheckedChange={setIsChecked} />
        </div>
    )
}