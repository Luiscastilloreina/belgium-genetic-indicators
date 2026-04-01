// ── Predefined species groups (order matches R script) ────────────────────────
const SPECIES_GROUPS = [
  { label: 'Reptiles', species: [
    'Lacerta agilis', 'Vipera berus', 'Podarcis muralis',
    'Coronella austriaca', 'Natrix helvetica'
  ]},
  { label: 'Invertebrates', species: [
    'Aeshna isoceles', 'Calopteryx virgo', 'Coenagrion hastulatum',
    'Coenagrion lunulatum', 'Coenagrion pulchellum', 'Stylurus flavipes',
    'Leucorrhinia caudalis', 'Gomphus vulgatissimus', 'Sympetrum depressiusculum',
    'Apatura iris', 'Cyaniris semiargus', 'Erynnis tages', 'Euphydryas aurinia',
    'Euplagia quadripunctaria', 'Hesperia comma', 'Lasiommata megera',
    'Melitaea cinxia', 'Pyronia tithonus', 'Satyrium ilicis', 'Pyrgus malvae',
    'Stenobothrus stigmaticus', 'Eresus sandaliatus', 'Elater ferrugineus',
    'Vertigo angustior', 'Vertigo moulinsiana', 'Anisus vorticulus',
    'Unio crassus', 'Lucanus cervus', 'Dolomedes fimbriatus',
    'Somatochlora arctica', 'Osmoderma eremita', 'Phengaris alcon',
    'Ephippiger ephippiger', 'Hipparchia semele', 'Proserpinus proserpina',
    'Cucujus cinnaberinus', 'Leucorrhinia pectoralis'
  ]},
  { label: 'Mammals', species: [
    'Barbastella barbastellus', 'Myotis bechsteinii', 'Myotis brandtii',
    'Myotis dasycneme', 'Myotis daubentonii', 'Myotis emarginatus',
    'Myotis myotis', 'Myotis mystacinus', 'Myotis nattereri',
    'Nyctalus leisleri', 'Nyctalus noctula', 'Pipistrellus nathusii',
    'Pipistrellus pipistrellus', 'Pipistrellus pygmaeus', 'Plecotus auritus',
    'Plecotus austriacus', 'Rhinolophus ferrumequinum', 'Eptesicus serotinus',
    'Castor fiber', 'Cricetus cricetus', 'Crocidura leucodon', 'Lynx lynx',
    'Meles meles', 'Vespertilio murinus', 'Lutra lutra', 'Muscardinus avellanarius'
  ]},
  { label: 'Fish', species: [
    'Lampetra fluviatilis', 'Cobitis taenia', 'Misgurnus fossilis',
    'Petromyzon marinus', 'Lampetra planeri', 'Rhodeus sericeus',
    'Rhodeus amarus', 'Cottus rhenanus', 'Alosa fallax',
    'Anguilla anguilla', 'Salmo salar'
  ]},
  { label: 'Amphibians', species: [
    'Bufo calamita', 'Pelobates fuscus', 'Hyla arborea', 'Bombina variegata',
    'Pelophylax lessonae', 'Triturus cristatus', 'Salamandra salamandra',
    'Rana arvalis', 'Alytes obstetricans'
  ]},
  { label: 'Angiosperms', species: [
    'Apium repens', 'Bupleurum tenuissimum', 'Carex diandra', 'Carex trinervis',
    'Deschampsia setacea', 'Eriophorum gracile', 'Gentianella uliginosa',
    'Herminium monorchis', 'Juncus capitatus', 'Liparis loeselii',
    'Potamogeton acutifolius', 'Potamogeton coloratus', 'Potamogeton compressus',
    'Ranunculus ololeucos', 'Schoenoplectus pungens', 'Schoenoplectus triqueter',
    'Dactylorhiza sphagnicola', 'Orchis morio', 'Orobanche rapum-genistae',
    'Platanthera bifolia', 'Mentha pulegium', 'Orchis purpurea',
    'Scorzonera humilis', 'Wahlenbergia hederacea', 'Stratiotes aloides',
    'Atriplex pedunculata', 'Luronium natans', 'Baldellia ranunculoides'
  ]},
  { label: 'Bryophytes',      species: ['Hamatocaulis vernicosus'] },
  { label: 'Lycopodiopsida', species: ['Diphasiastrum tristachyum'] },
  { label: 'Polypodiopsida', species: ['Pilularia globulifera'] }
];

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  metadata: {},        // speciesName → { ne500, pm, iucn, n_pops_spatial, ... }
  layers: {},          // speciesName → Leaflet layer
  geojsonCache: {},    // speciesName → parsed GeoJSON
  colors: {},          // speciesName → hex color
  colorIdx: 0,
  openGroups: new Set(),
  modalSpecies: null,
  modalGeojson: null,
};

