'use strict';

const POI_DATA = [

    {
        id: 'beijing',
        name: 'Pechino',
        city: 'Cina — Capitale',
        category: 'city',
        coords: [39.9042, 116.4074],
        zoom: 11,
        description:
            "Capitale della Repubblica Popolare Cinese, oltre 21 milioni " +
            "di abitanti. Base logica per i monumenti imperiali (Città " +
            "Proibita, Tempio del Cielo) e per la Grande Muraglia.",
        tags: ['Capitale', 'Imperiale', 'Hub'],
        image: 'https://loremflickr.com/800/500/beijing,china?lock=1',
        bestTime: 'Apr-Mag / Set-Ott'
    },
    {
        id: 'shanghai',
        name: 'Shanghai',
        city: 'Cina — Municipalità',
        category: 'city',
        coords: [31.2304, 121.4737],
        zoom: 11,
        description:
            "Città più popolosa della Cina, cuore finanziario del Paese. " +
            "Contrasto tra il lungofiume storico (The Bund) e lo skyline " +
            "futurista di Pudong. Ottima cucina cantonese/shanghaiese.",
        tags: ['Skyline', 'Finanza', 'Cucina'],
        image: 'https://loremflickr.com/800/500/shanghai,skyline,pudong?lock=1',
        bestTime: 'Mar-Mag / Ott-Nov'
    },
    {
        id: 'seoul',
        name: 'Seul',
        city: 'Corea del Sud — Capitale',
        category: 'city',
        coords: [37.5665, 126.9780],
        zoom: 11,
        description:
            "Capitale sudcoreana, ~9,7 milioni di abitanti. Mix di " +
            "palazzi Joseon (Gyeongbokgung), quartieri commerciali " +
            "(Myeongdong, Gangnam) e cultura pop coreana.",
        tags: ['Corea', 'K-Pop', 'Cucina'],
        image: 'https://loremflickr.com/800/500/seoul,korea,skyline?lock=1',
        bestTime : 'Apr (fioritura) / Set-Ott'
    },
    {
        id: 'xian',
        name: "Xi'an",
        city: 'Cina — Shaanxi',
        category: 'city',
        coords: [34.3416, 108.9398],
        zoom: 11,
        description:
            "Antica capitale imperiale (13 dinastie), capolinea orientale " +
            "della Via della Seta. Mura Ming ancora intatte e quartiere " +
            "musulmano storico. Vicino all'Esercito di Terracotta.",
        tags: ['Via della Seta', 'Storia', 'Cucina Hui'],
        image: 'https://loremflickr.com/800/500/xian,china,bell-tower?lock=1',
        bestTime: 'Mar-Mag / Set-Nov'
    },
    {
        id: 'chengdu',
        name: 'Chengdu',
        city: 'Cina — Sichuan',
        category: 'city',
        coords: [30.5728, 104.0668],
        zoom: 11,
        description:
            "Capitale del Sichuan, sinonimo di cucina piccante e panda " +
            "giganti. Ritmo più rilassato rispetto alle megalopoli " +
            "costiere. Case da tè, vicoli e mercati.",
        tags: ['Cucina Sichuan', 'Panda', 'Slow'],
        image: 'https://loremflickr.com/800/500/chengdu,sichuan?lock=1',
        bestTime: 'Mar-Giu / Set-Nov'
    },
    {
        id: 'chongqing',
        name: 'Chongqing',
        city: 'Cina — Municipalità',
        category: 'city',
        coords: [29.4316, 106.9123],
        zoom: 11,
        description:
            "Megalopoli montuosa alla confluenza di Yangtze e Jialing. " +
            "Grattacieli, scale infinite, monorotaia che attraversa " +
            "edifici. Patria dell'hotpot piccante.",
        tags: ['Megalopoli', 'Hotpot', 'Yangtze'],
        image: 'https://loremflickr.com/800/500/chongqing,skyline,china?lock=1',
        bestTime: 'Set-Nov (estati torride)'
    },

    {
        id: 'forbidden-city',
        name: 'Città Proibita',
        city: 'Pechino',
        category: 'monument',
        coords: [39.9163, 116.3972],
        zoom: 15,
        description:
            "Complesso imperiale delle dinastie Ming e Qing, cuore " +
            "politico della Cina per quasi cinque secoli. Ospita il " +
            "Museo del Palazzo con oltre un milione di reperti.",
        tags: ['UNESCO', 'Storia', 'Architettura'],
        image: 'https://loremflickr.com/800/500/forbidden-city,beijing?lock=1',
        bestTime: 'Apr-Mag / Set-Ott'
    },
    {
        id: 'great-wall',
        name: 'Grande Muraglia',
        city: 'Cina settentrionale',
        category: 'monument',

        coords: [39.5, 111.0],
        zoom: 5,
        description:
            "Complesso di fortificazioni lungo circa 21.000 km " +
            "(considerando tutti i tratti storici), costruito e " +
            "ricostruito dal VII sec. a.C. fino alla dinastia Ming " +
            "(XIV-XVII sec.). Non è una linea continua: sono muri " +
            "paralleli, torri, forti e passi. Le sezioni sotto sono " +
            "le più significative da visitare.",
        tags: ['UNESCO', 'Ming', 'Difesa'],
        image: 'https://loremflickr.com/800/500/great-wall-of-china?lock=1',
        bestTime: 'Mag-Giu / Set-Ott',
        overlay: {

            polyline: [
                [39.9628, 119.7972], 
                [40.4297, 118.4820], 
                [40.6795, 117.2439], 
                [40.6845, 117.1660], 
                [40.4319, 116.5704], 
                [40.3564, 116.0166], 
                [40.0918, 113.2947], 
                [38.9998, 111.7028], 
                [38.2854, 109.7341], 
                [38.4872, 106.2309], 
                [37.5171, 105.1898], 
                [37.9299, 102.6407], 
                [38.9333, 100.4517], 
                [39.8018, 98.2896]   
            ],
            sections: [
                {
                    id: 'gw-shanhaiguan',
                    name: 'Shanhaiguan — Testa del Drago',
                    city: "Estremità est, sul Mar di Bohai",
                    coords: [39.9628, 119.7972],
                    zoom: 14,
                    description:
                        "Punto di partenza orientale della Muraglia Ming. " +
                        "La 'Testa del Vecchio Drago' entra per circa 22 m " +
                        "nel mare — unico tratto della Muraglia che tocca " +
                        "l'acqua.",
                    tags: ['Estremità Est', 'Costa', 'Ming'],
                    image: 'https://loremflickr.com/800/500/shanhaiguan,great-wall?lock=1',
                    hint: "L'estremo est, sul mare"
                },
                {
                    id: 'gw-jinshanling',
                    name: 'Jinshanling',
                    city: 'Provincia di Hebei',
                    coords: [40.6795, 117.2439],
                    zoom: 13,
                    description:
                        "Tra i tratti più fotogenici, con torri di guardia " +
                        "ogni ~100 m e restauri limitati che preservano " +
                        "l'aspetto originale. Trekking classico di 10 km " +
                        "fino a Simatai.",
                    tags: ['Trekking', 'Poco affollato', 'Ming'],
                    image: 'https://loremflickr.com/800/500/jinshanling,great-wall?lock=1',
                    hint: 'Il tratto più fotografato'
                },
                {
                    id: 'gw-simatai',
                    name: 'Simatai',
                    city: 'Provincia di Hebei',
                    coords: [40.6428, 117.2610],
                    zoom: 13,
                    description:
                        "Sezione impervia e solo parzialmente restaurata, " +
                        "unico tratto della Muraglia visitabile anche di " +
                        "notte. Adiacente al borgo turistico ricostruito " +
                        "di Gubei Water Town.",
                    tags: ['Selvaggio', 'Aperto di notte'],
                    image: 'https://loremflickr.com/800/500/simatai,great-wall?lock=1',
                    hint: 'Visitabile anche di notte'
                },
                {
                    id: 'gw-mutianyu',
                    name: 'Mutianyu',
                    city: 'A nord-est di Pechino',
                    coords: [40.4319, 116.5704],
                    zoom: 13,
                    description:
                        "Tratto ben restaurato, meno affollato di Badaling. " +
                        "Vegetazione boscosa, funivia in salita e slittino " +
                        "per la discesa. Ottimo compromesso tra accessibilità " +
                        "e atmosfera.",
                    tags: ['Restaurato', 'Facile accesso'],
                    image: 'https://loremflickr.com/800/500/mutianyu,great-wall?lock=1',
                    hint: 'La scelta più bilanciata'
                },
                {
                    id: 'gw-badaling',
                    name: 'Badaling',
                    city: 'A nord-ovest di Pechino',
                    coords: [40.3564, 116.0166],
                    zoom: 14,
                    description:
                        "Il tratto più famoso e più affollato, raggiungibile " +
                        "in ~30 min con treno veloce da Pechino. Restauro " +
                        "completo negli anni '50. Utile se hai poco tempo, " +
                        "ma aspettati folle.",
                    tags: ['Treno diretto', 'Affollato'],
                    image: 'https://loremflickr.com/800/500/badaling,great-wall?lock=1',
                    hint: 'Il più accessibile da Pechino'
                },
                {
                    id: 'gw-jiayuguan',
                    name: 'Forte di Jiayuguan',
                    city: 'Estremità ovest, nel Gansu',
                    coords: [39.8018, 98.2896],
                    zoom: 14,
                    description:
                        "Passo occidentale della Muraglia Ming: fortezza in " +
                        "mattoni sopra un colle, ai margini del deserto del " +
                        "Gobi. Storicamente ultimo posto di frontiera " +
                        "dell'impero verso la Via della Seta.",
                    tags: ['Estremità Ovest', 'Via della Seta', 'Deserto'],
                    image: 'https://loremflickr.com/800/500/jiayuguan,fortress?lock=1',
                    hint: "L'estremo ovest, nel deserto"
                }
            ]
        }
    },
    {
        id: 'terracotta-army',
        name: 'Esercito di Terracotta',
        city: "Xi'an",
        category: 'monument',
        coords: [34.3848, 109.2734],
        zoom: 14,
        description:
            "Mausoleo dell'imperatore Qin Shi Huang (III sec. a.C.): " +
            "oltre 8.000 statue in terracotta a grandezza naturale, " +
            "ciascuna con tratti distinti. Scoperto nel 1974 da " +
            "contadini che scavavano un pozzo.",
        tags: ['UNESCO', 'Archeologia', 'Storia'],
        image: 'https://loremflickr.com/800/500/terracotta-army,xian?lock=1',
        bestTime: 'Mar-Mag / Set-Nov'
    },

    {
        id: 'li-river',
        name: 'Fiume Li',
        city: 'Guilin — Yangshuo',
        category: 'nature',
        coords: [24.7619, 110.4859],
        zoom: 11,
        description:
            "Tratto fluviale di ~83 km tra Guilin e Yangshuo, celebre " +
            "per i pinnacoli carsici e i villaggi di pescatori. Il " +
            "paesaggio compare sul retro della banconota da 20 yuan.",
        tags: ['Natura', 'Crociera', 'Paesaggio'],
        image: 'https://loremflickr.com/800/500/li-river,guilin,karst?lock=1',
        bestTime: 'Apr-Ott'
    },
    {
        id: 'chengdu-panda',
        name: 'Base di Ricerca dei Panda',
        city: 'Chengdu',
        category: 'nature',
        coords: [30.7333, 104.1500],
        zoom: 14,
        description:
            "Centro di conservazione del panda gigante e del panda " +
            "rosso, fondato nel 1987. Su una collina boscosa a nord " +
            "di Chengdu, con recinti che riproducono l'habitat naturale.",
        tags: ['Fauna', 'Conservazione'],
        image: 'https://loremflickr.com/800/500/panda,chengdu?lock=1',
        bestTime: 'Mar-Giu (cuccioli)'
    },

    {
        id: 'peking-duck-example',
        name: "Anatra alla Pechinese (esempio)",
        city: 'Pechino',
        category: 'food',
        coords: [39.91834631837488, 116.40887272446551],
        zoom: 16,
        description:
            "Ristorante specializzato in anatra laccata alla pechinese. " +
            "Il piatto tipico è servito con crêpes sottili, cipollotto, " +
            "cetriolo e salsa hoisin. Il link Google Maps qui sotto porta " +
            "alla scheda del locale con orari, foto e recensioni aggiornate.",
        tags: ['Anatra Laccata', 'Cucina Pechinese'],
        image: 'https://loremflickr.com/800/500/peking-duck,beijing?lock=1',
        mapsUrl: 'https://maps.app.goo.gl/DX4NHXTZTTDbyu7C8',
        bestTime: 'Prenotazione consigliata'
    }
];

