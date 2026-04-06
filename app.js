// ── Predefined species groups (order matches export_geojson.R) ────────────────
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
  metadata:    {},   // name → species_index entry
  expert:      {},   // name → expert_populations entry
  matches:     {},   // name → population_matches entry
  layers:      {},   // name → Leaflet layer
  geojsonCache:{},   // name → parsed GeoJSON
  colors:      {},
  colorIdx:    0,
  openGroups:  new Set(),
  viewMode:    'raw',   // 'raw' | 'expert'
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

// ── Map ───────────────────────────────────────────────────────────────────────
const BASEMAPS = [
  { key: 'osm',       label: '🗺 Street (OSM)',         provider: 'OpenStreetMap.Mapnik' },
  { key: 'topo',      label: '🏔 Topographic (OSM)',     provider: 'OpenTopoMap' },
  { key: 'satellite', label: '🛰 Satellite (Esri)',       provider: 'Esri.WorldImagery' },
  { key: 'natgeo',    label: '🌿 NatGeo (Esri)',          provider: 'Esri.NatGeoWorldMap' },
  { key: 'esritopo',  label: '⛰ World Topo (Esri)',      provider: 'Esri.WorldTopoMap' },
  { key: 'light',     label: '☀ Light (CartoDB)',         provider: 'CartoDB.Positron' },
  { key: 'dark',      label: '🌑 Dark (CartoDB)',          provider: 'CartoDB.DarkMatter' },
];

const map = L.map('map').setView([50.5, 4.5], 8);
let activeBasemap = L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map);
let activeKey = 'osm';

const basemapControl = L.control({ position: 'topright' });
basemapControl.onAdd = function () {
  const div = L.DomUtil.create('div', 'basemap-control');
  div.innerHTML = `
    <button class="basemap-btn" title="Change basemap">🗺 Basemap</button>
    <div class="basemap-menu hidden">
      ${BASEMAPS.map(bm =>
        `<div class="basemap-option${bm.key === 'osm' ? ' selected' : ''}"
              data-key="${bm.key}" data-provider="${bm.provider}">${bm.label}</div>`
      ).join('')}
    </div>`;
  L.DomEvent.disableClickPropagation(div);
  const btn  = div.querySelector('.basemap-btn');
  const menu = div.querySelector('.basemap-menu');
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  document.addEventListener('mousedown', e => {
    if (!div.contains(e.target)) menu.classList.add('hidden');
  });
  div.querySelectorAll('.basemap-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const key = opt.dataset.key;
      if (key === activeKey) { menu.classList.add('hidden'); return; }
      map.removeLayer(activeBasemap);
      activeBasemap = L.tileLayer.provider(opt.dataset.provider).addTo(map);
      activeBasemap.bringToBack();
      activeKey = key;
      Object.values(state.layers).forEach(l => l.bringToFront());
      div.querySelectorAll('.basemap-option').forEach(o =>
        o.classList.toggle('selected', o.dataset.key === key));
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
  div.innerHTML = '<div class="legend-title">Active species</div>'
    + '<div id="legend-items"><span class="legend-empty">None active</span></div>';
  return div;
};
legendControl.addTo(map);

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  const [idxResp, expResp, matchResp] = await Promise.allSettled([
    fetch('data/species_index.json'),
    fetch('data/expert_populations.json'),
    fetch('data/population_matches.json'),
  ]);

  if (idxResp.status === 'fulfilled' && idxResp.value.ok) {
    const idx = await idxResp.value.json();
    idx.forEach(s => { state.metadata[s.name] = s; });
  }
  if (expResp.status === 'fulfilled' && expResp.value.ok) {
    state.expert = await expResp.value.json();
  }
  if (matchResp.status === 'fulfilled' && matchResp.value.ok) {
    state.matches = await matchResp.value.json();
    // Show expert toggle only when matches file is loaded
    document.getElementById('view-toggle').classList.remove('hidden');
  }

  setupViewToggle();
  renderSidebar();
}

// ── View mode toggle ──────────────────────────────────────────────────────────
function setupViewToggle() {
  document.getElementById('btn-raw').addEventListener('click',    () => setViewMode('raw'));
  document.getElementById('btn-expert').addEventListener('click', () => setViewMode('expert'));
}