const PALETTE = [
  '#e6194b','#3cb44b','#4363d8','#f58231','#911eb4',
  '#42d4f4','#f032e6','#bfef45','#469990','#9A6324',
  '#800000','#aaffc3','#e6beff','#fffac8','#808000',
  '#ffd8b1','#000075','#a9a9a9','#ff6b6b','#4ecdc4'
];
const nextColor = () => PALETTE[state.colorIdx++ % PALETTE.length];

// ── Basemap definitions (via leaflet-providers — URLs mantenidas y verificadas)
const BASEMAPS = [
  { key: 'osm',       label: '🗺 Street (OSM)',          provider: 'OpenStreetMap.Mapnik' },
  { key: 'topo',      label: '🏔 Topographic (OSM)',      provider: 'OpenTopoMap' },
  { key: 'satellite', label: '🛰 Satellite (Esri)',        provider: 'Esri.WorldImagery' },
  { key: 'natgeo',    label: '🌿 NatGeo (Esri)',           provider: 'Esri.NatGeoWorldMap' },
  { key: 'esritopo',  label: '⛰ World Topo (Esri)',       provider: 'Esri.WorldTopoMap' },
  { key: 'light',     label: '☀ Light (CartoDB)',          provider: 'CartoDB.Positron' },
  { key: 'dark',      label: '🌑 Dark (CartoDB)',           provider: 'CartoDB.DarkMatter' },
];

// ── Map ───────────────────────────────────────────────────────────────────────
const map = L.map('map').setView([50.5, 4.5], 8);

let activeBasemap = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);
let activeKey     = 'osm';

// Basemap switcher control — event listeners attached INSIDE onAdd to avoid
// L.DomEvent.disableClickPropagation blocking document-level handlers
const basemapControl = L.control({ position: 'topright' });
basemapControl.onAdd = function () {
  const div = L.DomUtil.create('div', 'basemap-control');
  div.innerHTML = `
    <button class="basemap-btn" title="Change basemap">🗺 Basemap</button>
    <div class="basemap-menu hidden">
      ${BASEMAPS.map(bm =>
        `<div class="basemap-option${bm.key === 'osm' ? ' selected' : ''}"
              data-key="${bm.key}"
              data-provider="${bm.provider}">${bm.label}</div>`
      ).join('')}
    </div>`;

  L.DomEvent.disableClickPropagation(div);

  const btn  = div.querySelector('.basemap-btn');
  const menu = div.querySelector('.basemap-menu');

  // Toggle menu
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));

  // Close when clicking outside (mousedown avoids interference with map clicks)
  document.addEventListener('mousedown', e => {
    if (!div.contains(e.target)) menu.classList.add('hidden');
  });

  // Switch basemap
  div.querySelectorAll('.basemap-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const key      = opt.dataset.key;
      const provider = opt.dataset.provider;
      if (key === activeKey) { menu.classList.add('hidden'); return; }

      map.removeLayer(activeBasemap);
      activeBasemap = L.tileLayer.provider(provider).addTo(map);
      activeBasemap.bringToBack();
      activeKey = key;

      // Keep species layers on top
      Object.values(state.layers).forEach(l => l.bringToFront());

      // Update selected state
      div.querySelectorAll('.basemap-option').forEach(o =>
        o.classList.toggle('selected', o.dataset.key === key)
      );
      btn.textContent = BASEMAPS.find(b => b.key === key).label;
      menu.classList.add('hidden');
    });
  });

  return div;
};
basemapControl.addTo(map);

