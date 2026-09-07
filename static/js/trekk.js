// Registrering av teinetrekk. Høgreklikk på kartet opnar panelet.

var trekkPanel = document.getElementById('trekk-panel');
var trekkPosisjon = null;
var trekkMarkor = null;

// Sesjonsminne: neste registrering arvar ståtida frå den førre.
var sisteStaatid = '1';

function opnaTrekkPanel(latlng) {
    trekkPosisjon = latlng;
    if (trekkMarkor) map.removeLayer(trekkMarkor);
    trekkMarkor = L.marker(latlng).addTo(map);

    document.getElementById('trekk-posisjon').innerText =
        latlng.lat.toFixed(5) + ', ' + latlng.lng.toFixed(5);
    document.getElementById('trekk-staatid').value = sisteStaatid;
    document.getElementById('trekk-djupne').value = '';
    document.getElementById('trekk-total').value = '0';
    document.getElementById('trekk-undermaals').value = '0';
    document.getElementById('trekk-feil').innerText = '';

    trekkPanel.hidden = false;
}

function lukkTrekkPanel() {
    trekkPanel.hidden = true;
    trekkPosisjon = null;
    if (trekkMarkor) {
        map.removeLayer(trekkMarkor);
        trekkMarkor = null;
    }
}

map.on('contextmenu', function (e) {
    opnaTrekkPanel(e.latlng);
});

document.getElementById('trekk-avbryt')
        .addEventListener('click', lukkTrekkPanel);

document.getElementById('trekk-lagre')
        .addEventListener('click', async function () {
    if (!trekkPosisjon) return;

    var staatid = document.getElementById('trekk-staatid').value;
    var djupne = document.getElementById('trekk-djupne').value;
    var total = parseInt(document.getElementById('trekk-total').value, 10);
    var undermaals = parseInt(document.getElementById('trekk-undermaals').value, 10);
    var feil = document.getElementById('trekk-feil');

    if (isNaN(total) || isNaN(undermaals)) {
        feil.innerText = 'Fyll inn tal.';
        return;
    }
    if (undermaals > total) {
        feil.innerText = 'Undermåls kan ikkje vere fleire enn totalt.';
        return;
    }

    try {
        var svar = await fetch('/trekk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lat: trekkPosisjon.lat,
                lng: trekkPosisjon.lng,
                staatid_dagar: parseInt(staatid, 10),
                total_antall: total,
                undermaals_antall: undermaals,
                djupne: djupne === '' ? null : parseFloat(djupne)
            })
        });

        if (!svar.ok) {
            var d = await svar.json().catch(() => ({}));
            throw new Error(d.detail || ('HTTP ' + svar.status));
        }

        sisteStaatid = staatid;
        lukkTrekkPanel();
    } catch (err) {
        feil.innerText = 'Feil: ' + err.message;
    }
});