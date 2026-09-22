// Registrering av teinetrekk.
// Leaflet sender posisjonen til React, som opnar TrekkSheet.

var trekkMarkor = null;

function fjernTrekkMarkor() {
    if (trekkMarkor) {
        map.removeLayer(trekkMarkor);
        trekkMarkor = null;
    }
}

window.addEventListener('trekk-sheet-closed', function () {
    fjernTrekkMarkor();
});

map.on('contextmenu', function (e) {
    fjernTrekkMarkor();

    trekkMarkor = L.marker(e.latlng).addTo(map);

    window.dispatchEvent(new CustomEvent('trekk-selected', {
        detail: {
            lat: e.latlng.lat,
            lng: e.latlng.lng
        }
    }));
});