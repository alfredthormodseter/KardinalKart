import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function HeatmapSwitch() {
    const [isChecked, setIsChecked] = useState(true)

    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent('varmekart-toggle', { detail: { visible: isChecked } })
        )
    }, [isChecked])

    return (
        <div className="flex flex-col items-center gap-0">
            <Label htmlFor="varmekart" className="text-[10px] text-[#0f172a]">Vis varmekart</Label>
            <Switch id="varmekart" checked={isChecked} onCheckedChange={setIsChecked} />
        </div>
    )
}