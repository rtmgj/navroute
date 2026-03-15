/* ============================================================
   pages/map.js — Main Map Page (Leaflet + Routing + POI + Traffic)
   ============================================================ */

// Module-level state
let _map = null;
let _routingControl = null;
let _currentRoute = null;
let _trafficOn = false;
let _trafficPolygons = [];
let _tileLayers = {};
let _activeLayer = null;
let _poiMarkers = [];

function renderMap() {
    const T = AppState.t;
    return `
  <div class="page" id="page-map" style="padding-top:0;">
    <div class="map-layout">

      <!-- LEFT SIDEBAR -->
      <aside class="sidebar" id="sidebar">
        <button class="sidebar-toggle" id="sidebar-toggle" title="Kenar çubuğunu gizle/göster">
          <svg id="sidebar-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div class="sidebar-header">
          <div class="sidebar-title">NavRoute</div>

          <!-- Route Inputs -->
          <div class="route-inputs">
            <div class="route-input-wrapper">
              <span class="route-dot start"></span>
              <input type="text" id="origin-input" class="route-input"
                     data-i18n-ph="origin_ph" placeholder="${T.origin_ph}" autocomplete="off" />
            </div>
            <div class="route-input-wrapper">
              <span class="route-dot end"></span>
              <input type="text" id="dest-input" class="route-input"
                     data-i18n-ph="dest_ph" placeholder="${T.dest_ph}" autocomplete="off" />
            </div>
          </div>

          <div class="route-actions">
            <button class="btn-route" id="calc-route-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 8 12 12 16 14"/>
              </svg>
              <span data-i18n="calc_route">${T.calc_route}</span>
            </button>
            <button class="btn-clear" id="clear-route-btn" title="${T.clear}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="sidebar-scroll">
          <!-- Traffic Toggle -->
          <div class="traffic-row">
            <span class="traffic-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 12h8M12 8l4 4-4 4"/>
              </svg>
              <span data-i18n="traffic">${T.traffic}</span>
            </span>
            <label class="toggle-switch">
              <input type="checkbox" id="traffic-toggle" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Traffic Legend -->
          <div class="traffic-indicators" id="traffic-indicators">
            <div class="traffic-item">
              <span class="traffic-dot green"></span>
              <span data-i18n="traffic_green">${T.traffic_green}</span>
            </div>
            <div class="traffic-item">
              <span class="traffic-dot yellow"></span>
              <span data-i18n="traffic_yellow">${T.traffic_yellow}</span>
            </div>
            <div class="traffic-item">
              <span class="traffic-dot red"></span>
              <span data-i18n="traffic_red">${T.traffic_red}</span>
            </div>
          </div>

          <!-- Saved Locations -->
          <div class="section-label" data-i18n="saved_locs">${T.saved_locs}</div>
          <div class="poi-list" id="poi-list"></div>
          <button class="btn-add-poi" id="add-poi-btn" data-i18n="add_location">${T.add_location}</button>
        </div>
      </aside>

      <!-- MAP + BOTTOM PANEL -->
      <div class="map-container">
        <div id="leaflet-map"></div>

        <!-- Bottom Panel -->
        <div class="bottom-panel" id="bottom-panel">
          <div class="route-summary">
            <div class="route-stat">
              <span class="route-stat-value" id="stat-dist">—</span>
              <span class="route-stat-label" data-i18n="distance">${T.distance}</span>
            </div>
            <div class="route-stat">
              <span class="route-stat-value" id="stat-dur">—</span>
              <span class="route-stat-label" data-i18n="duration">${T.duration}</span>
            </div>
            <button class="route-save-btn" id="save-route-btn">
              <span data-i18n="save_route">${T.save_route}</span>
            </button>
          </div>
          <div class="route-steps" id="route-steps"></div>
        </div>
      </div>
    </div>

    <!-- Add POI Modal -->
    <div class="modal-overlay" id="add-poi-modal">
      <div class="modal">
        <div class="modal-header">
          <h3 data-i18n="poi_add_title">${T.poi_add_title}</h3>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label data-i18n="poi_name">${T.poi_name}</label>
            <input type="text" id="poi-name-input" class="form-input-light" 
                   data-i18n-ph="poi_name_ph" placeholder="${T.poi_name_ph}" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            <div class="form-group">
              <label data-i18n="poi_lat">${T.poi_lat}</label>
              <input type="number" id="poi-lat-input" class="form-input-light" step="0.0001" placeholder="41.0082" />
            </div>
            <div class="form-group">
              <label data-i18n="poi_lng">${T.poi_lng}</label>
              <input type="number" id="poi-lng-input" class="form-input-light" step="0.0001" placeholder="28.9784" />
            </div>
          </div>
          <div class="form-group">
            <label data-i18n="poi_cat">${T.poi_cat}</label>
            <div class="category-select" id="cat-select">
              <div class="category-opt selected" data-cat="star">
                <span>⭐</span><small>Genel</small>
              </div>
              <div class="category-opt" data-cat="restaurant">
                <span>🍽️</span><small>Restoran</small>
              </div>
              <div class="category-opt" data-cat="gas">
                <span>⛽</span><small>Benzin</small>
              </div>
              <div class="category-opt" data-cat="hospital">
                <span>🏥</span><small>Hastane</small>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="modal-cancel-btn" data-i18n="cancel">${T.cancel}</button>
          <button class="btn-primary" id="modal-add-btn" style="width:auto;padding:9px 20px;" data-i18n="add">${T.add}</button>
        </div>
      </div>
    </div>
  </div>`;
}

