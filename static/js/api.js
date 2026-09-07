// Kommunikasjon med backend.

function settStatus(tekst) {
    const el = document.getElementById('result');
    if (el) el.innerText = tekst;
}

map.on('draw:created', async function (e) {
    drawnItems.clearLayers();
    drawnItems.addLayer(e.layer);

    var ring = e.layer.toGeoJSON().geometry.coordinates[0];
    var status = document.getElementById('result');
    status.innerText = 'Lastar varmekart…';

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
        status.innerText = '';
    } catch (err) {
        sisteCeller = [];
        status.innerText = 'Feil: ' + err.message;
    }
});