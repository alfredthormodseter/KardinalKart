import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { InfoIcon } from 'lucide-react'

export default function InfoSheet() {
    return (
        <Sheet>
            <SheetTrigger
                render={
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        className="fixed top-4 right-4 z-[2002] rounded-full shadow-md"
                        aria-label="Opne informasjon"
                        title="Informasjon"
                    />
                }
            >
                <InfoIcon />
            </SheetTrigger>

            <SheetContent side="right" showCloseButton={false} initialFocus={false} className="w-[92vw] sm:max-w-md max-h-[calc(100vh)] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Om</SheetTitle>
                </SheetHeader>

                <div className="space-y-3 px-4 pb-5 text-sm leading-relaxed">
                    <p>
                        KardinalKart er eit kart med funksjonen å laste inn eit varmekart over kvar det er sansyn for å finne hummar, og då ei anbefaling om kvar teinene dine bør setjast. Kartet baserast på geodata frå Karverket, og skal gi ei rettleiing for fiskarar som eller hadde skote i blinde. Kombiner resultatet saman med lokal kunnskap som info om botntype, kjenskap til andre artar i nærleiken og lokale straumar.
                    </p>
                    <p>
                        <strong>Slik brukar du KardinalKart:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            Trykk på figuren øvst til venstre for å aktivere teiknemodus.
                        </li>
                        <li>
                            Teikn området du ønskjer å undersøkje ved å klikke direkte på kartet og lage eit omriss.
                        </li>
                        <li>
                            Området bør helst vere mellom 4 og 10 km² for best mogleg resultat, og kan ikkje vere større enn om lag 20 km².
                        </li>
                        <li>
                            Når området er valt, vil varmekartet lastast inn og gi deg eit estimat for området du har markert.
                        </li>
                    </ul>
                    <p>
                        Per i dag er det berre tilgjengeleg data for Bømlo kommune, men resten av Vestland vil kome etter kvart.
                    </p>
                    <p>
                        Spørsmål og innspel vert sette pris på og kan sendast til{' '}
                        <a href="mailto:info@kardinalkart.no" className="underline">
                            info@kardinalkart.no
                        </a>.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    )
}