function initMap() {
    // ── Init Leaflet ──────────────────────────────────────────
    if (_map) { _map.remove(); _map = null; }

    _map = L.map('leaflet-map', {
        center: [39.9, 32.8],
        zoom: 6,
        zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(_map);

    // Tile layers
    _tileLayers.standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
    });

    _tileLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics',
        maxZoom: 18,
    });

    const style = AppState.mapStyle || 'standard';
    _tileLayers[style].addTo(_map);
    _activeLayer = style;

    // ── Sidebar toggle ────────────────────────────────────────
    const sidebar = document.getElementById('sidebar');
    const chevron = document.getElementById('sidebar-chevron');
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        chevron.innerHTML = sidebar.classList.contains('collapsed')
            ? '<polyline points="9 18 15 12 9 6"/>'
            : '<polyline points="15 18 9 12 15 6"/>';
        setTimeout(() => _map.invalidateSize(), 250);
    });

    // ── Traffic toggle ────────────────────────────────────────
    const trafficToggle = document.getElementById('traffic-toggle');
    const trafficIndicators = document.getElementById('traffic-indicators');

    trafficToggle.addEventListener('change', () => {
        _trafficOn = trafficToggle.checked;
        trafficIndicators.classList.toggle('visible', _trafficOn);
        if (_trafficOn) drawTrafficOverlay();
        else clearTrafficOverlay();
    });

    // ── Route calculation ─────────────────────────────────────
    document.getElementById('calc-route-btn').addEventListener('click', calculateRoute);
    document.getElementById('clear-route-btn').addEventListener('click', clearRoute);
    document.getElementById('save-route-btn').addEventListener('click', saveCurrentRoute);

    // Enter key on inputs
    ['origin-input', 'dest-input'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', e => {
            if (e.key === 'Enter') calculateRoute();
        });
    });

    // ── POI panel ─────────────────────────────────────────────
    renderPOIList();

    document.getElementById('add-poi-btn').addEventListener('click', () => {
        document.getElementById('add-poi-modal').classList.add('open');
    });

    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);

    // Category select
    document.querySelectorAll('.category-opt').forEach(opt => {
        opt.addEventListener('click', () => {
            document.querySelectorAll('.category-opt').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    document.getElementById('modal-add-btn').addEventListener('click', addPOI);

    // Click on map → fill lat/lng in modal if open
    _map.on('click', (e) => {
        const latInput = document.getElementById('poi-lat-input');
        const lngInput = document.getElementById('poi-lng-input');
        if (latInput && document.getElementById('add-poi-modal').classList.contains('open')) {
            latInput.value = e.latlng.lat.toFixed(5);
            lngInput.value = e.latlng.lng.toFixed(5);
        }
    });
}

// ── Geocoding (Nominatim) ─────────────────────────────────────
async function geocode(address) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=tr,de,gb,fr,us`;
    const res = await fetch(url, { headers: { 'Accept-Language': AppState.lang === 'TR' ? 'tr' : 'en' } });
    const data = await res.json();
    if (data && data.length > 0) {
        return L.latLng(parseFloat(data[0].lat), parseFloat(data[0].lon));
    }
    return null;
}

// ── Route Calculation ─────────────────────────────────────────
async function calculateRoute() {
    const originVal = document.getElementById('origin-input').value.trim();
    const destVal = document.getElementById('dest-input').value.trim();
    if (!originVal || !destVal) return;

    const btn = document.getElementById('calc-route-btn');
    btn.innerHTML = `<span style="opacity:.7">⏳ Hesaplanıyor…</span>`;
    btn.disabled = true;

    try {
        const [originLL, destLL] = await Promise.all([geocode(originVal), geocode(destVal)]);

        if (!originLL || !destLL) {
            showToast(AppState.t.route_failed, 'error');
            btn.innerHTML = `<span data-i18n="calc_route">${AppState.t.calc_route}</span>`;
            btn.disabled = false;
            return;
        }

        if (_routingControl) { _map.removeControl(_routingControl); _routingControl = null; }

        _routingControl = L.Routing.control({
            waypoints: [originLL, destLL],
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#3B82F6', weight: 5, opacity: 0.85 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            createMarker: function (i, wp) {
                const icon = L.divIcon({
                    html: `<div style="background:${i === 0 ? '#10B981' : '#EF4444'};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
                    className: '',
                    iconSize: [14, 14],
                    iconAnchor: [7, 7],
                });
                return L.marker(wp.latLng, { icon });
            },
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
            }),
        }).addTo(_map);

        _routingControl.on('routesfound', (e) => {
            const route = e.routes[0];
            const distKm = (route.summary.totalDistance / 1000).toFixed(1) + ' km';
            const durMin = Math.round(route.summary.totalTime / 60);
            const durStr = durMin >= 60
                ? Math.floor(durMin / 60) + ' sa ' + (durMin % 60) + ' dk'
                : durMin + ' dk';

            document.getElementById('stat-dist').textContent = distKm;
            document.getElementById('stat-dur').textContent = durStr;

            // Build steps
            const stepsEl = document.getElementById('route-steps');
            const steps = route.instructions || [];
            stepsEl.innerHTML = `<p style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;" data-i18n="steps_title">${AppState.t.steps_title}</p>` +
                steps.slice(0, 15).map((s, i) => `
          <div class="route-step">
            <span class="step-num">${i + 1}</span>
            <span>${s.text}</span>
          </div>`).join('');

            document.getElementById('bottom-panel').classList.add('visible');
            _currentRoute = { from: originVal, to: destVal, distance: distKm, duration: durStr };

            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> <span data-i18n="calc_route">${AppState.t.calc_route}</span>`;
            btn.disabled = false;
        });

        _routingControl.on('routingerror', () => {
            showToast(AppState.t.route_failed, 'error');
            btn.innerHTML = `<span data-i18n="calc_route">${AppState.t.calc_route}</span>`;
            btn.disabled = false;
        });

    } catch (err) {
        showToast(AppState.t.route_failed, 'error');
        btn.innerHTML = `<span data-i18n="calc_route">${AppState.t.calc_route}</span>`;
        btn.disabled = false;
    }
}

function clearRoute() {
    if (_routingControl) { _map.removeControl(_routingControl); _routingControl = null; }
    document.getElementById('origin-input').value = '';
    document.getElementById('dest-input').value = '';
    document.getElementById('bottom-panel').classList.remove('visible');
    _currentRoute = null;
}

function saveCurrentRoute() {
    if (!_currentRoute) return;
    AppState.saveRoute(_currentRoute);
    showToast(AppState.t.route_saved, 'success');
}

// ── Traffic Overlay ───────────────────────────────────────────
function drawTrafficOverlay() {
    const zones = [
        { latlngs: [[41.05, 28.96], [41.07, 28.99], [41.05, 29.02], [41.03, 28.99]], color: '#EF4444', label: 'Taksim–Beyoğlu' },
        { latlngs: [[41.01, 28.93], [41.03, 28.97], [41.01, 29.0], [40.99, 28.97]], color: '#F59E0B', label: 'Eminönü' },
        { latlngs: [[41.07, 29.0], [41.09, 29.03], [41.07, 29.06], [41.05, 29.03]], color: '#10B981', label: 'Beşiktaş' },
        { latlngs: [[40.98, 29.06], [41.0, 29.09], [40.98, 29.12], [40.96, 29.09]], color: '#F59E0B', label: 'Kadıköy' },
        { latlngs: [[41.1, 28.98], [41.12, 29.01], [41.1, 29.04], [41.08, 29.01]], color: '#10B981', label: 'Şişli' },
        { latlngs: [[41.04, 29.0], [41.06, 29.03], [41.04, 29.06], [41.02, 29.03]], color: '#EF4444', label: 'Üsküdar' },
    ];

    zones.forEach(z => {
        const poly = L.polygon(z.latlngs, {
            color: z.color,
            fillColor: z.color,
            fillOpacity: 0.22,
            weight: 1.5,
            opacity: 0.7,
        }).addTo(_map);
        poly.bindTooltip(z.label, { permanent: false, direction: 'center' });
        _trafficPolygons.push(poly);
    });

    // zoom to Istanbul if current view is far away
    if (_map.getZoom() < 10) {
        _map.setView([41.05, 28.98], 11, { animate: true });
    }
}

function clearTrafficOverlay() {
    _trafficPolygons.forEach(p => _map.removeLayer(p));
    _trafficPolygons = [];
}

// ── POI Panel ─────────────────────────────────────────────────
const CAT_ICONS = {
    restaurant: { emoji: '🍽️', cls: 'restaurant' },
    gas: { emoji: '⛽', cls: 'gas' },
    hospital: { emoji: '🏥', cls: 'hospital' },
    star: { emoji: '⭐', cls: 'star' },
    default: { emoji: '📍', cls: 'default' },
};

function renderPOIList() {
    const pois = AppState.getPOIs();
    const list = document.getElementById('poi-list');
    if (!list) return;

    // Clear old POI markers
    _poiMarkers.forEach(m => _map && _map.removeLayer(m));
    _poiMarkers = [];

    if (!pois.length) {
        list.innerHTML = `<p style="font-size:12px;color:rgba(255,255,255,.3);text-align:center;padding:12px 0;">Henüz konum eklenmedi</p>`;
        return;
    }

    list.innerHTML = pois.map(p => {
        const ic = CAT_ICONS[p.cat] || CAT_ICONS.default;
        return `
      <div class="poi-item" data-id="${p.id}" data-lat="${p.lat}" data-lng="${p.lng}">
        <div class="poi-icon ${ic.cls}">${ic.emoji}</div>
        <div class="poi-info">
          <div class="poi-name">${p.name}</div>
          <div class="poi-cat">${p.lat ? p.lat.toFixed(4) + ', ' + p.lng.toFixed(4) : ''}</div>
        </div>
        <button class="poi-remove" data-remove="${p.id}" title="Sil">×</button>
      </div>`;
    }).join('');

    // Add markers to map
    pois.forEach(p => {
        if (!p.lat || !p.lng) return;
        const ic = CAT_ICONS[p.cat] || CAT_ICONS.default;
        const icon = L.divIcon({
            html: `<div style="background:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid var(--accent);">${ic.emoji}</div>`,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
        });
        const marker = L.marker([p.lat, p.lng], { icon })
            .addTo(_map)
            .bindPopup(`<strong>${p.name}</strong>`);
        marker._poiId = p.id;
        _poiMarkers.push(marker);
    });

    // POI click → fly to
    list.querySelectorAll('.poi-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.poi-remove')) return;
            const lat = parseFloat(item.dataset.lat);
            const lng = parseFloat(item.dataset.lng);
            if (lat && lng) _map.setView([lat, lng], 15, { animate: true });
        });
    });

    // Remove
    list.querySelectorAll('.poi-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.remove);
            AppState.removePOI(id);
            showToast(AppState.t.poi_removed, 'info');
            renderPOIList();
        });
    });
}

function closeModal() {
    document.getElementById('add-poi-modal').classList.remove('open');
    document.getElementById('poi-name-input').value = '';
    document.getElementById('poi-lat-input').value = '';
    document.getElementById('poi-lng-input').value = '';
}

function addPOI() {
    const name = document.getElementById('poi-name-input').value.trim();
    const lat = parseFloat(document.getElementById('poi-lat-input').value);
    const lng = parseFloat(document.getElementById('poi-lng-input').value);
    const cat = document.querySelector('.category-opt.selected')?.dataset.cat || 'star';

    if (!name) { document.getElementById('poi-name-input').focus(); return; }

    AppState.savePOI({ name, lat: lat || 39.9, lng: lng || 32.8, cat });
    closeModal();
    showToast(AppState.t.poi_added, 'success');
    renderPOIList();
}
