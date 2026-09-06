// Kart, kartlag, panes og teiknekontroll.

var map = L.map('map').setView([59.75, 5.25], 11);

L.tileLayer(
    'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png',
    { attribution: '&copy; <a href="http://www.kartverket.no/">Kartverket</a>' }
).addTo(map);

// Varmekartet ligg oppå og slepp musepeikaren gjennom til hexane.
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