const legendControl = L.control({ position: 'bottomright' });
legendControl.onAdd = () => {
  const div = L.DomUtil.create('div', 'map-legend');
  div.innerHTML = '<div class="legend-title">Active species</div><div id="legend-items"><span class="legend-empty">None active</span></div>';
  return div;
};
legendControl.addTo(map);

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // Load metadata — optional; app works without it (layers still load from GeoJSON)
  try {
    const resp = await fetch('data/species_index.json');
    if (resp.ok) {
      const index = await resp.json();
      index.forEach(s => { state.metadata[s.name] = s; });
    }
  } catch (_) { /* metadata unavailable — continue */ }

  renderSidebar();
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function renderSidebar() {
  const query = document.getElementById('search').value.toLowerCase().trim();
  const list  = document.getElementById('species-list');
  list.innerHTML = '';

  SPECIES_GROUPS.forEach(group => {
    const matches = query
      ? group.species.filter(s => s.toLowerCase().includes(query))
      : group.species;

    if (matches.length === 0) return;

    // Auto-expand groups with search matches
    if (query && matches.length > 0) state.openGroups.add(group.label);

    const isOpen    = state.openGroups.has(group.label);
    const activeCount = matches.filter(s => state.layers[s]).length;

    const section = document.createElement('div');
    section.className = 'accordion-group';

    // Header
    const header = document.createElement('button');
    header.className = `accordion-header${isOpen ? ' open' : ''}`;
    header.innerHTML = `
      <span class="acc-label">${group.label}</span>
      <span class="acc-badges">
        ${activeCount > 0 ? `<span class="badge-active">${activeCount} on</span>` : ''}
        <span class="acc-count">${matches.length}</span>
        <span class="acc-arrow">${isOpen ? '▾' : '▸'}</span>
      </span>`;
    header.addEventListener('click', () => toggleGroup(group.label));

    // Body
    const body = document.createElement('div');
    body.className = `accordion-body${isOpen ? ' open' : ''}`;

    matches.forEach(name => {
      const isActive = !!state.layers[name];
      const color    = state.colors[name] || null;
      const meta     = state.metadata[name];
      const ne500    = meta?.ne500 != null ? meta.ne500.toFixed(2) : '—';

      const item = document.createElement('div');
      item.className = `species-item${isActive ? ' active' : ''}`;

      // Highlight search match
      const displayName = query
        ? name.replace(new RegExp(`(${escapeRegex(query)})`, 'i'),
            '<mark>$1</mark>')
        : name;

      item.innerHTML = `
        <span class="checkbox-wrap">
          <span class="custom-checkbox${isActive ? ' checked' : ''}"
                style="${isActive && color ? `background:${color};border-color:${color}` : ''}">
            ${isActive ? '✓' : ''}
          </span>
        </span>
        <span class="species-name"><em>${displayName}</em></span>
        <span class="species-ne">${ne500}</span>
        ${isActive ? `<button class="btn-data" title="View population data">⊞</button>` : ''}`;

      item.addEventListener('click', () => toggleSpecies(name));

      if (isActive) {
        item.querySelector('.btn-data').addEventListener('click', e => {
          e.stopPropagation();
          const geojson = state.geojsonCache[name];
          if (geojson) openModal(name, geojson, null);
        });
      }

      body.appendChild(item);
    });

    section.appendChild(header);
    section.appendChild(body);
    list.appendChild(section);
  });
}