const CATEGORIES = [
    { key: 'all',      label: 'Tutti' },
    { key: 'city',     label: 'Città' },
    { key: 'monument', label: 'Monumenti' },
    { key: 'nature',   label: 'Natura' },
    { key: 'food',     label: 'Cibo' }
];

const map = L.map('map', {
    center: [34.5, 112.5],
    zoom: 4,
    minZoom: 3,
    maxZoom: 18,
    zoomControl: true,
    scrollWheelZoom: true,
    worldCopyJump: true
});

L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> ' +
            'contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }
).addTo(map);

const state = {
    activeCategory:  'all',
    activePoiId:     null,
    activeSectionId: null,          
    markersById:     new Map(),     
    overlayLayers:   []             
};

function buildIcon(poi) {
    const letter = poi.category.charAt(0).toUpperCase();
    return L.divIcon({
        className: 'custom-marker-wrapper',
        html: `<div class="custom-marker" data-id="${poi.id}"><span>${letter}</span></div>`,
        iconSize:   [32, 32],
        iconAnchor: [16, 32],
        popupAnchor:[0, -30]
    });
}

function createMarkers() {
    POI_DATA.forEach(poi => {
        const marker = L.marker(poi.coords, { icon: buildIcon(poi) })
            .bindPopup(
                `<strong>${escapeHtml(poi.name)}</strong>` +
                `<span>${escapeHtml(poi.city)}</span>`
            );

        marker.on('click', () => selectPoi(poi.id, { openPopup: false }));
        marker.addTo(map);
        state.markersById.set(poi.id, marker);
    });
}

