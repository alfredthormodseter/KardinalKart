import HeatmapSwitch from '@/components/HeatmapSwitch'
import ColourSwitch from '@/components/ColourSwitch'

export default function MapSettings() {
    return (
        <div className="absolute left-1 top-32 flex flex-col gap-3">
            <HeatmapSwitch />
            <ColourSwitch />
        </div>
    )
}