var trekkPosisjon = null;
var trekkMarkor = null;

window.addEventListener('trekk-sheet-closed', function () {
    if (trekkMarkor) {
        map.removeLayer(trekkMarkor);
        trekkMarkor = null;
    }

    trekkPosisjon = null;
});

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
  trekkPosisjon = e.latlng

  if (trekkMarkor) map.removeLayer(trekkMarkor)

  trekkMarkor = L.marker(e.latlng).addTo(map)

  window.dispatchEvent(new CustomEvent('trekk-selected', {
    detail: {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
    },
  }))

  window.addEventListener('trekk-sheet-closed', function () {
    if (trekkMarkor) {
      map.removeLayer(trekkMarkor)
      trekkMarkor = null
    }
  })
})