const dom = {
    sidebar:           document.getElementById('sidebar'),
    sidebarClose:      document.getElementById('sidebar-close'),
    filterBar:         document.getElementById('filter-bar'),
    detailEmpty:       document.getElementById('detail-empty'),
    detailContent:     document.getElementById('detail-content'),
    detailBackBtn:     document.getElementById('detail-back-btn'),
    detailGallery:     document.getElementById('detail-gallery'),
    galleryTrack:      document.getElementById('gallery-track'),
    galleryPrev:       document.getElementById('gallery-prev'),
    galleryNext:       document.getElementById('gallery-next'),
    galleryDots:       document.getElementById('gallery-dots'),
    detailCity:        document.getElementById('detail-city'),
    detailTitle:       document.getElementById('detail-title'),
    detailTags:        document.getElementById('detail-tags'),
    detailDescription: document.getElementById('detail-description'),
    detailMeta:        document.getElementById('detail-meta'),
    mapsButton:        document.getElementById('maps-btn'),
    detailSections:    document.getElementById('detail-sections'),
    sectionList:       document.getElementById('section-list')
};

function getImagesForItem(item) {
    if (item && Array.isArray(item.images) && item.images.length > 0) {
        return item.images;
    }
    if (item && item.image) return [item.image];
    return [];
}

