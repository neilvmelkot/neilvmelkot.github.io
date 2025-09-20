const qs  = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => [...r.querySelectorAll(s)];
const byId = (id) => document.getElementById(id);

(() => {
  const btn = qs('.nav-toggle');
  const nav = qs('.app-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    nav.classList.toggle('open');
  });
})();

(() => {
  const modal = byId('pdf-modal');
  if (!modal) return;
  const frame = byId('pdf-frame');
  const closeBtn = qs('.modal-close', modal);
  const backdrop = qs('.modal-backdrop', modal);

  const toPreview = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('drive.google.com')) return url.replace('/view', '/preview');
    } catch {}
    return url;
  };

  function openPdf(url) {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    frame.src = toPreview(url);
  }
  function close() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    frame.src = 'about:blank';
  }
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);

  window.openPdf = openPdf;
})();

(() => {
  const docNames = [
    "LPA / Planning District Boundary",
    "Proposed Land Use Mysuru – Nanjangud Town LPA",
    "Proposed Land Use Mysuru City.pdf",
    "Proposed Land Use Nanjangud.pdf",
    "Proposed Circulation_LPA.pdf",
    "Proposed Circulation Mysuru City.pdf",
    "Zoning Map.pdf"
  ];

  const driveOrder = [
    "https://drive.google.com/file/d/1CwXegkFFHavDpVh1Ysb8I2ws6QupEEg0/view?usp=drive_link",
    "https://drive.google.com/file/d/1Y-w9i8B0oXJsoRvRpt_P0ktu8YRnmvVf/view?usp=drive_link",
    "https://drive.google.com/file/d/1hphPnTYWJK1zVG0DfYAGib_82c4BTdGm/view?usp=drive_link",
    "https://drive.google.com/file/d/1GVEnmNLQAJxI3TfV8F5ty5Esfw8Fa7jd/view?usp=drive_link",
    "https://drive.google.com/file/d/1HEj0E9BCpAAeQ0iZy2Vn6-HeekxK9LI1/view?usp=drive_link",
    "https://drive.google.com/file/d/1J8w9t9-iVsfNvnRspAPN5sykszFQIKZo/view?usp=drive_link",
    "https://drive.google.com/file/d/1C5h4iZlzSHO29Z_C9Ymap43V0kuyGVjA/view?usp=drive_link"
  ];

  window.__driveLookup = {};
  const n = Math.min(docNames.length, driveOrder.length);
  for (let i = 0; i < n; i++) window.__driveLookup[docNames[i]] = driveOrder[i];
})();

(() => {
  const toId = (u) => (u && u.match(/\/d\/([^/]+)/)?.[1]) || "";
  const thumb = (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;

  qsa('.ql-card').forEach(c => {
    const label = c.dataset.open || c.dataset.title || "";
    const url = window.__driveLookup?.[label];
    const id = toId(url);
    if (id) c.style.backgroundImage = `url('${thumb(id)}')`;

    c.addEventListener('click', (e) => {
      e.preventDefault();
      if (url) window.openPdf(url);
    });
  });
})();

(async () => {
  const mapNode = byId('mapView');
  if (!mapNode) return;

  const loader = document.createElement('div');
  loader.className = 'map-loading';
  loader.innerHTML = '<div class="crest-splash" aria-hidden="true"></div>';
  mapNode.appendChild(loader);

  const fsBtn = byId('btn-fullscreen');
  fsBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!document.fullscreenElement) mapNode.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  const [WebMap, MapView, Search] = await Promise.all([
    import('https://js.arcgis.com/4.33/@arcgis/core/WebMap.js').then(m => m.default),
    import('https://js.arcgis.com/4.33/@arcgis/core/views/MapView.js').then(m => m.default),
    import('https://js.arcgis.com/4.33/@arcgis/core/widgets/Search.js').then(m => m.default),
  ]);

  const webmap = new WebMap({ portalItem: { id: 'e9b3bb25bec84146891ea47ca2ccb4c9' } });

  const view = new MapView({
    container: mapNode,
    map: webmap,
    center: [76.64483533053024, 12.309051428276419],
    scale: 144447.638572,
    constraints: { snapToZoom: false, rotationEnabled: false },
    popup: { dockEnabled: false },
    ui: { components: ["zoom", "attribution"] } // include ONE zoom control only
  });
  view.when(() => {
    view.navigation.mouseWheelZoomEnabled = true;
    const search = new Search({ view });
    view.ui.add(search, { position: "top-right", index: 0 });
    loader.classList.add('hide');
    setTimeout(() => loader.remove(), 250);
  });
})();
