/* ================================================================
   app.js — Viaggio in Cina (Trip Planner)
   ----------------------------------------------------------------
   Struttura del file:
     1) POI_DATA               array dei luoghi (con overlay/sezioni)
     2) CATEGORIES             tassonomia gerarchica dei filtri
     3) Utilities               findCategoryByKey, getCategoryLabel
     4) Inizializzazione mappa  Leaflet + tile CartoDB
     5) Stato applicativo       state
     6) Marker principali       buildIcon, createMarkers
     7) DOM cache               riferimenti agli elementi statici
     8) Galleria immagini       carousel scroll-snap, IntersectionObserver
     9) Sidebar open/close      + calcolo --sidebar-reserved
    10) Rendering dettaglio     renderDetail / renderSectionDetail
    11) Filtri (primary + sub)  openSubBar, closeSubBar, updateFilterBarActive
    12) Overlay Grande Muraglia polyline + marker sezioni
    13) Selezione POI/sezione   selectPoi, selectSection, onBackClick
    14) Bottom sheet mobile     initSheetDrag
    15) Event binding & bootstrap
   ================================================================ */

'use strict';

/* ------------------------------------------------------------------
   1) DATASET DEI POI
   ------------------------------------------------------------------
   Coordinate in [lat, lng] (formato Leaflet, NON GeoJSON puro).
   Campi obbligatori: id, name, city, category, coords, zoom,
   description, tags, image.
   Campi opzionali (mostrati in sidebar solo se presenti):
     bestTime, mapsUrl, checkIn/checkOut (hotel),
     iata (aeroporti), lines (stazioni), rating.
   Un POI può avere `overlay` con `polyline` e/o `sections`
   (usato dalla Grande Muraglia).
------------------------------------------------------------------ */
const POI_DATA = [

    /* ------------------------------------------------------------------
                                ---PECHINO---
     ------------------------------------------------------------------*/
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
        tags: ['Città', 'Capitale', 'Imperiale', 'Hub'],
        image: 'https://loremflickr.com/800/500/beijing,china?lock=1',
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
        tags: ['Monumento', 'UNESCO', 'Storia', 'Architettura'],
        image: 'https://loremflickr.com/800/500/forbidden-city,beijing?lock=1',
        bestTime: 'Apr-Mag / Set-Ott',
        openingDays: 'Mar-Dom 8:30-17:00',
        priceLevel: 2
    },
    {
        id: 'wangfujing-example',
        name: 'Wangfujing Street',
        city: 'Pechino — Dongcheng',
        category: 'shopping',
        coords: [39.9127, 116.4103],
        zoom: 16,
        description:
            "Principale via commerciale pedonale di Pechino. Grandi " +
            "magazzini (APM, Dongan Plaza), Snack Street con street food, " +
            "librerie internazionali. Ottima per una serata a piedi.",
        tags: ['Shopping', 'Pedonale', 'Snack Street', 'Turistico'],
        image: 'https://loremflickr.com/800/500/wangfujing,beijing,street?lock=1'
    },
    {
        id: 'hotel-example',
        name: 'Rosewood Beijing',
        city: 'Pechino — CBD',
        category: 'hotel',
        coords: [39.9264, 116.4534],
        zoom: 16,
        description:
            "Hotel 5 stelle nel quartiere finanziario di Pechino. " +
            "283 camere, spa, ristorante fine dining. Base comoda per " +
            "muoversi verso i monumenti imperiali con la metro.",
        tags: ['Hotel', '5 stelle', 'CBD', 'Lusso'],
        image: 'https://loremflickr.com/800/500/hotel,luxury,beijing?lock=1',
        checkIn: 'Dal 15:00',
        checkOut: 'Fino a 12:00'
    },
    {
        id: 'pek-airport',
        name: 'Aeroporto Internazionale Capital',
        city: 'Pechino — PEK',
        category: 'airport',
        coords: [40.0801, 116.5846],
        zoom: 12,
        description:
            "Principale aeroporto di Pechino, hub di Air China. " +
            "Tre terminal (T1/T2/T3). Airport Express in metro fino al " +
            "centro in ~25 min, taxi ~45 min.",
        tags: ['Aeroporto', 'Hub', 'Air China'],
        image: 'https://loremflickr.com/800/500/airport,beijing,pek?lock=1',
        iata: 'PEK',
        openingDays: 'Aperto 24/7'
    },
    {
        id: 'beijing-south-station',
        name: 'Stazione di Pechino Sud',
        city: 'Beijingnan Zhan',
        category: 'station',
        coords: [39.8654, 116.3785],
        zoom: 15,
        description:
            "Terminal high-speed a sud di Pechino. Treni CRH per " +
            "Shanghai (~4h30), Tianjin (~30 min), Nanjing (~3h30). " +
            "Servita dalle linee metro 4, 14 e 16.",
        tags: ['Stazione', 'CRH', 'High-Speed'],
        image: 'https://loremflickr.com/800/500/train-station,beijing?lock=1',
        lines: 'CRH · Beijing-Shanghai HSR',
        openingDays: 'Aperto 24/7'
    },

    /*=======================   CIBO+ PEK =============================*/
    {
        id: 'peking-duck-example',
        name: "Anatra alla Pechinese",
        city: 'Pechino',
        category: 'food',
        coords: [39.91834631837488, 116.40887272446551],
        zoom: 16,
        description:
            "Ristorante specializzato in anatra laccata alla pechinese. " +
            "Il piatto tipico è servito con crêpes sottili, cipollotto, " +
            "cetriolo e salsa hoisin. Il link Google Maps qui sotto porta " +
            "alla scheda del locale con orari, foto e recensioni aggiornate.",
        tags: ['Cibo', 'Anatra Laccata', 'Cucina Pechinese'],
        image: 'https://loremflickr.com/800/500/peking-duck,beijing?lock=1',
        mapsUrl: 'https://maps.app.goo.gl/DX4NHXTZTTDbyu7C8',
        bestTime: 'Prenotazione consigliata'
    },




    /* ------------------------------------------------------------------
                            ---SHANGHAI---
 ------------------------------------------------------------------*/
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
        tags: ['Città', 'Skyline', 'Finanza', 'Cucina'],
        image: 'https://loremflickr.com/800/500/shanghai,skyline,pudong?lock=1',
    },
    {
        id: 'SHA-bund',
        name: 'The Bund',
        city: 'Shanghai',
        category: 'monument',
        coords: [31.240444860520714, 121.49056728206448],
        zoom: 14,
        description:
            "Il Bund (Wàitān, 'Riva Esterna') è il celebre viale pedonale " +
            "sul lungofiume, sponda ovest dello Huangpu. 1,5 km lungo " +
            "Zhongshan Road, con oltre 50 edifici storici in stile coloniale " +
            "europeo (neoclassico, gotico, Art Déco dell'epoca delle " +
            "Concessioni) contrapposti allo skyline futuristico di Lujiazui " +
            "(Pudong) sulla sponda opposta. Uno dei simboli più iconici di " +
            "Shanghai.",
        tags: ['Monumento', 'Lungofiume', 'Skyline', 'Stili misti'],
        images: [
            'https://upload.wikimedia.org/wikipedia/commons/6/64/The_Bund_at_Night.png',
            'https://upload.wikimedia.org/wikipedia/commons/b/bc/The_Bund_at_night.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/4/4f/The_Bund%2C_Shanghai%2C_1.jpg'
        ],
        mapsUrl: 'https://maps.app.goo.gl/D2CR392UTzYdisNy5',
        openingDays: 'Aperto 24/7',
        customMeta: [
            { label: 'Meglio visitare', value: 'Di sera con le luci accese' }
        ]
    },
    {
        id: 'yu-garden',
        name: 'Yu Garden',
        city: 'Shanghai',
        category: 'nature',
        coords: [31.22727060429105, 121.49209830614264],
        zoom: 15,
        description:
            "Il Giardino del Mandarino Yu (Yuyuan) è un celebre giardino " +
            "classico cinese del XVI secolo, dinastia Ming. Due ettari " +
            "nel cuore della Old City di Shanghai, con padiglioni storici, " +
            "laghetti con carpe koi e formazioni rocciose. Uno degli esempi " +
            "più raffinati di architettura tradizionale cinese.",
        tags: ['Natura', 'Giardino', 'Ming', 'Old City'],
        images: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Shanghai_-_Yu_Garden_-_0035.jpg/800px-Shanghai_-_Yu_Garden_-_0035.jpg'
        ],
        mapsUrl: 'https://maps.app.goo.gl/ZXK5fRwXx5g1bYyg8',
        openingDays: 'Mar-Dom 9:00-16:00',
        customMeta: [
            { label: 'Biglietto', value: '30-40 ¥ (~5 €)' }
        ]
    },
    {
        id: 'yuyuan-old-street',
        name: 'Yuyuan Old Street',
        city: 'Shanghai',
        category: 'shopping',
        coords: [31.227419141089115, 121.49138720742127],
        zoom: 15,
        description:
            "Vivace quartiere commerciale e storico nell'Old City di " +
            "Shanghai, adiacente allo Yu Garden. Architettura Ming e Qing " +
            "con facciate in legno intagliato, tetti spioventi, lanterne " +
            "rosse. Si sviluppa attorno al ponte a zig-zag Jiu Qu Qiao. " +
            "Street food (in particolare xiaolongbao), sale da tè storiche " +
            "e botteghe di artigianato tradizionale.",
        tags: ['Shopping', 'Street', 'Street food', 'Souvenir', 'Artigiani'],
        images: [
            'https://upload.wikimedia.org/wikipedia/commons/2/29/Yuyuan_street_%283989857894%29.jpg'
        ],
        mapsUrl: 'https://maps.app.goo.gl/KGqqXPQHGch9Bykw7',
        openingDays: 'Aperto 24/7',
        rating: 3,
        customMeta: [
            { label: 'Negozi',          value: '~8:30-22:30' },
            { label: 'Meglio visitare', value: 'Di sera con le luci accese' }
        ]
    },



    /*=======================   CIBO+ SHA =============================*/







    /* ------------------------------------------------------------------
                            ---SEUL---
 ------------------------------------------------------------------*/
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
        tags: ['Città', 'Corea', 'K-Pop', 'Cucina'],
        image: 'https://loremflickr.com/800/500/seoul,korea,skyline?lock=1',
    },



    /*=======================   CIBO+ SEUL =============================*/




    /* ------------------------------------------------------------------
                            ---XI'AN---
 ------------------------------------------------------------------*/
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
        tags: ['Città', 'Via della Seta', 'Storia', 'Cucina Hui'],
        image: 'https://loremflickr.com/800/500/xian,china,bell-tower?lock=1',
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
        tags: ['Monumento', 'UNESCO', 'Archeologia', 'Storia'],
        image: 'https://loremflickr.com/800/500/terracotta-army,xian?lock=1',
        bestTime: 'Mar-Mag / Set-Nov',
        openingDays: 'Ogni giorno 8:30-17:30',
        priceLevel: 3
    },


    /*=======================   CIBO+ XI'AN   =============================*/




    /* ------------------------------------------------------------------
                            ---CHENGDU---
 ------------------------------------------------------------------*/
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
        tags: ['Città', 'Cucina Sichuan', 'Panda', 'Slow'],
        image: 'https://loremflickr.com/800/500/chengdu,sichuan?lock=1',
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
        tags: ['Natura', 'Fauna', 'Conservazione'],
        image: 'https://loremflickr.com/800/500/panda,chengdu?lock=1',
        openingDays: 'Ogni giorno 7:30-18:00',
        priceLevel: 2,
    },



    /*=======================   CIBO+ CHEN =============================*/



    /* ------------------------------------------------------------------
                            ---CHONGQING---
 ------------------------------------------------------------------*/
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
        tags: ['Città', 'Megalopoli', 'Hotpot', 'Yangtze'],
        image: 'https://loremflickr.com/800/500/chongqing,skyline,china?lock=1',
    },

    /*=======================   CIBO+ CHON =============================*/




    /* ------------------------------------------------------------------
                            ---ALTRO---
 ------------------------------------------------------------------*/
    {
        id: 'great-wall',
        name: 'Grande Muraglia',
        city: 'Cina settentrionale',
        category: 'monument',

        coords: [39.5, 111.0],
        zoom: 5.8,
        description:
            "Complesso di fortificazioni lungo circa 21.000 km " +
            "(considerando tutti i tratti storici), costruito e " +
            "ricostruito dal VII sec. a.C. fino alla dinastia Ming " +
            "(XIV-XVII sec.). Non è una linea continua: sono muri " +
            "paralleli, torri, forti e passi. Le sezioni sotto sono " +
            "le più significative da visitare.",
        tags: ['Monumento', 'UNESCO', 'Ming', 'Difesa'],
        image: 'https://loremflickr.com/800/500/great-wall-of-china?lock=1',
        bestTime: 'Mag-Giu / Set-Ott',
        openingDays: 'Ogni giorno (varia per sezione)',
        priceLevel: 2,
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
                    tags: ['Muraglia', 'Estremità Est', 'Costa', 'Ming'],
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
                    tags: ['Muraglia', 'Trekking', 'Poco affollato', 'Ming'],
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
                    tags: ['Muraglia', 'Selvaggio', 'Aperto di notte'],
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
                    tags: ['Muraglia', 'Restaurato', 'Facile accesso'],
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
                    tags: ['Muraglia', 'Treno diretto', 'Affollato'],
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
                    tags: ['Muraglia', 'Estremità Ovest', 'Via della Seta', 'Deserto'],
                    image: 'https://loremflickr.com/800/500/jiayuguan,fortress?lock=1',
                    hint: "L'estremo ovest, nel deserto"
                }
            ]
        }
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
];

