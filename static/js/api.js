// Kommunikasjon med backend.

function settStatus(tekst) {
    const el = document.getElementById('result');
    if (el) el.innerText = tekst;
}

// Teiknar omrisset utan å utløyse draw:created.
function visOmriss(ring) {
    drawnItems.clearLayers();
    var latlngs = ring.map(function (p) { return [p[1], p[0]]; });
    drawnItems.addLayer(L.polygon(latlngs, {
        color: '#000', weight: 1, fill: false, fillOpacity: 0
    }));
}

// Felles veg for både nyteikna og gjenoppretta område.
async function lastGrid(ring) {
    settStatus('Lastar varmekart…');
    try {
        var svar = await fetch('/create-grid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coordinates: ring })
        });

        if (!svar.ok) {
            var feil = await svar.json().catch(() => ({}));
            throw new Error(feil.detail || ('HTTP ' + svar.status));
        }

        var data = await svar.json();
        sisteCeller = data.cells;
        sisteMaks = data.maks_poeng;
        teiknGrid();
        settStatus('');
    } catch (err) {
        sisteCeller = [];
        settStatus('Feil: ' + err.message);
    }
}

map.on('draw:created', async function (e) {
    drawnItems.clearLayers();
    drawnItems.addLayer(e.layer);

    var ring = e.layer.toGeoJSON().geometry.coordinates[0];
    await lastGrid(ring);

    // Lagringa er sekundær: feilar ho, står kartet likevel.
    fetch('/omraade', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: ring })
    }).catch(function (err) {
        console.warn('Klarte ikkje lagre området:', err);
    });
});

// Ved oppstart: hent sist markerte område og rekn gridet på nytt.
(function gjenopprett() {
    fetch('/omraade')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
            if (!data || !Array.isArray(data.coordinates)) return;
            visOmriss(data.coordinates);
            lastGrid(data.coordinates);
        })
        .catch(function (err) {
            console.warn('Klarte ikkje hente lagra område:', err);
        });
})();