let galleryObserver = null;

function renderGallery(item, altName) {
    const images = getImagesForItem(item);
    const track  = dom.galleryTrack;
    const dots   = dom.galleryDots;

    if (galleryObserver) {
        galleryObserver.disconnect();
        galleryObserver = null;
    }

    if (images.length === 0) {
        track.innerHTML =
            '<div class="gallery-item is-broken">' +
                '<img alt="" src="" style="visibility:hidden">' +
            '</div>';
        dots.innerHTML = '';
        dom.detailGallery.classList.add('is-single');
        return;
    }

    track.innerHTML = images.map((url, i) => (
        `<div class="gallery-item">` +
            `<img src="${escapeHtml(url)}"` +
            ` alt="${escapeHtml(altName)} — foto ${i + 1}"` +
            ` loading="lazy"` +
            ` onerror="this.classList.add('is-broken');` +
            ` this.parentElement.classList.add('is-broken');` +
            ` this.onerror=null;" />` +
        `</div>`
    )).join('');

    if (images.length > 1) {
        dots.innerHTML = images.map((_, i) => (
            `<button class="gallery-dot ${i === 0 ? 'is-active' : ''}"` +
            ` data-index="${i}" type="button"` +
            ` aria-label="Vai a immagine ${i + 1}"></button>`
        )).join('');
    } else {
        dots.innerHTML = '';
    }

    dom.detailGallery.classList.toggle('is-single', images.length === 1);

    track.scrollLeft = 0;

    if (images.length > 1) setupGalleryObserver(track, dots);
}

