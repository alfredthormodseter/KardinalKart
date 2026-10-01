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

            <SheetContent side="right" className="w-[92vw] sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Om</SheetTitle>
                </SheetHeader>

                <div className="space-y-3 px-4 pb-5 text-sm leading-relaxed">
                    <p>
                        KardinalKart er eit kart med funksjonen å laste inn eit varmekart over kvar det er sansyn for hummar, og då ei anbefaling av kvar teinene dine bør setjast. Kartet baserast på geodata frå Karverket, og skal gi ei rettleiing for fiskarar som eller hadde skote i blinde. Varmekartet er meint å brukat saman med info om botntype, kjenskap til andre artar i nærleiken og lokale straumar. Det er for augeblikket berre data for Bømlo kommune, men heile Vestland er å venta i nær framtid.
                    </p>
                    <p>
                        For å laste eit varmekart må du markere det område du ser på som aktuelt å setja teiner i. Du aktiverar teiknemodus ved å trykkje på figuren oppe i venstre hjørna. Deretter trykkar du på kartet for å lage omrisset. Omrisset har ei storleiksbegrensing på omtrent 20 km2. Eit område på 4-10 km2 er anbefalt for eit godt resultat. Varmekartet brukar rundt 20 sekund per km2 å laste inn.
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    )
}