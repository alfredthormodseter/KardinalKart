// Kart, kartlag, panes og teiknekontroll.

window.type = true;

var map = L.map('map').setView([59.75, 5.25], 11);

var attribusjon = '&copy; <a href="http://www.kartverket.no/">Kartverket</a>';

var svartKvittKart = L.tileLayer(
    'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png',
    { attribution: attribusjon }
);

var sjoKart = L.tileLayer(
    'https://cache.kartverket.no/v1/wmts/1.0.0/sjokartraster/default/webmercator/{z}/{y}/{x}.png',
    { attribution: attribusjon }
);

window.addEventListener('sjoKart-toggle', function (e) {
    var visSjokart = e.detail.svartKvitt;

    if (visSjokart) {
        if (map.hasLayer(svartKvittKart)) map.removeLayer(svartKvittKart);
        if (!map.hasLayer(sjoKart)) sjoKart.addTo(map);
    } else {
        if (map.hasLayer(sjoKart)) map.removeLayer(sjoKart);
        if (!map.hasLayer(svartKvittKart)) svartKvittKart.addTo(map);
    }
});

var visSvartKvitt = true;
svartKvittKart.addTo(map);



map.createPane('heatPane');
var heatPane = map.getPane('heatPane');
heatPane.style.zIndex = 360;
heatPane.style.pointerEvents = 'none';

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

L.drawLocal.draw.handlers.polygon.tooltip = {
    start: '',
    cont: '',
    end: ''
};

var drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems, edit: false, remove: false },
    draw: {
        polygon: {
            showArea: false, // vi viser areal sjølve
            allowIntersection: false,
            shapeOptions: { color: '#000', weight: 1, fill: false }
        },
        polyline: false, rectangle: false,
        circle: false, marker: false, circlemarker: false
    }
});
map.addControl(drawControl);

// ---- Live areal: musa er neste hjørne ----
var liveArealTooltip = null;

function formatAreal(m2) {
    return (m2 / 1000000).toFixed(2).replace('.', ',') + ' km²';
}

function polygonHandler() {
    return drawControl._toolbars.draw._modes.polygon.handler;
}

function oppdaterLiveAreal(e) {
    var h = polygonHandler();
    if (!h || !h._poly) return;

    var plasserte = h._poly.getLatLngs();        // flat liste med faste punkt
    if (plasserte.length < 2) return;            // treng 2 faste punkt

    var ring = plasserte.concat([e.latlng]);     // + musa som 3. (neste) hjørne
    var areal = L.GeometryUtil.geodesicArea(ring);

    if (!liveArealTooltip) {
        liveArealTooltip = L.tooltip({
            permanent: true,
            direction: 'right',
            offset: [18, 0],
            className: 'live-areal-tooltip'
        });
        liveArealTooltip.setLatLng(e.latlng).addTo(map);
    }
    liveArealTooltip.setLatLng(e.latlng).setContent('Areal: ' + formatAreal(areal));
}

function fjernLiveAreal() {
    map.off('mousemove', oppdaterLiveAreal);
    if (liveArealTooltip) {
        map.removeLayer(liveArealTooltip);
        liveArealTooltip = null;
    }
}

map.on('draw:drawstart', function (e) {
    if (e.layerType !== 'polygon') return;
    map.on('mousemove', oppdaterLiveAreal);
});
map.on('draw:drawstop', fjernLiveAreal);
map.on('draw:created', fjernLiveAreal);