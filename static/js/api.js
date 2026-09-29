// Visalizes the saved polygon
function visOmriss(ring) {
    drawnItems.clearLayers();
    var latlngs = ring.map(function (p) {
        return [p[1], p[0]];
    });
    drawnItems.addLayer(L.polygon(latlngs, {
        color: '#000',
        weight: 1,
        fill: false,
        fillOpacity: 0,
        interactive: false
    }));
}

async function lastGrid(ring) {
    publishStatus('Lastar varmekart...', 'loading')
    try {
        var svar = await fetch('/create-grid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coordinates: ring })
        })
        var data = await svar.json()
        if (!svar.ok) {
            throw new Error(data.detail || ('HTTP ' + svar.status))
        }
        if (data.error) {
            publishStatus(data.status, 'error')
            return
        }
        publishStatus(data.status, 'success')
        sisteCeller = data.cells || []
        sisteMaks = data.maks_poeng || 0
        teiknGrid()
        setTimeout(() => {
            publishStatus('', '')
        }, 2000)
    } catch (err) {
        publishStatus('Klarte ikkje laste varmekartet: ' + err.message, 'error')
        sisteCeller = []
        sisteMaks = 0
    }
}

map.on('draw:created', async function (e) {
    drawnItems.clearLayers();
    drawnItems.addLayer(e.layer);
    var ring = e.layer.toGeoJSON().geometry.coordinates[0];
    await lastGrid(ring);

    // Store locally in browser
    try {
        lagreOmraade(ring);
    } catch (err) {
        console.warn('Klarte ikkje lagre området lokalt:', err);
    }
});

// On startup: restore saved area from localStorage
(function gjenopprett() {
    const savedCoordinates = hentOmraade();
    if (savedCoordinates && Array.isArray(savedCoordinates)) {
        visOmriss(savedCoordinates);
        lastGrid(savedCoordinates);
    }
})();

function publishStatus(message, type = '') {
    const status = { message, type };
    window.__fangstPlotStatus = status;
    window.dispatchEvent(new CustomEvent('status-update', {
        detail: status
    }));
}