/* ------------------------------------------------------------------
   2) TASSONOMIA CATEGORIE
   ------------------------------------------------------------------
   Struttura gerarchica: elementi top-level appaiono nella primary
   bar. Quelli con `sub` sono espandibili (aprono la sub-bar).
   'esperienze' e 'services' NON sono categorie di POI (nessun POI
   ha `category: 'esperienze'`), sono contenitori visivi. Le key
   foglia ('food', 'hotel', ecc.) sono quelle usate nei POI.
------------------------------------------------------------------ */
const CATEGORIES = [
    { key: 'all',      label: 'Tutti' },
    { key: 'city',     label: 'Città' },
    { key: 'monument', label: 'Monumenti' },
    { key: 'nature',   label: 'Natura' },
    { key: 'esperienze', label: 'Esperienze', sub: [
        { key: 'food',     label: 'Cibo' },
        { key: 'shopping', label: 'Shopping' },
        { key: 'activity', label: 'Attività' }
    ]},
    { key: 'services', label: 'Servizi', sub: [
        { key: 'hotel',   label: 'Hotel' },
        { key: 'station', label: 'Stazioni' },
        { key: 'airport', label: 'Aeroporti' }
    ]}
];

/* Colore di sfondo del marker per ogni categoria.
   Cambia qui il valore hex per rifare il colore di una categoria. */