function toggleGroup(label) {
  if (state.openGroups.has(label)) {
    state.openGroups.delete(label);
  } else {
    state.openGroups.add(label);
  }
  renderSidebar();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Layer toggle ──────────────────────────────────────────────────────────────
async function toggleSpecies(name) {
  if (state.layers[name]) {
    removeLayer(name);
  } else {
    await addLayer(name);
  }
  renderSidebar();
  updateLegend();
}

async function addLayer(name) {
  const color = nextColor();
  state.colors[name] = color;

  if (!state.geojsonCache[name]) {
    const fname = name.replace(/ /g, '_');
    try {
      const resp = await fetch(`geojson/${fname}.geojson`);
      if (!resp.ok) throw new Error(`GeoJSON not found: ${fname}.geojson`);
      state.geojsonCache[name] = await resp.json();
    } catch (e) {
      console.error(e);
      delete state.colors[name];
      return;
    }
  }

  const geojson = state.geojsonCache[name];

  const layer = L.geoJSON(geojson, {
    style: { color, fillColor: color, fillOpacity: 0.40, weight: 1.5 },
    onEachFeature: (feature, lyr) => {
      const p = feature.properties;
      lyr.bindTooltip(
        `<b><em>${p.species}</em></b><br>
         Population ${p.population_id} &nbsp;·&nbsp; ${p.area_ha} ha<br>
         Occurrences: ${p.n_occurrences}`,
        { sticky: true, className: 'pop-tooltip' }
      );
      lyr.on('mouseover', () => lyr.setStyle({ fillOpacity: 0.70, weight: 2.5 }));
      lyr.on('mouseout',  () => layer.resetStyle(lyr));
      lyr.on('click',     () => openModal(name, geojson, p.population_id));
    }
  }).addTo(map);

  state.layers[name] = layer;
}

function removeLayer(name) {
  map.removeLayer(state.layers[name]);
  delete state.layers[name];
  delete state.colors[name];
}

// ── Legend ────────────────────────────────────────────────────────────────────
function updateLegend() {
  const items   = document.getElementById('legend-items');
  const entries = Object.entries(state.colors);
  items.innerHTML = entries.length === 0
    ? '<span class="legend-empty">None active</span>'
    : entries.map(([name, color]) =>
        `<div class="legend-row">
           <span class="legend-dot" style="background:${color}"></span>
           <em>${name}</em>
         </div>`
      ).join('');
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(name, geojson, clickedId) {
  const meta     = state.metadata[name] || {};
  const features = geojson.features;

  state.modalSpecies = { name, ...meta };
  state.modalGeojson = geojson;

  document.getElementById('modal-title').textContent = name;
  document.getElementById('modal-tags').innerHTML = [
    meta.taxonomic_group ?? '—',
    `IUCN: ${meta.iucn ?? 'N/A'}`,
    `Ne500: ${meta.ne500 != null ? Number(meta.ne500).toFixed(3) : 'N/A'}`,
    `PM: ${meta.pm != null ? Number(meta.pm).toFixed(3) : 'N/A'}`,
    `${features.length} populations`
  ].map(t => `<span class="tag">${t}</span>`).join('');

  document.getElementById('modal-tbody').innerHTML = features.map(f => {
    const p  = f.properties;
    const hl = p.population_id === clickedId ? ' class="highlighted-row"' : '';
    return `<tr${hl}><td>${p.population_id}</td><td>${p.area_ha}</td><td>${p.n_occurrences}</td></tr>`;
  }).join('');

  document.getElementById('modal-count').textContent =
    `${features.length} population${features.length !== 1 ? 's' : ''}`;

  document.getElementById('modal-overlay').classList.remove('hidden');
}

const closeModal = () => document.getElementById('modal-overlay').classList.add('hidden');
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target.id === 'modal-overlay') closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── CSV download ──────────────────────────────────────────────────────────────
document.getElementById('btn-download').addEventListener('click', () => {
  if (!state.modalSpecies || !state.modalGeojson) return;
  const s = state.modalSpecies;
  const header = ['species','population_id','area_ha','n_occurrences',
                  'ne500','pm','iucn','taxonomic_group'];
  const rows = state.modalGeojson.features.map(f => {
    const p = f.properties;
    return [s.name, p.population_id, p.area_ha, p.n_occurrences,
            s.ne500 ?? '', s.pm ?? '', s.iucn ?? '', s.taxonomic_group ?? ''].join(',');
  });
  const blob = new Blob([[header.join(','), ...rows].join('\n')],
    { type: 'text/csv;charset=utf-8;' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `${s.name.replace(/ /g, '_')}_populations.csv`
  });
  a.click();
});

// ── Search ────────────────────────────────────────────────────────────────────
document.getElementById('search').addEventListener('input', renderSidebar);

// ── Start ─────────────────────────────────────────────────────────────────────
init();
