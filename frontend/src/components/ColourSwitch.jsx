import {
    Switch,
} from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function ColourSwitch() {
    return (
        <div className="flex flex-col items-center gap-1">
            <Label htmlFor="fargekart" className="text-xs text-[#0f172a]">Svart-kvitt</Label>
            <Switch id="fargekart"/>
        </div>
    )
}