const CATEGORY_MARKER_COLOR = {
    city:     '#4a5aa8',   /* indaco urbano  */
    monument: '#c8332a',   /* rosso cinabro  */
    nature:   '#3d8f4d',   /* verde bosco    */
    food:     '#d68a2e',   /* arancione caldo*/
    shopping: '#b846a0',   /* magenta        */
    activity: '#d4a635',   /* giallo oro     */
    hotel:    '#2f9990',   /* teal           */
    station:  '#6b6a63',   /* grigio scuro   */
    airport:  '#3a8fc9'    /* celeste cielo  */
};


/* Icone SVG del marker (viewBox 24x24, Lucide-style).
   Ogni valore è la sequenza di elementi figli dentro il tag <svg>.
   Sostituisci la stringa per cambiare l'icona di una categoria: copia
   il markup interno dell'icona che vuoi da lucide.dev o da qualunque
   set SVG con viewBox 24x24 e stroke-based. */
const CATEGORY_MARKER_ICON = {
    city:
        '<rect width="16" height="20" x="4" y="2" rx="2"/>' +
        '<path d="M9 22v-4h6v4"/>' +
        '<path d="M8 6h.01"/><path d="M12 6h.01"/><path d="M16 6h.01"/>' +
        '<path d="M8 10h.01"/><path d="M12 10h.01"/><path d="M16 10h.01"/>' +
        '<path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
    monument:
        '<line x1="3" y1="22" x2="21" y2="22"/>' +
        '<line x1="6" y1="18" x2="6" y2="11"/>' +
        '<line x1="10" y1="18" x2="10" y2="11"/>' +
        '<line x1="14" y1="18" x2="14" y2="11"/>' +
        '<line x1="18" y1="18" x2="18" y2="11"/>' +
        '<polygon points="12 2 20 7 4 7"/>',
    nature:
        '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14' +
        'h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7' +
        'H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/>' +
        '<path d="M12 22v-3"/>',
    food:
        '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>' +
        '<path d="M7 2v20"/>' +
        '<path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
    shopping:
        '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>' +
        '<path d="M3 6h18"/>' +
        '<path d="M16 10a4 4 0 0 1-8 0"/>',
    activity:
        '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02' +
        ' 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/>',
    hotel:
        '<path d="M2 4v16"/>' +
        '<path d="M2 8h18a2 2 0 0 1 2 2v10"/>' +
        '<path d="M2 17h20"/>' +
        '<path d="M6 8v9"/>',
    station:
        '<path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/>' +
        '<path d="M9 15L8 14"/><path d="M15 15l1-1"/>' +
        '<path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/>' +
        '<path d="m8 19-2 3"/><path d="m16 19 2 3"/>',
    airport:
        '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5' +
        'L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3' +
        'H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>'
};

/* ------------------------------------------------------------------
   3) UTILITY per la tassonomia
------------------------------------------------------------------ */

/** Ricerca ricorsiva della categoria (top-level o sub) per la sua key. */
function findCategoryByKey(key) {
    for (const c of CATEGORIES) {
        if (c.key === key) return c;
        if (c.sub) for (const s of c.sub) if (s.key === key) return s;
    }
    return null;
}

function getCategoryLabel(key) {
    const c = findCategoryByKey(key);
    return c ? c.label : key;
}