function setViewMode(mode) {
  if (mode === state.viewMode) return;
  state.viewMode = mode;
  document.getElementById('btn-raw').classList.toggle('active', mode === 'raw');
  document.getElementById('btn-expert').classList.toggle('active', mode === 'expert');

  // Re-render all active layers with new filter
  const activeNames = Object.keys(state.layers);
  activeNames.forEach(name => {
    map.removeLayer(state.layers[name]);
    delete state.layers[name];
  });
  Promise.all(activeNames.map(name => addLayer(name))).then(() => {
    renderSidebar();
    updateLegend();
  });
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
    if (query) state.openGroups.add(group.label);

    const isOpen      = state.openGroups.has(group.label);
    const activeCount = matches.filter(s => state.layers[s]).length;

    const section = document.createElement('div');
    section.className = 'accordion-group';

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

    const body = document.createElement('div');
    body.className = `accordion-body${isOpen ? ' open' : ''}`;

    matches.forEach(name => {
      const isActive = !!state.layers[name];
      const color    = state.colors[name] || null;
      const meta     = state.metadata[name];
      const exp      = state.expert[name];
      const matchData= state.matches[name];
      const ne500    = meta?.ne500 != null ? Number(meta.ne500).toFixed(2) : '—';

      // Discrepancy badge: spatial pops vs expert validated
      let badge = '';
      if (matchData && isActive) {
        const nSpatial   = matchData.n_spatial;
        const nValidated = matchData.validated_pop_ids?.length ?? nSpatial;
        if (state.viewMode === 'expert' && nSpatial !== nValidated) {
          badge = `<span class="disc-badge" title="${nValidated} validated / ${nSpatial} total">⚑ ${nValidated}/${nSpatial}</span>`;
        }
      }

      const displayName = query
        ? name.replace(new RegExp(`(${escapeRegex(query)})`, 'i'), '<mark>$1</mark>')
        : name;

      const item = document.createElement('div');
      item.className = `species-item${isActive ? ' active' : ''}`;
      item.innerHTML = `
        <span class="checkbox-wrap">
          <span class="custom-checkbox${isActive ? ' checked' : ''}"
                style="${isActive && color ? `background:${color};border-color:${color}` : ''}">
            ${isActive ? '✓' : ''}
          </span>
        </span>
        <span class="species-name"><em>${displayName}</em></span>
        ${badge}
        <span class="species-ne">${ne500}</span>
        ${isActive ? `<button class="btn-data" title="View population data">⊞</button>` : ''}`;

      item.addEventListener('click', () => toggleSpecies(name));
      if (isActive) {
        item.querySelector('.btn-data').addEventListener('click', e => {
          e.stopPropagation();
          const gj = state.geojsonCache[name];
          if (gj) openModal(name, gj, null);
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
  state.openGroups.has(label) ? state.openGroups.delete(label) : state.openGroups.add(label);
  renderSidebar();
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// ── Layer management ──────────────────────────────────────────────────────────
async function toggleSpecies(name) {
  if (state.layers[name]) { removeLayer(name); }
  else { await addLayer(name); }
  renderSidebar();
  updateLegend();
}

async function addLayer(name) {
  const color = state.colors[name] || nextColor();
  state.colors[name] = color;

  if (!state.geojsonCache[name]) {
    const fname = name.replace(/ /g, '_');
    try {
      const resp = await fetch(`geojson/${fname}.geojson`);
      if (!resp.ok) throw new Error(`Not found: ${fname}.geojson`);
      state.geojsonCache[name] = await resp.json();
    } catch (e) {
      console.error(e);
      delete state.colors[name];
      return;
    }
  }

  const geojson    = state.geojsonCache[name];
  const matchData  = state.matches[name];
  const validIds   = matchData?.validated_pop_ids
    ? new Set(matchData.validated_pop_ids)
    : null;
  const popNames   = matchData?.pop_names ?? {};

  // In expert mode, filter to validated populations only
  const features = (state.viewMode === 'expert' && validIds)
    ? geojson.features.filter(f => validIds.has(f.properties.population_id))
    : geojson.features;

  const filteredGj = { ...geojson, features };

  const layer = L.geoJSON(filteredGj, {
    style: f => {
      const pid  = f.properties.population_id;
      const isValidated = !validIds || validIds.has(pid);
      return {
        color:       color,
        fillColor:   color,
        fillOpacity: isValidated ? 0.40 : 0.10,
        weight:      isValidated ? 1.5  : 0.8,
        dashArray:   isValidated ? null : '4 3',
      };
    },
    onEachFeature: (feature, lyr) => {
      const p    = feature.properties;
      const pid  = p.population_id;
      const pName= popNames[String(pid)];
      const conf = pName?.confidence;
      const confBadge = conf
        ? `<span class="conf-${conf}">${conf === 'high' ? '✓' : '~'} ${conf}</span>`
        : '';

      const nameLabel = pName?.name
        ? `<b>${pName.name}</b> ${confBadge}<br>`
        : `Population ${pid}<br>`;

      lyr.bindTooltip(
        `<em>${p.species}</em><br>${nameLabel}`
        + `Area: <b>${p.area_km2} km²</b> · ${p.n_occurrences} occ.`,
        { sticky: true, className: 'pop-tooltip' }
      );
      lyr.on('mouseover', () => lyr.setStyle({ fillOpacity: 0.75, weight: 2.5 }));
      lyr.on('mouseout',  () => layer.resetStyle(lyr));
      lyr.on('click',     () => openModal(name, geojson, pid));
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
         </div>`).join('');
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(name, geojson, clickedId) {
  const meta      = state.metadata[name] || {};
  const matchData = state.matches[name]  || {};
  const expData   = state.expert[name]   || {};
  const popNames  = matchData.pop_names  || {};
  const validIds  = new Set(matchData.validated_pop_ids || []);
  const features  = geojson.features;

  state.modalSpecies = { name, ...meta };
  state.modalGeojson = geojson;

  document.getElementById('modal-title').textContent = name;

  const nSpatial   = features.length;
  const nValidated = validIds.size || nSpatial;
  const ne500      = meta.ne500 != null ? Number(meta.ne500).toFixed(3) : 'N/A';
  const pm         = meta.pm   != null ? Number(meta.pm).toFixed(3)    : 'N/A';

  document.getElementById('modal-tags').innerHTML = [
    meta.taxonomic_group ?? '—',
    `IUCN: ${meta.iucn ?? 'N/A'}`,
    `Ne500: ${ne500}`,
    `PM: ${pm}`,
    `Spatial: ${nSpatial} pops`,
    nValidated !== nSpatial ? `Expert: ${nValidated} validated` : '',
  ].filter(Boolean).map(t => `<span class="tag">${t}</span>`).join('');

  // Show expert discrepancy note if applicable
  const noteEl = document.getElementById('modal-note');
  if (matchData.match_method && nSpatial !== nValidated) {
    noteEl.innerHTML = `
      <span class="note-icon">ℹ</span>
      Expert validation: <b>${nValidated}</b> of ${nSpatial} polygons accepted.
      ${nSpatial - nValidated} discarded. Method: <em>${matchData.match_method}</em>.`;
    noteEl.classList.remove('hidden');
  } else {
    noteEl.classList.add('hidden');
  }

  // Table rows
  document.getElementById('modal-tbody').innerHTML = features.map(f => {
    const p      = f.properties;
    const pid    = p.population_id;
    const pInfo  = popNames[String(pid)];
    const isVal  = !validIds.size || validIds.has(pid);
    const hl     = pid === clickedId ? ' class="highlighted-row"' : '';
    const confCl = pInfo?.confidence ? ` class="conf-${pInfo.confidence}"` : '';
    const rowCl  = !isVal ? ' class="discarded-row"' : (pid === clickedId ? ' class="highlighted-row"' : '');

    return `<tr${rowCl}>
      <td>${pInfo?.name ? `<b>${pInfo.name}</b>` : `Pop. ${pid}`}</td>
      <td>${pid}</td>
      <td>${p.area_km2}</td>
      <td>${p.n_occurrences}</td>
      <td>${pInfo?.confidence
        ? `<span${confCl}>${pInfo.confidence === 'high' ? '✓ high' : '~ probable'}</span>`
        : (isVal ? '<span class="conf-auto">auto</span>' : '<span class="conf-disc">discarded</span>')}
      </td>
    </tr>`;
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
  const s         = state.modalSpecies;
  const matchData = state.matches[s.name] || {};
  const popNames  = matchData.pop_names   || {};
  const validIds  = new Set(matchData.validated_pop_ids || []);

  const header = ['species','population_id','expert_name','match_confidence',
                  'area_km2','n_occurrences','expert_validated',
                  'ne500','pm','iucn','taxonomic_group'];
  const rows = state.modalGeojson.features.map(f => {
    const p     = f.properties;
    const pid   = p.population_id;
    const pInfo = popNames[String(pid)] || {};
    const isVal = !validIds.size || validIds.has(pid);
    return [
      s.name, pid, pInfo.name ?? '', pInfo.confidence ?? '',
      p.area_km2, p.n_occurrences, isVal,
      s.ne500 ?? '', s.pm ?? '', s.iucn ?? '', s.taxonomic_group ?? ''
    ].join(',');
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
