import {
    Switch,
} from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function HeatmapSwitch() {
    return (
        <div className="flex flex-col items-center gap-1">
            <Label htmlFor="varmekart" className="text-[8px] text-[#0f172a]">Vis varmekart</Label>
            <Switch id="varmekart"/>
        </div>
    )
}