function setupGalleryObserver(track, dots) {
    galleryObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const items = Array.from(track.children);
            const index = items.indexOf(entry.target);
            if (index === -1) return;
            dots.querySelectorAll('.gallery-dot').forEach((d, i) => {
                d.classList.toggle('is-active', i === index);
            });
        });
    }, {
        root: track,
        threshold: 0.6           
    });

    Array.from(track.children).forEach(item => galleryObserver.observe(item));
}

function scrollGalleryToIndex(index) {
    const item = dom.galleryTrack.children[index];
    if (!item) return;
    item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function scrollGalleryBy(delta) {
    const track = dom.galleryTrack;
    const items = Array.from(track.children);
    if (items.length === 0) return;

    const trackLeft = track.scrollLeft;
    let currentIndex = 0;
    let minDistance = Infinity;
    items.forEach((item, i) => {
        const distance = Math.abs(item.offsetLeft - trackLeft);
        if (distance < minDistance) {
            minDistance  = distance;
            currentIndex = i;
        }
    });

    const target = Math.max(0, Math.min(items.length - 1, currentIndex + delta));
    scrollGalleryToIndex(target);
}

function openSidebar() {
    dom.sidebar.classList.remove('is-closed');
}

function closeSidebar() {
    dom.sidebar.classList.add('is-closed');
    state.activePoiId     = null;
    state.activeSectionId = null;
    clearOverlay();
}

function renderDetail(poi) {
    if (!poi) {
        dom.detailEmpty.hidden   = false;
        dom.detailContent.hidden = true;
        return;
    }

    dom.detailEmpty.hidden   = true;
    dom.detailContent.hidden = false;

    dom.detailBackBtn.hidden = true;

    dom.detailContent.style.animation = 'none';

    dom.detailContent.offsetHeight; 
    dom.detailContent.style.animation = '';

    renderGallery(poi, poi.name);
    dom.detailCity.textContent  = poi.city;
    dom.detailTitle.textContent = poi.name;
    dom.detailDescription.textContent = poi.description;

    dom.detailTags.innerHTML = poi.tags
        .map(t => `<span class="tag">${escapeHtml(t)}</span>`)
        .join('');

    const catLabel = (CATEGORIES.find(c => c.key === poi.category) || {}).label
        || poi.category;
    dom.detailMeta.innerHTML =
        `<span>Categoria: ${escapeHtml(catLabel)}</span>` +
        `<span>Periodo consigliato: ${escapeHtml(poi.bestTime || '—')}</span>`;

    updateMapsButton(poi.mapsUrl);

    if (poi.overlay && poi.overlay.sections) {
        renderSectionButtons(poi.overlay.sections, null);
        dom.detailSections.hidden = false;
    } else {
        dom.detailSections.hidden = true;
        dom.sectionList.innerHTML = '';
    }
}

function renderSectionDetail(parent, section) {
    dom.detailEmpty.hidden   = true;
    dom.detailContent.hidden = false;

    dom.detailBackBtn.hidden      = false;
    dom.detailBackBtn.textContent = `← Torna a ${parent.name}`;

    dom.detailContent.style.animation = 'none';

    dom.detailContent.offsetHeight;
    dom.detailContent.style.animation = '';

    renderGallery(section, section.name);
    dom.detailCity.textContent  = section.city;
    dom.detailTitle.textContent = section.name;
    dom.detailDescription.textContent = section.description;

    dom.detailTags.innerHTML = (section.tags || [])
        .map(t => `<span class="tag">${escapeHtml(t)}</span>`)
        .join('');

    dom.detailMeta.innerHTML =
        `<span>Sezione di: ${escapeHtml(parent.name)}</span>`;

    updateMapsButton(section.mapsUrl);

    renderSectionButtons(parent.overlay.sections, section.id);
    dom.detailSections.hidden = false;
}

function updateMapsButton(url) {
    if (url) {
        dom.mapsButton.href = url;
        dom.mapsButton.hidden = false;
    } else {
        dom.mapsButton.hidden = true;
        dom.mapsButton.removeAttribute('href');
    }
}

function renderSectionButtons(sections, activeId) {
    dom.sectionList.innerHTML = sections.map(s => {
        const isActive = s.id === activeId;
        return (
            `<button class="section-btn ${isActive ? 'is-active' : ''}"` +
            ` data-section-id="${s.id}" type="button">` +
                `<span class="section-btn-name">${escapeHtml(s.name)}</span>` +
                (s.hint
                    ? `<span class="section-btn-hint">${escapeHtml(s.hint)}</span>`
                    : '') +
            `</button>`
        );
    }).join('');
}

function renderFilterBar() {
    dom.filterBar.innerHTML = CATEGORIES.map(cat => {
        const isActive = cat.key === state.activeCategory;
        return (
            `<button class="filter-btn ${isActive ? 'is-active' : ''}"` +
            ` data-category="${cat.key}" type="button">${escapeHtml(cat.label)}</button>`
        );
    }).join('');

    dom.filterBar.addEventListener('click', onFilterClick);
}

function onFilterClick(evt) {
    const btn = evt.target.closest('.filter-btn');
    if (!btn) return;
    const category = btn.dataset.category;
    if (category === state.activeCategory) return;

    state.activeCategory = category;

    dom.filterBar.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('is-active', b.dataset.category === category);
    });

    clearOverlay();
    applyCategoryFilter();
}