/* ------------------------------------------------------------------
   4) INIZIALIZZAZIONE MAPPA LEAFLET
   ------------------------------------------------------------------
   Tile server: CartoDB Voyager (stile pulito, gratis).
   zoomControl: false = nasconde i bottoni +/- (zoom via rotella/pinch).
   worldCopyJump: true = pan continuo attraverso il meridiano 180°.
------------------------------------------------------------------ */
const map = L.map('map', {
    center: [34.5, 112.5],
    zoom: 4,
    minZoom: 3,
    maxZoom: 18,
    zoomControl: false,
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

/* ------------------------------------------------------------------
   5) STATO APPLICATIVO
------------------------------------------------------------------ */
const state = {
    activeCategory:  'all',      // 'all' | primary key | parent key | sub key
    activePoiId:     null,       // id del POI attualmente aperto
    activeSectionId: null,       // id sezione Muraglia (se in modalità sezione)
    markersById:     new Map(),  // id-POI -> istanza L.Marker
    overlayLayers:   []          // polilinea + marker sezioni della Muraglia
};

/* ------------------------------------------------------------------
   6) MARKER PRINCIPALI
   ------------------------------------------------------------------
   Uso L.divIcon (marker HTML/CSS custom) invece delle icone raster
   di default: permette styling via CSS e transizioni.
------------------------------------------------------------------ */
function buildIcon(poi) {
    const iconPath = CATEGORY_MARKER_ICON[poi.category] || '';
    const bgColor  = CATEGORY_MARKER_COLOR[poi.category] || '#c8332a';
    const svg =
        `<svg class="marker-icon" viewBox="0 0 24 24" fill="none"` +
        ` stroke="currentColor" stroke-width="2.4"` +
        ` stroke-linecap="round" stroke-linejoin="round">${iconPath}</svg>`;
    return L.divIcon({
        className: 'custom-marker-wrapper',
        html: `<div class="custom-marker" data-id="${poi.id}"` +
              ` style="--marker-bg:${bgColor}">${svg}</div>`,
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

/* ------------------------------------------------------------------
   7) DOM CACHE
   ------------------------------------------------------------------
   Riferimenti risolti una volta sola all'init, evitano querySelector
   ripetuti nel codice caldo (rendering della sidebar a ogni click).
------------------------------------------------------------------ */
const dom = {
    sidebar:           document.getElementById('sidebar'),
    sidebarClose:      document.getElementById('sidebar-close'),
    sidebarHandle:     document.getElementById('sidebar-handle'),
    filterBar:         document.getElementById('filter-bar'),
    subBar:            document.getElementById('sub-bar'),
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
    sectionList:       document.getElementById('section-list'),

    /* Modale "Calcola distanza" */
    distBtn:           document.getElementById('dist-btn'),
    distModal:         document.getElementById('dist-modal'),
    distBackdrop:      document.getElementById('dist-modal-backdrop'),
    distClose:         document.getElementById('dist-modal-close'),
    distFrom:          document.getElementById('dist-from'),
    distCat:           document.getElementById('dist-cat'),
    distPoi:           document.getElementById('dist-poi'),
    distModes:         document.getElementById('dist-result') ? document : null,
    distKm:            document.getElementById('dist-km'),
    distTime:          document.getElementById('dist-time')
};

/* distModes hack sopra è per fallback quando l'elemento non esiste
   sulla home / il-file. Sovrascriviamo con il container reale. */
dom.distModes = document.querySelector('.dist-modes');

/* ------------------------------------------------------------------
   8) GALLERIA IMMAGINI
   ------------------------------------------------------------------
   Carousel orizzontale con scroll-snap nativo del browser. Nessuna
   libreria esterna. Il tracking dell'immagine attiva è fatto via
   IntersectionObserver: quando >=60% di un'immagine è visibile,
   il pallino corrispondente si evidenzia.
   Accetta sia schema legacy (image: 'url') sia nuovo (images: [...]).
------------------------------------------------------------------ */

/** Restituisce sempre un array di URL, anche se il POI ha un singolo `image`. */
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

/* ------------------------------------------------------------------
   9) LAYOUT DINAMICO E ANIMAZIONI DELLA MAPPA
   ------------------------------------------------------------------
   Sotto i 900px la sidebar diventa un bottom sheet: cambia sia il
   layout della sidebar sia il modo in cui la mappa "vola" verso
   un POI (offset verticale per non nascondere il marker).
------------------------------------------------------------------ */

function isMobileViewport() {
    return window.matchMedia('(max-width: 900px)').matches;
}

/**
 * Sostituisce map.flyTo. Su mobile, il centro della mappa viene
 * spostato in basso di ~metà dell'altezza della sidebar, così il
 * marker rimane visibile sopra il bottom sheet aperto.
 */
function flyToPoi(coords, zoom, opts = {}) {
    if (!isMobileViewport()) {
        map.flyTo(coords, zoom, opts);
        return;
    }
    const sidebarClosed = dom.sidebar.classList.contains('is-closed');
    const sidebarHeight = sidebarClosed
        ? window.innerHeight * 0.40
        : dom.sidebar.getBoundingClientRect().height;
    const offsetPx = sidebarHeight / 2;
    const point = map.project(coords, zoom);
    const shifted = L.point(point.x, point.y + offsetPx);
    const target = map.unproject(shifted, zoom);
    map.flyTo(target, zoom, opts);
}

/**
 * Configura il drag della sidebar mobile (bottom sheet).
 * Tre stati snap: collapsed (40vh), mid (65vh), expanded (92vh).
 * Solo attivo sotto i 900px di viewport.
 */
function initSheetDrag() {
    const handle = dom.sidebarHandle;
    const sidebar = dom.sidebar;
    if (!handle || !sidebar) return;

    let startY = 0;
    let startHeight = 0;
    let dragging = false;

    function onStart(clientY) {
        if (!isMobileViewport()) return;
        if (sidebar.classList.contains('is-closed')) return;
        dragging = true;
        startY = clientY;
        startHeight = sidebar.getBoundingClientRect().height;
        sidebar.classList.add('is-dragging');
    }

    function onMove(clientY) {
        if (!dragging) return;
        const deltaY = startY - clientY;
        const newHeight = startHeight + deltaY;
        const vh = window.innerHeight;
        const clamped = Math.max(vh * 0.20, Math.min(vh * 0.92, newHeight));
        sidebar.style.height = clamped + 'px';
    }

    function onEnd() {
        if (!dragging) return;
        dragging = false;
        sidebar.classList.remove('is-dragging');

        const currentHeight = sidebar.getBoundingClientRect().height;
        const vh = window.innerHeight;
        sidebar.style.height = '';
        sidebar.classList.remove('sheet-mid', 'sheet-expanded');

        const dCollapsed = Math.abs(currentHeight - vh * 0.40);
        const dMid       = Math.abs(currentHeight - vh * 0.65);
        const dExpanded  = Math.abs(currentHeight - vh * 0.92);

        if (dMid <= dCollapsed && dMid <= dExpanded) {
            sidebar.classList.add('sheet-mid');
        } else if (dExpanded < dCollapsed) {
            sidebar.classList.add('sheet-expanded');
        }
    }

    handle.addEventListener('touchstart', e => {
        onStart(e.touches[0].clientY);
    }, { passive: true });
    handle.addEventListener('touchmove', e => {
        onMove(e.touches[0].clientY);
        e.preventDefault();
    }, { passive: false });
    handle.addEventListener('touchend', onEnd);
    handle.addEventListener('touchcancel', onEnd);

    handle.addEventListener('mousedown', e => {
        onStart(e.clientY);
        function mm(ev) { onMove(ev.clientY); }
        function mu() {
            onEnd();
            document.removeEventListener('mousemove', mm);
            document.removeEventListener('mouseup', mu);
        }
        document.addEventListener('mousemove', mm);
        document.addEventListener('mouseup', mu);
    });
}

/**
 * Aggiorna la CSS variable --sidebar-reserved usata dalla filter bar
 * e dalla sub-bar per non finire sotto alla sidebar aperta.
 * 0px quando sidebar chiusa o su mobile, 420px altrimenti.
 */
function updateSidebarReservedSpace() {
    /* Disabilitato per scelta di design: la sidebar (380px) non è così
       larga da giustificare lo spostamento della filter bar / sub-bar.
       Manteniamo la variabile CSS a 0 così le regole calc() non hanno
       effetto. Per riabilitare lo spostamento, ripristina la logica
       commentata sotto. */
    document.documentElement.style.setProperty('--sidebar-reserved', '0px');
    /* Logica originale (attiva se scommentata):
       const open = !dom.sidebar.classList.contains('is-closed');
       const reserved = (open && !isMobileViewport()) ? '420px' : '0px';
       document.documentElement.style.setProperty('--sidebar-reserved', reserved);
    */
}

function openSidebar() {
    dom.sidebar.classList.remove('is-closed');
    updateSidebarReservedSpace();
}

function closeSidebar() {
    dom.sidebar.classList.add('is-closed');
    dom.sidebar.classList.remove('sheet-mid', 'sheet-expanded');
    dom.sidebar.style.height = '';
    state.activePoiId     = null;
    state.activeSectionId = null;
    clearOverlay();
    updateSidebarReservedSpace();
}

/* ------------------------------------------------------------------
   10) RENDERING DEL DETTAGLIO NELLA SIDEBAR
   ------------------------------------------------------------------
   renderDetail(poi) per POI top-level.
   renderSectionDetail(parent, section) per sezioni Muraglia
   (mostra il tasto "Torna a X" e mantiene visibile la lista sezioni).
------------------------------------------------------------------ */
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

    dom.detailMeta.innerHTML = buildMetaHtml(poi);

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

    const secRows = [metaRow('Sezione di', escapeHtml(parent.name))];
    if (section.priceLevel)  secRows.push(metaRow('Costo', renderPriceLevel(section.priceLevel)));
    if (section.openingDays) secRows.push(metaRow('Apertura', escapeHtml(section.openingDays)));
    dom.detailMeta.innerHTML = secRows.join('');

    updateMapsButton(section.mapsUrl);

    renderSectionButtons(parent.overlay.sections, section.id);
    dom.detailSections.hidden = false;
}

/**
 * Costruisce l'HTML del blocco "meta" (categoria + campi opzionali).
 * Ogni riga viene aggiunta solo se il POI ha effettivamente il campo,
 * così POI di categorie diverse mostrano info diverse (hotel: check-in,
 * aeroporto: IATA, stazione: linee, ecc.) senza logica per categoria.
 */
function buildMetaHtml(poi) {
    const rows = [];
    /* Campi built-in: label fissa a sinistra, valore del POI a destra.
       Per rinominare una label (es. "Biglietto" -> "Ingresso"), cambia
       la stringa qui sotto. Per aggiungere campi arbitrari per un
       singolo POI usa invece `customMeta` (vedi sotto). */

    /* Identità del POI (usato per le città: es. "Storia imperiale",
       "Finanza e skyline"). Compare in cima come label identitaria. */
    if (poi.focus)           rows.push(metaRow('Identità', escapeHtml(poi.focus)));

    /* Biglietto: stringa libera con il prezzo esatto d'ingresso.
       Da usare per monumenti, giardini, attività — dove c'è un prezzo
       specifico e comunicabile. */
    if (poi.ticketPrice)     rows.push(metaRow('Biglietto', escapeHtml(poi.ticketPrice)));

    /* priceLevel (simboli €€€) riservato ai POI food: sui ristoranti
       il prezzo esatto non ha senso, i simboli comunicano la fascia. */
    if (poi.priceLevel && poi.category === 'food' || 'shopping') {
        rows.push(metaRow('Costo', renderPriceLevel(poi.priceLevel)));
    }
    /* freeEntry: booleano. Se true, mostra "Gratuito". Alternativa
       concisa a ticketPrice quando il posto è pubblico e senza costo. */
    if (poi.freeEntry)       rows.push(metaRow('Ingresso', 'Gratuito'));
    if (poi.roomPrice)       rows.push(metaRow('Camera', escapeHtml(poi.roomPrice)));

    /* Time-related */
    if (poi.visitDuration)   rows.push(metaRow('Durata', escapeHtml(poi.visitDuration)));
    if (poi.openingDays)     rows.push(metaRow('Apertura', escapeHtml(poi.openingDays)));
    if (poi.reservation)     rows.push(metaRow('Prenotazione', escapeHtml(poi.reservation)));
    if (poi.checkIn)         rows.push(metaRow('Check-in', escapeHtml(poi.checkIn)));
    if (poi.checkOut)        rows.push(metaRow('Check-out', escapeHtml(poi.checkOut)));

    /* Practical */
    if (poi.iata)            rows.push(metaRow('Codice IATA', escapeHtml(poi.iata)));
    if (poi.lines)           rows.push(metaRow('Linee', escapeHtml(poi.lines)));

    /* Vibe / rating (icone su scala 1-5).
       rating (fiamme): quanto sei hyped/consigliato il posto.
       crowdLevel (omini): quanto è affollato (1 = tranquillo, 5 = molto). */
    if (poi.rating)          rows.push(metaRow('Hype', renderFireLevel(poi.rating)));
    if (poi.crowdLevel)      rows.push(metaRow('Affollamento', renderCrowdLevel(poi.crowdLevel)));

    /* Righe custom definite direttamente sul POI, in fondo al blocco.
       Array di oggetti { label, value }. Utile quando serve una label
       specifica per quel POI che non è coperta dai campi built-in
       (es. "Numero binari" per una stazione, "Piani" per un hotel,
       "Chef" per un ristorante). */
    if (Array.isArray(poi.customMeta)) {
        poi.customMeta.forEach(m => {
            if (m && m.label && m.value !== undefined && m.value !== '') {
                rows.push(metaRow(m.label, escapeHtml(String(m.value))));
            }
        });
    }

    return rows.join('');
}

/* Costruisce una riga meta LABEL / VALUE. valueHtml può contenere
   markup (per renderPriceLevel); label viene sempre escapata. */
function metaRow(label, valueHtml) {
    return `<div class="meta-row">` +
             `<span class="meta-label">${escapeHtml(label)}</span>` +
             `<span class="meta-value">${valueHtml}</span>` +
           `</div>`;
}

/* SVG delle icone usate nelle scale a 5 (Hype / Affollamento).
   Path prese da Lucide (lucide.dev), semplificate per la resa a 14px. */
const FLAME_SVG =
    '<svg viewBox="0 0 24 24" width="13" height="13"' +
    ' fill="currentColor" stroke="none" aria-hidden="true">' +
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143' +
    '-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0' +
    'c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';

const PERSON_SVG =
    '<svg viewBox="0 0 24 24" width="12" height="12"' +
    ' fill="currentColor" stroke="none" aria-hidden="true">' +
    '<circle cx="12" cy="7" r="4"/>' +
    '<path d="M4 22c0-4 4-7 8-7s8 3 8 7z"/></svg>';

/* Rende una scala icona (0-5) come 5 span con l'icona ripetuta:
   i primi N con classe "-on" (colorati), i restanti "-off" (spenti). */
function renderIconLevel(level, iconHtml, cls) {
    const n = Math.max(1, Math.min(5, Number(level) || 1));
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<span class="${cls}-${i <= n ? 'on' : 'off'}">${iconHtml}</span>`;
    }
    return html;
}
function renderFireLevel(level)  { return renderIconLevel(level, FLAME_SVG,  'fire');  }
function renderCrowdLevel(level) { return renderIconLevel(level, PERSON_SVG, 'crowd'); }

/* Rende priceLevel (1-5) come una fila di 5 simboli €:
   i primi N in colore accento, i restanti in muted. */
function renderPriceLevel(level) {
    const n = Math.max(1, Math.min(5, Number(level) || 1));
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<span class="euro-${i <= n ? 'on' : 'off'}">€</span>`;
    }
    return html;
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

/* ------------------------------------------------------------------
   11) BARRA FILTRI (primary + sub-bar espandibile)
   ------------------------------------------------------------------
   La primary bar mostra i top-level di CATEGORIES; i pulsanti che
   hanno `sub` ricevono la classe .has-sub (aggiunge ▾).
   Il click su un parent apre la sub-bar sotto con un'animazione
   clip-path: circle() che parte dal centro del pulsante cliccato
   (origine impostata dinamicamente in openSubBar via CSS variable).
------------------------------------------------------------------ */
function renderFilterBar() {
    /* Burger sticky "docked" a sinistra della filter bar (solo mobile).
       Anche se scorri la barra orizzontalmente per raggiungere le
       categorie di destra, il burger resta ancorato via CSS
       position: sticky. Al click delega al burger fixed di menu.js. */
    const burgerHtml =
        `<button class="filter-burger" type="button" aria-label="Apri menu">` +
            `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" ` +
                 `stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ` +
                 `aria-hidden="true">` +
                `<line x1="4" y1="7"  x2="20" y2="7"/>` +
                `<line x1="4" y1="12" x2="20" y2="12"/>` +
                `<line x1="4" y1="17" x2="20" y2="17"/>` +
            `</svg>` +
        `</button>`;

    const btnsHtml = CATEGORIES.map(cat => {
        const hasSub = !!cat.sub;
        const cls = 'filter-btn' + (hasSub ? ' has-sub' : '');
        return (
            `<button class="${cls}"` +
            ` data-category="${cat.key}" type="button">${escapeHtml(cat.label)}</button>`
        );
    }).join('');

    dom.filterBar.innerHTML = burgerHtml + btnsHtml;

    dom.filterBar.addEventListener('click', onFilterClick);
    dom.subBar.addEventListener('click', onFilterClick);
    updateFilterBarActive();
}

/**
 * Popola e apre la sub-bar per un parent.
 * Calcola il raggio del clip-path circle in modo che copra sempre
 * l'intera sub-bar, indipendentemente da dove sta l'origine del click
 * (necessario perché su viewport wide l'origine può cadere fuori box).
 */
function openSubBar(triggerBtn, parentKey) {
    const parent = findCategoryByKey(parentKey);
    if (!parent || !parent.sub) return;

    dom.subBar.innerHTML = parent.sub.map(s =>
        `<button class="filter-btn filter-sub-btn"` +
        ` data-category="${s.key}" type="button">${escapeHtml(s.label)}</button>`
    ).join('');
    dom.subBar.dataset.parent = parentKey;

    dom.subBar.offsetHeight; // reflow so getBoundingClientRect è aggiornato

    const btnRect = triggerBtn.getBoundingClientRect();
    const subRect = dom.subBar.getBoundingClientRect();
    const relX = (btnRect.left + btnRect.width / 2) - subRect.left;
    const w = subRect.width;
    const h = subRect.height;
    const maxDist = Math.max(
        Math.hypot(relX, 0),
        Math.hypot(w - relX, 0),
        Math.hypot(relX, h),
        Math.hypot(w - relX, h)
    );
    dom.subBar.style.setProperty('--origin-x', relX + 'px');
    dom.subBar.style.setProperty('--reveal-radius', Math.ceil(maxDist + 20) + 'px');

    dom.subBar.classList.add('is-open');
    updateFilterBarActive();
}

function closeSubBar() {
    dom.subBar.classList.remove('is-open');
    dom.subBar.dataset.parent = '';
}

/**
 * Sincronizza le classi is-active / is-parent-active sui pulsanti
 * dopo un cambio di stato. Il `!!` in fondo garantisce un booleano
 * vero per classList.toggle (altrimenti undefined da && short-circuit
 * farebbe un toggle non voluto).
 */
function updateFilterBarActive() {
    const active = state.activeCategory;
    dom.filterBar.querySelectorAll('.filter-btn').forEach(btn => {
        const key = btn.dataset.category;
        const cat = findCategoryByKey(key);
        const isActive = key === active;
        const hasActiveSub = !!(cat && cat.sub && cat.sub.some(s => s.key === active));
        btn.classList.toggle('is-active', isActive);
        btn.classList.toggle('is-parent-active', hasActiveSub && !isActive);
    });
    dom.subBar.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.category === active);
    });
}

/**
 * Handler unico per click sia sulla primary bar sia sulla sub-bar
 * (registrato su entrambi gli elementi in renderFilterBar).
 * Logica:
 *   - Click su parent (has sub): toggle della sub-bar.
 *   - Click sullo stesso parent già aperto: chiudi e torna a 'all'.
 *   - Click su primary leaf: chiudi sub-bar, filtra a quella key.
 *   - Click su sub item: filtra al sub, sub-bar resta aperta.
 */
function onFilterClick(evt) {
    /* Burger integrato: delega al burger fisso di menu.js
       che gestisce l'apertura del drawer. */
    if (evt.target.closest('.filter-burger')) {
        const menuBtn = document.getElementById('menu-btn');
        if (menuBtn) menuBtn.click();
        return;
    }

    const btn = evt.target.closest('.filter-btn');
    if (!btn) return;

    const key = btn.dataset.category;
    const cat = findCategoryByKey(key);
    if (!cat) return;

    const hasSub    = !!cat.sub;
    const isSubItem = btn.classList.contains('filter-sub-btn');

    if (hasSub) {
        const isOpen = dom.subBar.classList.contains('is-open');
        const sameParent = dom.subBar.dataset.parent === key;
        if (isOpen && sameParent) {
            closeSubBar();
            state.activeCategory = 'all';
        } else {
            openSubBar(btn, key);
            state.activeCategory = key;
        }
    } else {
        if (!isSubItem) closeSubBar();
        state.activeCategory = key;
    }

    updateFilterBarActive();
    clearOverlay();
    applyCategoryFilter();
}

/**
 * Mostra/nasconde i marker della mappa in base alla categoria attiva,
 * e chiude la sidebar se il POI attivo viene filtrato via.
 * Applica anche un fit-bounds automatico sui POI rimasti visibili.
 */
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

/**
 * Restituisce i POI da mostrare secondo activeCategory.
 * Se la key è di un parent (es. 'esperienze'), restituisce l'unione
 * dei POI di tutti i suoi sub. Altrimenti filtra sulla singola key.
 */
function getVisiblePois() {
    const key = state.activeCategory;
    if (key === 'all') return POI_DATA;
    const cat = findCategoryByKey(key);
    if (cat && cat.sub) {
        const subKeys = cat.sub.map(s => s.key);
        return POI_DATA.filter(p => subKeys.includes(p.category));
    }
    return POI_DATA.filter(p => p.category === key);
}

/* ------------------------------------------------------------------
   12) OVERLAY GRANDE MURAGLIA
   ------------------------------------------------------------------
   Un POI con `overlay: { polyline, sections }` mostra sulla mappa
   una polilinea (traccia della Muraglia) e piccoli cerchi bianchi
   nei punti visitabili. Cliccando un cerchio si apre la sezione
   corrispondente come sotto-POI.
------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
   13) SELEZIONE POI E SEZIONE
   ------------------------------------------------------------------
   Punto di sincronizzazione tra mappa e sidebar: aggiornano lo
   state, animano la mappa, popolano la sidebar, aprono l'overlay
   Muraglia se il POI ha `overlay`.
------------------------------------------------------------------ */
function selectPoi(poiId, opts = {}) {
    const poi = POI_DATA.find(p => p.id === poiId);
    if (!poi) return;

    state.activePoiId = poi.id;

    flyToPoi(poi.coords, poi.zoom, { duration: 1.2, easeLinearity: 0.25 });

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

    flyToPoi(section.coords, section.zoom, {
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
    flyToPoi(parent.coords, parent.zoom, { duration: 1.0 });
    renderDetail(parent);
}

/* ------------------------------------------------------------------
   14) CALCOLA DISTANZA
   ------------------------------------------------------------------
   Stima distanza (linea d'aria via Haversine) e tempo di percorrenza
   per tre mezzi: auto (velocità adattiva urbano/autostrada), treno,
   aereo. Solo tempo effettivo, nessun overhead pre/post viaggio.
   Modale aperto dal bottone .dist-btn nella sidebar del POI.
------------------------------------------------------------------ */

const TRAVEL_MODES = {
    walk: {
        label: 'A piedi',
        routeFactor: 1.25,                // strade + attraversamenti pedonali
        speed: () => 5,                    // camminata media adulti (5 km/h)
        maxDistance: 10                    // sopra 10 km il bottone sparisce
    },
    car: {
        label: 'Auto',
        routeFactor: 1.35,
        /* Velocità adattiva:
             < 10 km  → 30 km/h  (urbano stretto, semafori)
             < 20 km  → 45 km/h  (urbano/statale)
             ≥ 20 km  → 70 km/h  (autostrada/statale extraurbana) */
        speed: km => {
            if (km < 10) return 30;
            if (km < 20) return 45;
            return 70;
        }
    },
    train: {
        label: 'Treno',
        routeFactor: 1.15,
        speed: () => 250                  // velocità media CRH high-speed
    },
    plane: {
        label: 'Aereo',
        routeFactor: 1.05,
        speed: () => 750                  // velocità di crociera commerciale
    }
};

/* Distanza in linea d'aria fra due coordinate, in km. Formula Haversine. */
function haversine(lat1, lng1, lat2, lng2) {
    const R = 6371; // raggio Terra in km
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

/* Formatta minuti totali in "Xh Ym" o "Ym" se meno di 1h. */
function formatDuration(minutes) {
    const total = Math.max(1, Math.round(minutes));
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${String(m).padStart(2, '0')}m`;
}

/* Calcola { km, minutes } per un mezzo. */
function computeTravel(fromCoords, toCoords, modeKey) {
    const mode = TRAVEL_MODES[modeKey];
    const airline = haversine(fromCoords[0], fromCoords[1],
                              toCoords[0], toCoords[1]);
    const km = airline * mode.routeFactor;
    const speed = mode.speed(km);
    const hours = km / speed;
    return { km, minutes: hours * 60 };
}

/* Stato attuale del modale distanza. */
const distState = {
    fromPoi: null,       // POI di partenza (quello aperto in sidebar)
    toPoiId: null,       // id destinazione selezionata
    catKey:  'all',      // filtro categoria del dropdown
    mode:    'car'       // mezzo scelto
};

function openDistanceModal(fromPoi) {
    distState.fromPoi = fromPoi;
    distState.toPoiId = null;
    distState.catKey  = 'all';
    /* Mantiene l'ultimo mezzo scelto se già impostato, altrimenti car */
    distState.mode = distState.mode || 'car';

    dom.distFrom.textContent = fromPoi.name;
    populateDistCategories();
    populateDistPois();
    syncModeButtons();
    updateDistResult();

    dom.distModal.hidden = false;
}

function closeDistanceModal() {
    dom.distModal.hidden = true;
}

/* Popola il dropdown categorie con tutte le key foglia di CATEGORIES
   (esclude i parent "esperienze"/"services" che sono contenitori). */
function populateDistCategories() {
    const opts = ['<option value="all">Tutte le categorie</option>'];
    CATEGORIES.forEach(c => {
        if (c.key === 'all') return;
        if (c.sub) {
            c.sub.forEach(s => {
                opts.push(`<option value="${s.key}">${escapeHtml(s.label)}</option>`);
            });
        } else {
            opts.push(`<option value="${c.key}">${escapeHtml(c.label)}</option>`);
        }
    });
    dom.distCat.innerHTML = opts.join('');
    dom.distCat.value = distState.catKey;
}

/* Popola il dropdown POI filtrando per categoria e escludendo il POI
   di partenza. */
function populateDistPois() {
    const cat = distState.catKey;
    const from = distState.fromPoi;
    const list = POI_DATA.filter(p => {
        if (p.id === from.id) return false;
        if (cat === 'all') return true;
        return p.category === cat;
    });

    if (list.length === 0) {
        dom.distPoi.innerHTML = '<option value="">— nessun POI in questa categoria —</option>';
        distState.toPoiId = null;
        return;
    }

    dom.distPoi.innerHTML = list.map(p =>
        `<option value="${p.id}">${escapeHtml(p.name)} · ${escapeHtml(p.city)}</option>`
    ).join('');

    /* Ripristina selezione precedente se ancora valida, altrimenti primo */
    const still = list.find(p => p.id === distState.toPoiId);
    distState.toPoiId = still ? still.id : list[0].id;
    dom.distPoi.value = distState.toPoiId;
}

function syncModeButtons() {
    dom.distModes.querySelectorAll('.dist-mode-btn').forEach(btn => {
        const active = btn.dataset.mode === distState.mode;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
    });
}

function updateDistResult() {
    const from = distState.fromPoi;
    const to = POI_DATA.find(p => p.id === distState.toPoiId);

    /* Prima calcola la distanza in linea d'aria per decidere se il
       bottone "A piedi" deve comparire o sparire (soglia maxDistance). */
    let airlineKm = 0;
    if (from && to) {
        airlineKm = haversine(from.coords[0], from.coords[1],
                              to.coords[0], to.coords[1]);
    }
    const walkBtn = dom.distModes
        && dom.distModes.querySelector('[data-mode="walk"]');
    if (walkBtn) {
        const walkable = airlineKm > 0
            && airlineKm <= TRAVEL_MODES.walk.maxDistance;
        walkBtn.classList.toggle('is-hidden', !walkable);
        /* Se "A piedi" era selezionato ma non è più raggiungibile,
           torna automaticamente in auto. */
        if (!walkable && distState.mode === 'walk') {
            distState.mode = 'car';
            syncModeButtons();
        }
    }

    if (!from || !to) {
        dom.distKm.textContent = '—';
        dom.distTime.textContent = 'Seleziona destinazione';
        return;
    }
    const { km, minutes } = computeTravel(from.coords, to.coords, distState.mode);
    const kmRounded = km < 10 ? km.toFixed(1) : Math.round(km);
    dom.distKm.textContent = `${kmRounded} km`;
    const modeLabel = distState.mode === 'walk'
        ? 'a piedi'
        : 'in ' + TRAVEL_MODES[distState.mode].label.toLowerCase();
    dom.distTime.textContent = `${formatDuration(minutes)} ${modeLabel}`;
}

/* ------------------------------------------------------------------
   15) EVENT BINDING GLOBALE
   ------------------------------------------------------------------
   Registrazione degli event listener sui pulsanti statici.
   I filtri usano event delegation dentro renderFilterBar.
------------------------------------------------------------------ */
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

    /* ---- Modale "Calcola distanza" ---- */
    if (dom.distBtn) {
        dom.distBtn.addEventListener('click', () => {
            if (!state.activePoiId) return;
            const poi = POI_DATA.find(p => p.id === state.activePoiId);
            if (poi) openDistanceModal(poi);
        });
    }
    if (dom.distClose) {
        dom.distClose.addEventListener('click', closeDistanceModal);
    }
    if (dom.distBackdrop) {
        dom.distBackdrop.addEventListener('click', closeDistanceModal);
    }
    if (dom.distCat) {
        dom.distCat.addEventListener('change', () => {
            distState.catKey = dom.distCat.value;
            populateDistPois();
            updateDistResult();
        });
    }
    if (dom.distPoi) {
        dom.distPoi.addEventListener('change', () => {
            distState.toPoiId = dom.distPoi.value;
            updateDistResult();
        });
    }
    if (dom.distModes) {
        dom.distModes.addEventListener('click', evt => {
            const btn = evt.target.closest('.dist-mode-btn');
            if (!btn) return;
            distState.mode = btn.dataset.mode;
            syncModeButtons();
            updateDistResult();
        });
    }
    /* Esc chiude anche il modale distanza (se aperto) */
    document.addEventListener('keydown', evt => {
        if (evt.key === 'Escape' && dom.distModal && !dom.distModal.hidden) {
            closeDistanceModal();
        }
    });
}

/* ------------------------------------------------------------------
   Utility: escaping HTML per template letterali che ricevono
   stringhe da dati (nomi POI, tag, ecc.). Difesa base contro
   caratteri speciali che potrebbero rompere il markup.
------------------------------------------------------------------ */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* ------------------------------------------------------------------
   15) BOOTSTRAP
------------------------------------------------------------------ */
function init() {
    createMarkers();
    renderFilterBar();
    bindEvents();
    initSheetDrag();
    updateSidebarReservedSpace();
    window.addEventListener('resize', updateSidebarReservedSpace);
    renderDetail(null);

    const bounds = L.latLngBounds(POI_DATA.map(p => p.coords));
    map.fitBounds(bounds, { padding: [60, 60] });
}

document.addEventListener('DOMContentLoaded', init);
