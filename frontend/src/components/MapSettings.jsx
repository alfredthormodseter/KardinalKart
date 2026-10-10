import HeatmapSwitch from '@/components/HeatmapSwitch'
import ColourSwitch from '@/components/ColourSwitch'

export default function MapSettings() {
    return (
        <div className="absolute left-1 top-40 md:top-26 flex flex-col gap-0">
            <HeatmapSwitch />
            <ColourSwitch />
        </div>
    )
}