function applyCategoryFilter() {
    const visible    = getVisiblePois();
    const visibleIds = new Set(visible.map(p => p.id));

    POI_DATA.forEach(poi => {
        const marker = state.markersById.get(poi.id);
        if (!marker) return;

        const isOnMap = map.hasLayer(marker);
        if (visibleIds.has(poi.id) && !isOnMap)        marker.addTo(map);
        else if (!visibleIds.has(poi.id) && isOnMap)   map.removeLayer(marker);
    });

    if (state.activePoiId && !visibleIds.has(state.activePoiId)) {
        closeSidebar();
    }

    if (visible.length >= 2) {
        const bounds = L.latLngBounds(visible.map(p => p.coords));
        map.flyToBounds(bounds, { padding: [60, 60], duration: 0.9 });
    } else if (visible.length === 1) {
        map.flyTo(visible[0].coords, visible[0].zoom, { duration: 0.9 });
    }
}

function getVisiblePois() {
    if (state.activeCategory === 'all') return POI_DATA;
    return POI_DATA.filter(p => p.category === state.activeCategory);
}

function showOverlay(poi) {
    clearOverlay();
    if (!poi.overlay) return;

    if (poi.overlay.polyline && poi.overlay.polyline.length > 1) {
        const line = L.polyline(poi.overlay.polyline, {
            color:     '#c8332a',
            weight:    3.5,
            opacity:   0.85,
            lineCap:   'round',
            lineJoin:  'round'
        }).addTo(map);
        state.overlayLayers.push(line);
    }

    if (poi.overlay.sections) {
        poi.overlay.sections.forEach(sec => {
            const marker = L.circleMarker(sec.coords, {
                radius:      7,
                color:       '#c8332a',
                fillColor:   '#ffffff',
                fillOpacity: 1,
                          weight:      2.5
            })
            .bindTooltip(sec.name, {
                permanent:  false,
                direction:  'top',
                offset:     [0, -8],
                className:  'section-tooltip'
            })
            .on('click', () => selectSection(poi.id, sec.id))
            .addTo(map);

            state.overlayLayers.push(marker);
        });
    }
}

