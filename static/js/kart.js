// Kart, kartlag, panes og teiknekontroll.

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
    visSvartKvitt = e.detail.svartKvitt;

    if (visSvartKvitt) {
        if (map.hasLayer(sjoKart)) map.removeLayer(sjoKart);
        if (!map.hasLayer(svartKvittKart)) svartKvittKart.addTo(map);
    } else {
        if (map.hasLayer(svartKvittKart)) map.removeLayer(svartKvittKart);
        if (!map.hasLayer(sjoKart)) sjoKart.addTo(map);
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

map.addControl(new L.Control.Draw({
    edit: { featureGroup: drawnItems, edit: false, remove: false },
    draw: {
        polygon: { shapeOptions: { color: '#000', weight: 1, fill: false, fillOpacity: 0 } },
        polyline: false, rectangle: false,
        circle: false, marker: false, circlemarker: false
    }
}));