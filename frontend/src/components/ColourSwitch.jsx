import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function ColourSwitch() {
    const [isChecked, setIsChecked] = useState(true)
    return (
        <div className="flex flex-col items-center gap-0">
            <Label htmlFor="fargekart" className="text-[10px] text-[#0f172a]">Svart-kvitt</Label>
            <Switch id="fargekart checked={isChecked} onCheckedChange={setIsChecked}"/>
        </div>
    )
}