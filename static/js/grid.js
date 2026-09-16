// Varmekart-rendering

var KANTLENGD_M = 30;

var RADIUSFAKTOR = 1.4;

var varmelag = null;
var sisteCeller = [];
var sisteMaks = 0;

var GRADIENT = {
    0.22: '#4040ff',
    0.35: '#00c0ff',
    0.48: '#00e000',
    0.62: '#e0e000',
    0.78: '#ff8000',
    1.00: '#ff0000'
};

function pikslarPerMeter() {
    var c = map.getCenter();
    var c2 = L.latLng(c.lat, c.lng + 0.01);
    var meter = map.distance(c, c2);
    var px = Math.abs(
        map.latLngToContainerPoint(c2).x - map.latLngToContainerPoint(c).x
    );
    return px / meter;
}

function varmeradius() {
    // Senteravstand mellom nabohexar = kantlengd * sqrt(3).
    var senteravstandPx = pikslarPerMeter() * KANTLENGD_M * 1.732;
    return Math.max(6, senteravstandPx * RADIUSFAKTOR);
}

function sentroide(geom) {
    var ring = geom.coordinates[0];
    var n = ring.length - 1;  // siste punkt = første
    var x = 0, y = 0;
    for (var k = 0; k < n; k++) { x += ring[k][0]; y += ring[k][1]; }
    return [y / n, x / n];    // [lat, lng]
}

function varmepunkt() {
    return sisteCeller
        .filter(function (c) { return c.poeng > 0; })
        .map(function (c) {
            var s = sentroide(c.geom);
            var t = c.poeng / sisteMaks;
            return [s[0], s[1], t * t];
        });
}

function teiknGrid() {
    if (varmelag) map.removeLayer(varmelag);
    if (!sisteCeller.length) return;

    varmelag = L.heatLayer(varmepunkt(), {
        pane: 'heatPane',
        radius: varmeradius(),
        blur: varmeradius() * 0.9,
        max: 1.6,
        minOpacity: 0.12,
        maxZoom: map.getZoom(),
        gradient: GRADIENT
    }).addTo(map);
}

const result = await fetch('/api/calculate', {
    method: 'POST',
    body: JSON.stringify({wkt, size: CELLESTORLEIK})
}).then(r => r.json());

const status = document.getElementById('Status');
status.textContent = result.status;
status.style.transform = 'translateX(0)';

map.on('zoomend', function () {
    if (!varmelag) return;
    var r = varmeradius();
    varmelag.setOptions({
        radius: r,
        blur: r * 0.9,
        maxZoom: map.getZoom()
    });
});

var popup = L.popup({ closeButton: true, autoPan: false });

function delpoengTabell(delpoeng) {
    if (!delpoeng) return '';
    var rader = Object.keys(delpoeng)
        .map(function (k) {
            var v = delpoeng[k];
            return '<tr><td>' + k + '</td><td' +
                   (v > 0 ? '' : ' style="color:#999"') + '>' + v + '</td></tr>';
        })
        .join('');
    return '<table class="delpoeng-tabell">' + rader + '</table>';
}

map.on('click', function (e) {
    if (!sisteCeller.length) return;

    var best = null, minDist = Infinity;
    sisteCeller.forEach(function (c) {
        var s = sentroide(c.geom);
        var d = map.distance(e.latlng, L.latLng(s[0], s[1]));
        if (d < minDist) { minDist = d; best = c; }
    });

    if (!best || minDist > KANTLENGD_M * 1.5) return;

    popup
        .setLatLng(e.latlng)
        .setContent(
            '<b>Poeng: ' + (best.poeng ?? '–') + '</b>' +
            delpoengTabell(best.delpoeng) +
            '<div class="celle-meta">Djupne: ' +
            (best.djupne != null ? Math.abs(best.djupne).toFixed(1) + ' m' : '–') +
            '</div>'
        )
        .openOn(map);
});