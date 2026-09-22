// Kommunikasjon med backend.

//Teiknar det lagra polygonet
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
        interactive: false // For at layer ikkje skal hindra teikning av nye områder
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

function publishStatus(message, type = '') {
  const status = { message, type };

  window.__fangstPlotStatus = status;

  window.dispatchEvent(new CustomEvent('status-update', {
    detail: status
  }));
}