function clearOverlay() {
    state.overlayLayers.forEach(layer => map.removeLayer(layer));
    state.overlayLayers   = [];
    state.activeSectionId = null;
}

function selectPoi(poiId, opts = {}) {
    const poi = POI_DATA.find(p => p.id === poiId);
    if (!poi) return;

    state.activePoiId = poi.id;

    map.flyTo(poi.coords, poi.zoom, { duration: 1.2, easeLinearity: 0.25 });

    showOverlay(poi);

    renderDetail(poi);
    openSidebar();

    if (opts.openPopup !== false) {
        const marker = state.markersById.get(poi.id);
        if (marker && map.hasLayer(marker)) marker.openPopup();
    }
}

function selectSection(parentId, sectionId) {
    const parent = POI_DATA.find(p => p.id === parentId);
    if (!parent || !parent.overlay || !parent.overlay.sections) return;

    const section = parent.overlay.sections.find(s => s.id === sectionId);
    if (!section) return;

    state.activePoiId     = parent.id;
    state.activeSectionId = section.id;

    map.flyTo(section.coords, section.zoom, {
        duration: 1.2,
        easeLinearity: 0.25
    });

    renderSectionDetail(parent, section);
    openSidebar();
}

function onBackClick() {
    if (!state.activePoiId) return;
    const parent = POI_DATA.find(p => p.id === state.activePoiId);
    if (!parent) return;

    state.activeSectionId = null;
    map.flyTo(parent.coords, parent.zoom, { duration: 1.0 });
    renderDetail(parent);
}

function bindEvents() {

    dom.sectionList.addEventListener('click', evt => {
        const btn = evt.target.closest('.section-btn');
        if (!btn) return;
        if (!state.activePoiId) return;
        selectSection(state.activePoiId, btn.dataset.sectionId);
    });

    dom.detailBackBtn.addEventListener('click', onBackClick);

    dom.sidebarClose.addEventListener('click', closeSidebar);

    dom.galleryPrev.addEventListener('click', () => scrollGalleryBy(-1));
    dom.galleryNext.addEventListener('click', () => scrollGalleryBy(+1));

    dom.galleryDots.addEventListener('click', evt => {
        const dot = evt.target.closest('.gallery-dot');
        if (!dot) return;
        const idx = parseInt(dot.dataset.index, 10);
        if (!Number.isNaN(idx)) scrollGalleryToIndex(idx);
    });

    document.addEventListener('keydown', evt => {
        if (evt.key === 'Escape' && !dom.sidebar.classList.contains('is-closed')) {
            closeSidebar();
        }
    });
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function init() {
    createMarkers();
    renderFilterBar();
    bindEvents();
    renderDetail(null);

    const bounds = L.latLngBounds(POI_DATA.map(p => p.coords));
    map.fitBounds(bounds, { padding: [60, 60] });
}

document.addEventListener('DOMContentLoaded', init);
