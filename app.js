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
        tags: ['Città', 'Capitale', 'Imperiale'],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785590756/citta-pechino1_ulw2tc.jpg',
    },
    {
        id: 'forbidden-city',
        name: 'Città Proibita',
        city: 'Pechino',
        category: 'monument',
        coords: [39.917024511195464, 116.39707721086508],
        zoom: 15,
        description:
            "Complesso imperiale delle dinastie Ming e Qing, cuore " +
            "politico della Cina per quasi cinque secoli. Ospita il " +
            "Museo del Palazzo con oltre un milione di reperti.",
        tags: ['Monumento', 'UNESCO', 'Storia', 'Architettura'],
        images: [
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593148/mon-PEKcitProibita1_ior41e.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593150/mon-PEKcitProibita2_u9emaw.jpg'
        ],
        openingDays: 'Mar-Dom 8:30-17:00',
    },
    {
        id: 'palazzo-estate',
        name: 'Palazzo d\'Estate (Yíhéyuán)',
        city: 'Pechino',
        category: 'monument',
        coords: [40.000097334158525, 116.27548205459539],
        zoom: 15,
        description: "Il Palazzo d'Estate (Yíhéyuán) è il più grande e celebre giardino imperiale " +
            "della Cina, esteso su quasi 3 km² attorno alla Collina della Longevità e " +
            "al Lago Kunming. Commissionato dall'Imperatrice Vedova Cixi e " +
            "Patrimonio UNESCO, fonde perfettamente templi, padiglioni, gallerie " +
            "dipinte e ponti in marmo con il paesaggio naturale circostante.",
        tags: ["Monumento", "UNESCO", "Natura", "Giardino Imperiale"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1785859854/mon-palazzoest1_fn0tzb.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785859853/mon-palazzoest2_hyqxne.jpg'],
        mapsUrl: 'https://maps.app.goo.gl/rb2CCjFaQ3o6wDXr9',
        openingDays: 'Alta stagione (1/04-31/10): 6:00-20:00\nBassa stagione 6:30-19:00',
        visitDuration: '2 - 3/4 ore',
        ticketPrice: 'Solo parco 30 ¥ (~3,80 €), biglietto all-inclusive 60 ¥ (~7,60 €)'
    },
    {
        id: 'tempio-paradiso',
        name: 'Tempio del Paradiso',
        city: 'Pechino',
        category: 'monument',
        coords: [39.882365533474974, 116.40663782340609],
        zoom: 15,
        description: "Il Tempio del Paradiso (Tiāntán) è un maestoso complesso " +
            "di edifici religiosi eretto nel 1420 durante la dinastia Ming. " +
            "Utilizzato dagli imperatori delle dinastie Ming e Qing per " +
            "le cerimonie di preghiera per il buon raccolto, si distingue " +
            "per la sua iconica Sala della Preghiera per i Buoni Raccolti, " +
            "interamente in legno senza l'uso di chiodi. L'architettura " +
            "riflette la cosmologia cinese con forme circolari (il cielo) " +
            "e quadrate (la terra).",
        tags: ["Monumento", "Tempio", "Storia", "Parco"],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785859859/mon-tempiopar1_jlnkcs.jpg',
        mapsUrl: 'https://maps.app.goo.gl/se3Ww8VK5dvFpnMN9',
        openingDays: 'Parco tutti i giorni, 6:00-22:00',
        visitDuration: '1,5/2 ore',
        reservation: 'Obbligatoria in anticipo (7g max)',
        ticketPrice: 'Solo parco 15 ¥ (~1,90 €), biglietto all-inclusive 34 ¥ (~4,30 €)',
    },
    {
        id: 'national-museum',
        name: 'Museo nazionale della Cina',
        city: 'Pechino',
        category: 'monument',
        coords: [39.905724873337114, 116.4016584817068],
        zoom: 15,
        description: "Il Museo Nazionale della Cina (Guójiā Bówùguǎn) si affaccia " +
            "sul lato est di Piazza Tiananmen ed è uno dei musei più " +
            "grandi al mondo per superficie ed estensione. Custodisce " +
            "oltre 1,4 milioni di reperti che ripercorrono l'intera storia " +
            "cinese, dalle prime civiltà preistoriche alla fine dell'era " +
            "imperiale e oltre. Tra i suoi tesori spiccano bronzi antichi, " +
            "porcellane raffinate e opere d'arte in giada di valore inestimabile.",
        tags: ["Monumento", "Arte", "Storia", "Museo"],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785859855/mon-nationalMus1_sbkxw9.jpg',
        mapsUrl: 'https://maps.app.goo.gl/Kr6skBdUkv9uRiqd6',
        openingDays: 'Mar-Dom 9:00-17:00',
        visitDuration: '2 - 5 ore',
        freeEntry: true,
        reservation: 'Obbligatoria in anticipo (7g max)',
    },
    {
        id: 'lama-temple',
        name: 'Lama Temple',
        city: 'Pechino',
        category: 'monument',
        coords: [39.947840689498165, 116.41727245900996],
        zoom: 15,
        description: "Il Tempio del Lama (Yōnghégōng, 'Palazzo dell'Armonia e della " +
            "Pace') è il più importante e famoso tempio buddista tibetano " +
            "fuori dal Tibet. Originariamente residenza principesca nel 1694 " +
            "e poi monastero imperiale della dinastia Qing, è celebre per le " +
            "sue spettacolari statue, tra cui l'imponente Buddha Maitreya " +
            "di 18 metri scolpito da un unico blocco di legno di sandalo " +
            "proveniente dal Tibet.",
        tags: ["Monument", "Tempio", "Buddismo"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1785859859/mon-lamaTemple1_xgps9k.webp',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785859854/mon-lamaTemple2_d979dn.jpg'],
        mapsUrl: 'https://maps.app.goo.gl/J6XTxCvjfZziYMUH6',
        openingDays: '9:00-16:30',
        visitDuration: '1 - 2 ore',
        ticketPrice: '25 ¥ (~3,15 €)',
        reservation: 'Consigliata',
    },

    /*=======================   CIBO+ PEK =============================*/
    {
        id: 'quanjude',
        name: 'Quanjude',
        city: 'Pechino',
        category: 'food',
        coords: [39.913979593453305, 116.41587221295595],
        zoom: 15,
        description: "Quanjude è la più famosa e storica catena di ristoranti di " +
            "Pechino, fondata nel 1864 durante la dinastia Qing. Celebre " +
            "in tutto il mondo per l'autentica Anatra alla Pechinese " +
            "servita con croccante pelle dorata, viene preparata " +
            "secondo il metodo tradizionale sospeso in forni aperti alimentati " +
            "da legna di frutteto. Un'esperienza gastronomica " +
            "e culturale imperdibile nella capitale.",
        tags: ["Cibo", "Anatra", "Michelin"],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785859839/food-quanjude1_pnryqh.jpg',
        mapsUrl: 'https://maps.app.goo.gl/8dzgfhyqhKCan68v7',
        openingDays: '11:00-14:00  16:30-21:00',
        priceLevel: 4,
        reservation: 'Consigliata per orari di punta'
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
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785590754/citta-shanghai1_jqzhib.jpg',
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
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593151/mon-SHAbund1_sxl0uf.jpg',
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
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593173/nat-SHAyuGarden1_p1adbt.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593174/nat-SHAyuGarden2_wwnl8t.webp'
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
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593191/sho-SHAyuyuanSt1_edtat1.avif',
        mapsUrl: 'https://maps.app.goo.gl/KGqqXPQHGch9Bykw7',
        openingDays: 'Aperto 24/7',
        rating: 3,
        customMeta: [
            { label: 'Negozi',          value: '~8:30-22:30' },
            { label: 'Meglio visitare', value: 'Di sera con le luci accese' }
        ]
    },
    {
        id: 'oriental-pearl-tower',
        name: 'Oriental Pearl Tower',
        city: 'Shanghai',
        category: 'monument',
        coords: [31.23981191062612, 121.49976793662005],
        zoom: 15,
        description: "Iconica torre della televisione situata nel distretto di " +
        "Pudong, alta 468 metri e famosa per le sue 11 sfere di varie " +
                "dimensioni. Tra le sue attrazioni principali offre un ponte di " +
            "osservazione con pavimento trasparente in vetro a 259 metri d'altezza " +
            "e un ristorante girevole panoramico. Uno dei simboli più riconosciuti " +
            "dello skyline futuristico di Shanghai.",
        tags: ["Monumenti", "Tesla 4 elisir", "Skyline"],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785673756/mon-oriPearlTow1_gmygyi.jpg',
        mapsUrl: 'https://maps.app.goo.gl/Wn2J6XKAbLFf2CJXA',
        ticketPrice: '200 ¥ (~26 € - 28 €)',
        openingDays: 'Ogni giorno 8:30-21:00'
    },
    {
        id: 'nanjing-road',
        name: 'Nanjing Road',
        city: 'Shanghai',
        category: 'shopping',
        coords: [31.235977642166063, 121.47969485765319],
        zoom: 15,
        description: "Il celebre viale pedonale dello shopping e dello " +
            "struscio nel cuore di Shanghai, che si estende per oltre 5 " +
            "chilometri da Piazza del Popolo fino al Bund. Un vivace " +
            "contrasto visivo tra storici edifici coloniali, facciate " +
            "illuminate da megaschermi al neon, marchi internazionali e " +
            "storici negozi cinesi, animato giorno e notte da milioni " +
            "di visitatori.",
        tags: ["Shopping", "Centro storico", "Alti marchi"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1785673770/sho-nanjing1_t4ishz.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785673772/sho-nanjing2_l3i565.webp'],
        mapsUrl: 'https://maps.app.goo.gl/ZDFwzjgV2FJGwJAcA',
    },
    {
        id: '1000-trees',
        name: '1000 Trees',
        city: 'Shanghai',
        category: 'shopping',
        coords: [31.24965636705894, 121.44707942659562],
        zoom: 15,
        description: "Straordinario complesso architettonico a Shanghai progettato " +
            "dall'architetto Thomas Heatherwick lungo il Suzhou Creek, " +
            "vicino al quartiere d'arte M50. Noto anche come Tian An 1000 Trees, " +
            "l'edificio si sviluppa come una montagna artificiale terrazzata, " +
            "coperta da migliaia di alberi e piante che fondono natura e " +
            "design urbano all'avanguardia.",
        tags: ["Shopping", "Centro commerciale"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1785673774/sho-trees1_lezakb.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785673771/sho-trees2_r861u4.jpg'],
        mapsUrl: 'https://maps.app.goo.gl/3JottyDkjGRMGYEw6',
        crowdLevel: 1
    },
    {
        id: 'tianzifang',
        name: 'Tianzifang',
        city: 'Shanghai',
        category: 'shopping',
        coords: [31.20896796976884, 121.46893018293333],
        zoom: 15,
        description: "Caratteristico quartiere artistico nato dalla riqualificazione " +
            "di tradizionali vicoli ed edifici Shikumen nella Concessione " +
            "Francese. Un labirinto pedonale ricco di boutique artigianali, " +
            "gallerie d'arte, bar e caffetterie all'aperto, famoso per aver " +
            "conservato un'atmosfera intima e bohémien nel cuore della " +
            "moderna Shanghai.",
        tags: ["Shopping", "Caratteristico", "Città vecchia", "Souvenir"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1785673773/sho-tianzifang1_jo9ypj.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785673772/sho-tianzifang2_nwlyxp.jpg'],
        mapsUrl: 'https://maps.app.goo.gl/Br11JcJmvbQunkZg6',
        crowdLevel: 3,
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
        images: [
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785590754/citta-seul1_jepy7u.png',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785590754/citta-seul2_jjzoo6.jpg'
        ]
    },
    {
        id: 'gwanghwamun-gate',
        name: 'Gwanghwamun Gate',
        city: 'Seul',
        category: 'monument',
        coords: [37.57639586861782, 126.97690500325896],
        zoom: 15,
        description: "Gwanghwamun è la porta principale e più grande del palazzo " +
            "Gyeongbokgung a Seul. Costruita originariamente nel 1395, " +
            "è un simbolo storico della Corea del Sud, famosa per le sue " +
            "tre entrate ad arco e il padiglione a due piani sopra di esse. " +
            "Si affaccia sulla grande Piazza Gwanghwamun e ospita " +
            "quotidianamente la suggestiva cerimonia del cambio della guardia.",
        tags: ["Monumento", "Storia"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026336/mon-gwanghamunGate1_f7rgra.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026336/mon-gwanghamunGate2_be1mkq.jpg'],
        mapsUrl: 'https://maps.app.goo.gl/Z9Sbd3tdgwUGHtTz9',
        openingDays: 'Aperto 24/7',
        visitDuration: '20 minuti',
        freeEntry: true,
        customMeta: [
            { label: 'Cambio della guardia',     value:'10:00 e 14:00' }
        ]
    },
    {
        id: 'myeong-dong-market',
        name: 'Myeongdong Night Market',
        city: 'Seul',
        category: 'shopping',
        coords: [37.561919288875266, 126.98569357337766],
        zoom: 15,
        description: "Il Myeongdong Night Market è uno dei mercati serali più " +
            "venerati e vivaci di Seul, situato nel cuore dello shopping. " +
            "Nel tardo pomeriggio la via pedonale si riempie di decine " +
            "di bancarelle che offrono lo street food più famoso della " +
            "Corea, dagli spiedini di tteokbokki e formaggio grigliato " +
            "ai dolci tradizionali, circondati da luci a neon e negozi di cosmetica.",
        tags: ["Shopping", "Street Market", "Street food"],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026669/sho-myeongdongMarket1_ujz90s.jpg',
        mapsUrl: 'https://maps.app.goo.gl/xygx3RZUkFFxjhig7',
        openingDays: 'Ogni giorno ~17:00 - 01:00',
        priceLevel: 2,
        customMeta: [
            { label: 'Consigli',     value:'Portare qualcosa in contanti e ' +
                    'prezzo medio 4k-10k ₩' }
        ]
    },
    {
        id: 'gyeongbokgung-palace',
        name: 'Gyeongbokgung',
        city: 'Seul',
        category: 'monument',
        coords: [37.57970199873027, 126.97699808122107],
        zoom: 15,
        description: "Gyeongbokgung ('Palazzo Grandemente Benedetto dal Cielo') è " +
            "il più grande e maestoso dei cinque grandi palazzi reali " +
            "edificati durante la dinastia Joseon. Costruito nel 1395, " +
            "comprende l'imponente sala del trono Geunjeongjeon, " +
            "il padiglione sull'acqua Gyeonghoeru e bellissimi giardini " +
            "reali che offrono uno scorcio unico sul passato coreano.",
        tags: ["Monumento", "Palazzo"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026336/mon-gyeongbokgung1_mnznsl.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026337/mon-gyeongbokgung2_w2oyum.jpg'],
        mapsUrl: 'https://maps.app.goo.gl/PwHQkfga7qQTMfpj9',
        openingDays: '9:00 - 17/18:00',
        visitDuration: '1-2 ore',
        ticketPrice: '3.000 ₩ (~2,10 €)'
    },
    {
        id: 'hongdae-shopping-street',
        name: 'Hongdae Shopping Street',
        city: 'Seul',
        category: 'shopping',
        coords: [37.554449504782234, 126.92238332776883],
        zoom: 15,
        description: "Hongdae è l'emblema della cultura giovanile ed eclettica " +
            "di Seul, situata attorno alla Hongik University. La via " +
            "pedonale principale è celebre per gli spettacoli di " +
            "street performer (busking), boutique di moda indie, " +
            "locali alla moda e una vivace vita notturna. Un quartiere " +
            "dinamico che rappresenta il cuore creativo e underground " +
            "della capitale coreana.",
        tags: ["Shopping", "Vita notturna", "Giovani"],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026668/sho-hongdaeStr1_lghnv6.avif',
        mapsUrl: 'https://maps.app.goo.gl/BcKfLGBFubbfSjbv7',
        customMeta: [
            { label: 'Negozi',     value:'11:00 - 22:00' }
        ]
    },
    {
        id: 'n-seul-tower',
        name: 'Seul Tower',
        city: 'Seul',
        category: 'monument',
        coords: [37.5516627217384, 126.9881627477384],
        zoom: 15,
        description: "La N Seoul Tower sorge sulla cima del monte Namsan a " +
            "480 metri sul livello del mare, offrendo una vista " +
            "spettacolare a 360 gradi sull'intera metropoli di Seul. " +
            "Famosa per la sua terrazza ricoperta dai 'lucchetti dell'amore' " +
            "e per l'illuminazione a LED della sera, è un'icona " +
            "imperdibile e romantica del panorama urbano coreano.",
        tags: ["Tower", "Punti panoramici"],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026337/mon-seulTower1_pqu39l.jpg',
        mapsUrl: 'https://maps.app.goo.gl/Hagvfjkfm5SijVB36',
        openingDays: 'Lun-Ven 10:30 - 22:30\nSab-Dom 10:00 - 23:00\n' +
            'La biglietteria chiude 30 minuti prima',
        visitDuration: '1,5/2 ore',
        ticketPrice: 'Piazza base + terrazza lucchetti, free\n' +
            'Biglietto osservatorio, 21.000 ₩ (~14,50 €)' +
            '\nFunivia (Namsan Cable Car - opzionale): 15.000 ₩ (~10,30 €) A/R',
        customMeta: [
            { label: 'Meglio visitare', value: 'Un\'ora prima del tramonto' }
        ]
    },
    {
        id: 'gwangjang-market',
        name: 'Gwangjang Market',
        city: 'Seoul',
        category: 'shopping',
        coords: [37.57028215697589, 126.99953922693201],
        zoom: 15,
        description: "Inaugurato nel 1905, Gwangjang Market è il più antico " +
            "mercato tradizionale coperto ancora in funzione della Corea. " +
            "Famoso in tutto il mondo per il suo autentico street food, " +
            "è il posto perfetto per gustare le frittelle di fagioli " +
            "mungo (bindaetteok), il tteokbokki, i mayak gimbap " +
            "e la tartare di manzo con uovo crudo (yukhoe).",
        tags: ["Shopping", "Street food", "Souvenir"],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026668/sho-gwangjangMarket1_qf4unu.jpg',
        mapsUrl: 'https://maps.app.goo.gl/iMpk23mQKscAbsfV8',
        openingDays: '09:00 - 23:00',
        priceLevel: 3,
        crowdLevel: 4,
        customMeta: [
            { label: 'Consigli',     value:'Portare qualcosa in contanti e ' +
                    'prezzo medio 4k-10k ₩' }
        ]
    },
    {
        id: 'bukchon-hanok-village',
        name: 'Bukchon Hanok Village',
        city: 'Seul',
        category: 'monument',
        coords: [37.58162032547799, 126.98499210182949],
        zoom: 14,
        description: "Il Bukchon Hanok Village è uno storico quartiere residenziale " +
            "di Seul situato tra i palazzi Gyeongbokgung e Changdeokgung. " +
            "Custodisce centinaia di 'hanok', le tradizionali case " +
            "coreane risalenti alla dinastia Joseon. Con i suoi stradelli " +
            "in salita, i tetti in tegole lavorate e i cortili interni, " +
            "offre un affascinante tuffo nell'architettura del passato.",
        tags: ["Quartiere storico", "Tradizione"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026338/mon-bukchonVill1_j0vcu8.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026338/mon-bukchonVill2_r26ucs.webp'],
        mapsUrl: 'https://maps.app.goo.gl/bfVTyRqpqzUaPr276',
        openingDays: 'Lun-Sab 10:00 - 17:00 per rispetto dei residenti',
        visitDuration: '~1 ora',
    },
    {
        id: 'gangnam-hands',
        name: 'Gangnam',
        city: 'Seul',
        category: 'monument',
        coords: [37.51379657037621, 127.06079878620051],
        zoom: 15,
        description: "Gangnam è il quartiere più moderno, glamour e finanziario " +
            "di Seul, reso famoso in tutto il mondo dal successo della " +
            "canzone di Psy. Tra grattacieli futuristici, boutique di alta " +
            "moda e cliniche d'avanguardia, ospita la celebre statua " +
            "gigante in bronzo 'Mani d'Oro' (Gangnam Style Statue) situata " +
            "proprio davanti all'ingresso del centro commerciale COEX.",
        tags: ["Quartiere", "Statua", "PSY"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026297/city-gangam1_zzaw1m.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026336/mon-gangam2_o4vgnp.jpg'],
        mapsUrl: 'https://maps.app.goo.gl/7LmaenELTosPPgM88',
    },
    {
        id: 'namdaemun-market',
        name: 'Namdaemun Market',
        city: 'Seul',
        category: 'shopping',
        coords: [37.559370554897924, 126.97757415386383],
        zoom: 15,
        description: "Namdaemun è il più grande e antico mercato tradizionale " +
            "della Corea del Sud, risalente al 1414. Una tentacolare " +
            "rete di stradine pedonali in cui oltre 10.000 banchi vendita " +
            "offrono di tutto: da articoli d'abbigliamento e utensili " +
            "per la casa, fino alle famose corsie del cibo di strada " +
            "specializzate in noodles caldi, ravioli al vapore e ginseng.",
        tags: ["Mercato", "Street food"],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026671/sho-namdaemunMarket_hkovoc.jpg',
        mapsUrl: 'https://maps.app.goo.gl/ajRL27w6bJWzvZgcA',
        openingDays: 'Lun-Sab 09:00 - 17:30',
        customMeta: [
            { label: 'Street food e banchi serali',     value:'10:00 - 21:00' }
        ],
        priceLevel: 2,
    },
    {
        id: 'deoksugung-palace',
        name: 'Deoksugung Palace',
        city: 'Seul',
        category: 'monument',
        coords: [37.565948490098606, 126.97486247895333],
        zoom: 15,
        description: "Deoksugung è uno dei cinque grandi palazzi reali di Seul, " +
            "famoso per la sua suggestiva fusione tra architettura " +
            "tradizionale cromaticamente ricca e imponenti edifici " +
            "in stile occidentale neoclassico. Residenza preferita dell'Imperatore " +
            "Gojong durante la fine del XIX secolo, è celebre per il " +
            "suo viale alberato con mura in pietra e per essere l'unico " +
            "palazzo reale aperto fino a tarda sera.",
        tags: ["Palazzo", "Architettura"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026337/mon-doeksugungpalace1_eaaymq.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026337/mon-doeksugungpalace2_uo3goe.jpg'],
        mapsUrl: 'https://maps.app.goo.gl/LiRQXhJyrKVNYA9A6',
        openingDays: 'Tutti i giorni, 09:00 - 21:00',
        visitDuration: '45 min - 1 ora',
        ticketPrice: '1.000 ₩ (~0,70 €)',
        customMeta: [
            { label: 'Cambio della guardia',     value:'11:00, 14:00 e 15:30' }
        ]
    },
    {
        id: 'memorial-kor-war',
        name: 'Memoriale della Guerra della Corea',
        city: 'Seul',
        category: 'monument',
        coords: [37.537296426678125, 126.97727821072802],
        zoom: 15,
        description: "Il Memoriale della Guerra della Corea (War Memorial of Korea) " +
            "è un imponente museo ed esibizione permanente a Yongsan. " +
            "Ripercorre la complessa storia militare della Corea antica fino " +
            "al conflitto del 1950-1953. Con sei ampie sale " +
            "interne ed un'incredibile piazza esterna gremita di vere " +
            "navi, aerei, carri armati e pezzi d'artiglieria, rappresenta " +
            "una testimonianza toccante della storia moderna.",
        tags: ["Museo", "Storia", "Guerra"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026337/mon-memoriale1_dpro0s.webp',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026337/mon-memoriale2_qxrvsl.jpg'],
        mapsUrl: 'https://maps.app.goo.gl/g7pgALWCr2tws5D36',
        openingDays: 'Tutti i giorni, 09:30 - 18:00',
        visitDuration: '~1,5 - 2 ore',
        freeEntry: true,
    },
    {
        id: 'cheonggyecheon',
        name: 'Cheonggyecheon',
        city: 'Seul',
        category: 'nature',
        coords: [37.570616794486554, 126.97873465626606],
        zoom: 15,
        description: "Cheonggyecheon è un suggestivo corso d'acqua artificiale " +
            "che scorre per circa 11 km nel cuore di Seul. Frutto di un " +
            "imponente progetto di riqualificazione urbana che ha " +
            "riportato alla luce un antico fiume interrato, è " +
            "un'oasi verde immersa tra i grattacieli. Tra cascate " +
            "illuminate, ponticelli e installazioni artistiche, è " +
            "uno dei luoghi più amati da residenti e turisti per passeggiare.",
        tags: ["Natura", "Fiume artificiale", "Passeggiata"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026681/nat-cheonggyecheon1_lloyx6.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026682/nat-cheonggyecheon2_lt2cpr.webp'],
        mapsUrl: 'https://maps.app.goo.gl/S4ALvj4X2XE8icQ97',
        customMeta: [
            { label: 'Meglio visitare', value: 'Al tramonto' }
        ]
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
        images: [
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785590754/citta-xian1_uy9dzt.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785590754/citta-xian2_pvrlz7.webp'
        ]
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
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593151/mon-XIAesercitoTer1_ayplnb.jpg',
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
        images: [
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785590754/citta-chengdu1_wnri87.jpg',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785590754/citta-chengdu2_kaastq.jpg'
        ]

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
        images: [
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785590754/citta-chongqing1_mmmvuh.webp',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785590755/citta-chongqing2_gyofdb.jpg'
        ]
    },

    /*=======================   CIBO+ CHON =============================*/




    /* ------------------------------------------------------------------
                               ---HONG-KONG---
    ------------------------------------------------------------------*/
    {
        id: 'hong-kong',
        name: 'Hong Kong',
        city: 'Regione Amministrativa Speciale',
        category: 'city',
        coords: [22.31932662376619, 114.16931173018067],

        zoom: 6,
        description: "Metropoli verticale incastonata tra mare e montagne, dove Oriente e Occidente si incontrano." +
            "Offre un contrasto unico tra grattacieli futuristici, mercati di strada tradizionali" +
            "e uno degli skyline più iconici al mondo.",

        tags: ["Città", "Grattacieli", "Skyline"],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785666247/cit-hongkong1_dlz3mc.jpg',
        mapsUrl: 'https://maps.app.goo.gl/kXXUAxZ1R15Ms2D9A',
    },




    /* ------------------------------------------------------------------
                           ---SHENZHEN---
------------------------------------------------------------------*/
    {
        id: 'shenzhen',
        name: 'Shenzhen',
        city: 'Guangdong',
        category: 'city',
        coords: [22.54003885705979, 114.05962268417684],
        zoom: 8,
        description: "La Silicon Valley della Cina: una megalopoli ultramoderna nata" +
            "da un villaggio di pescatori. È il cuore pulsante dell'innovazione" +
            "tecnologica globale, famosa per i suoi mercati dell'elettronica e l'architettura avveniristica.",
        tags: ["Città", "Tech", "Futuristica"],
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785666247/cit-shenzhen1_dunsah.webp',
        mapsUrl: 'https://maps.app.goo.gl/f9Tgt5BR7nxNQKJw9',
    },

    /* ------------------------------------------------------------------
                       ---OSAKA---
------------------------------------------------------------------*/
    {
        id: 'osaka',
        name: 'Osaka',
        city: 'Japan',
        category: 'city',
        coords: [34.6990252321527, 135.49804993198111],
        zoom: 10,
        description: "Osaka è la terza città più grande del Giappone e la capitale " +
            "gastronomica del Paese, famosa per la sua vivace cultura " +
            "popolare e l'atmosfera informale. Celebre per le luci a neon " +
            "di Dotonbori, il maestoso Castello di Osaka e la cultura del " +
            "'Kuidaore' (mangiare fino a sfinirsi), offre un perfetto " +
            "connubio tra storia imperiale, quartieri futuristici e la " +
            "street food più famosa del Giappone.",
        tags: ["Città", "Japan"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026296/city-osaka1_algtyk.webp',
            'https://res.cloudinary.com/vsbp8pxx/image/upload/v1786026296/city-osaka2_q0uajo.webp'],
        mapsUrl: 'https://maps.app.goo.gl/EC4PnWvmWX9jG5XUA',
    },


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
        image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593156/mon-ALTmuraglia1_c4fbxh.jpg',
        bestTime: 'Mag-Giu / Set-Ott',
        openingDays: 'Ogni giorno (varia per sezione)',
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
                    image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593147/mon-MURshanhaiguan1_ury1af.jpg',
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
                    image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593156/mon-MURjinshanling1_kc9zdk.jpg',
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
                    images: [
                        'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593148/mon-MURsimatai1_n5m0pt.jpg',
                        'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593147/mon-MURsimitai2_vud8tk.jpg'
                    ],
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
                    image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593147/mon-MURmutianyu1_qomkdz.jpg',
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
                    image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593152/mon-MURbadaling1_ae2kyy.jpg',
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
                    image: 'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785593153/mon-MURjiayuguan1_fqozs8.webp',
                    hint: "L'estremo ovest, nel deserto"
                }
            ]
        }
    },

    {
    id: 'parco-zhangjiajie',
        name: 'Parco nazionale forestale di Zhangjiajie',
    city: 'Hunan',
    category: 'nature',
    coords: [29.31755833750445, 110.43485017927311],
    zoom: 13,
    description: "Parco Forestale Nazionale celebre per i suoi imponenti " +
"pilastri di pietra arenaria che hanno ispirato le montagne " +
"fluttuanti del film Avatar. Un paesaggio mozzafiato caratterizzato " +
"dall'ardito ascensore Bailong e dal famoso e vertiginoso " +
"Ponte di Vetro sul Grand Canyon. Uno dei luoghi naturali più " +
"spettacolari della Cina.",
    tags: ["Natura", "Chiavatar", "Immenso"],
    images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1785666264/nat-zhangjiajie1_ueklqa.png',
    'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785666263/nat-zhangjiajie2_v9x0ul.webp'],
    mapsUrl: 'https://maps.app.goo.gl/j45KkgQgoneQkK4u5',
    ticketPrice: '225-239 ¥ (~29-36 €) valido 4 giorni + bus interni inclusi',
    openingDays: 'Ogni giorno 7:00-17:00',
    visitDuration: '1 giorno in fast, 2 con più calma (consigliato)',
    customMeta: [
        { label: 'Ascensore Bailong',       value: '326m in 88s - 65 ¥ (~8,50 €)' },
        { label: 'Funivia Tianzi Mountain', value: 'Ottima vista sui picchi forestali, 75¥ (~9,50 €)' },
        { label: 'Funivia Yangjiajie',      value: 'Comoda per raggiungere la Natural Great Wall, 79 ¥ (~10 €)' },
        { label: 'Occhio alle scimmie',     value: 'Scippano come a N...' }
    ]
},
{
    id: 'porta-del-cielo',
        name: 'Porta del Cielo',
    city: 'Monte Tianmen - Hunan',
    category: 'nature',
    coords: [29.068640150042604, 110.47542853076597],
    zoom: 14,
    description: "Spettacolare cavità naturale aperta nella roccia del Monte " +
    "Tianmen, raggiungibile con una scalinata da 999 gradini o con " +
    "la funivia urbana più lunga del mondo (7,5 km). Famosa per le " +
    "sue passerelle di vetro a picco sul vuoto e la strada tortuosa " +
    "delle 99 curve. Uno dei luoghi più sacri e scenografici della Cina.",
    tags: ["Natura", "Piottata", "Mozzafiato"],
        images: ['https://res.cloudinary.com/vsbp8pxx/image/upload/v1785666264/nat-tianmenPorta2_w7h4pk.jpg',
    'https://res.cloudinary.com/vsbp8pxx/image/upload/v1785666264/nat-tianmenPorta1_iqm8fl.webp'],
    mapsUrl: 'https://maps.app.goo.gl/GQeN8KezcWUeMyfE9',
    ticketPrice: 'All-Inclusive 278 ¥ (~36 €), comprende bus interni, cheat scala mobile per i gradini e una seggiovia',
    openingDays: 'Ogni giorno ~7:30-18:30',
    visitDuration: '4-5 ore',
},


    /* ------------------------------------------------------------------
                          --- AEROPORTI PRINCIPALI ---
    ------------------------------------------------------------------ */

    {
        id: 'pkx-airport',
        name: 'Aeroporto di Pechino Daxing',
        city: 'Pechino — PKX',
        category: 'airport',
        coords: [39.5098, 116.4106],
        zoom: 12,
        description:
            "Aeroporto inaugurato nel 2019, iconico terminal a stella " +
            "progettato da Zaha Hadid. Hub in crescita per i voli " +
            "internazionali, in complemento a PEK.",
        tags: ['Aeroporto', 'Nuovo', 'Zaha Hadid'],
        iata: 'PKX',
        customMeta: [
            { label: 'Taxi',           value: '~55-75 min · ~180 ¥ · 46 km' },
            { label: 'Mezzi pubblici', value: 'Daxing Airport Express metro · ~30 min al centro' }
        ]
    },

    {
        id: 'pvg-airport',
        name: 'Aeroporto Internazionale Pudong',
        city: 'Shanghai — PVG',
        category: 'airport',
        coords: [31.1443, 121.8083],
        zoom: 12,
        description:
            "Principale aeroporto internazionale di Shanghai, sull'estremità " +
            "orientale di Pudong. Hub per China Eastern, la maggior parte " +
            "dei voli intercontinentali passa da qui.",
        tags: ['Aeroporto', 'Hub', 'International'],
        iata: 'PVG',
        customMeta: [
            { label: 'Taxi',           value: '~50-70 min · ~200 ¥ · 32 km' },
            { label: 'Mezzi pubblici', value: 'Maglev 7 min a Longyang + metro L2 · totale ~40 min · oppure metro L2 diretta ~55 min' }
        ]
    },

    {
        id: 'sha-airport',
        name: 'Aeroporto Hongqiao',
        city: 'Shanghai — SHA',
        category: 'airport',
        coords: [31.1979, 121.3363],
        zoom: 13,
        description:
            "Aeroporto domestico principale + alcuni voli internazionali " +
            "brevi (Corea, Giappone, Taiwan). Adiacente alla stazione HSR " +
            "Hongqiao. Vicino al centro, molto comodo.",
        tags: ['Aeroporto', 'Domestico', 'HSR-Hub'],
        iata: 'SHA',
        customMeta: [
            { label: 'Taxi',           value: '~25-35 min · ~80 ¥ · 13 km' },
            { label: 'Mezzi pubblici', value: 'Metro L2 / L10 · ~30 min al centro' }
        ]
    },

    {
        id: 'icn-airport',
        name: 'Aeroporto Internazionale Incheon',
        city: 'Seul — ICN',
        category: 'airport',
        coords: [37.4602, 126.4407],
        zoom: 12,
        description:
            "Principale hub della Corea del Sud, su un'isola artificiale " +
            "a ovest di Seul. Costantemente premiato come uno dei " +
            "migliori aeroporti al mondo per servizi e pulizia.",
        tags: ['Aeroporto', 'Hub', 'Premiato'],
        iata: 'ICN',
        customMeta: [
            { label: 'Taxi',           value: '~60-80 min · ~55.000-70.000 KRW · 52 km' },
            { label: 'Mezzi pubblici', value: 'AREX Express · 43 min a Seoul Station · ~9.000 KRW' }
        ]
    },

    {
        id: 'gmp-airport',
        name: 'Aeroporto di Gimpo',
        city: 'Seul — GMP',
        category: 'airport',
        coords: [37.5583, 126.7906],
        zoom: 13,
        description:
            "Aeroporto secondario di Seul, vicino al centro. Voli " +
            "domestici + alcuni shuttle internazionali brevi verso " +
            "Tokyo-Haneda, Osaka, Shanghai-Hongqiao, Pechino, Taipei.",
        tags: ['Aeroporto', 'Domestico', 'Shuttle'],
        iata: 'GMP',
        customMeta: [
            { label: 'Taxi',           value: '~25-35 min · ~25.000 KRW · 18 km' },
            { label: 'Mezzi pubblici', value: 'Metro L5 / L9 · ~35-45 min al centro' }
        ]
    },

    {
        id: 'xiy-airport',
        name: 'Aeroporto Internazionale Xianyang',
        city: 'Xi\'an — XIY',
        category: 'airport',
        coords: [34.4436, 108.7519],
        zoom: 12,
        description:
            "Unico grande aeroporto della zona di Xi'an, hub secondario " +
            "di China Eastern. Voli domestici capillari + rotte " +
            "internazionali su Bangkok, Seoul, Osaka.",
        tags: ['Aeroporto', 'Hub'],
        iata: 'XIY',
        customMeta: [
            { label: 'Taxi',           value: '~50-70 min · ~120 ¥ · 40 km' },
            { label: 'Mezzi pubblici', value: 'Metro L14 · ~40 min · oppure bus Airport Line 2 · ~50 min' }
        ]
    },

    {
        id: 'ctu-airport',
        name: 'Aeroporto Shuangliu',
        city: 'Chengdu — CTU',
        category: 'airport',
        coords: [30.5785, 103.9471],
        zoom: 13,
        description:
            "Storico aeroporto principale di Chengdu, hub di Sichuan " +
            "Airlines. Molto vicino al centro. Voli domestici + " +
            "internazionali, anche se molti si stanno spostando su TFU.",
        tags: ['Aeroporto', 'Hub'],
        iata: 'CTU',
        customMeta: [
            { label: 'Taxi',           value: '~30-45 min · ~80 ¥ · 16 km' },
            { label: 'Mezzi pubblici', value: 'Metro L10 · ~40 min al centro' }
        ]
    },

    {
        id: 'tfu-airport',
        name: 'Aeroporto Internazionale Tianfu',
        city: 'Chengdu — TFU',
        category: 'airport',
        coords: [30.3125, 104.4413],
        zoom: 12,
        description:
            "Nuovo aeroporto inaugurato nel 2021, a sud di Chengdu. " +
            "La maggior parte dei voli internazionali si sta trasferendo " +
            "qui. Più moderno di CTU ma più lontano dal centro.",
        tags: ['Aeroporto', 'Nuovo', 'International'],
        iata: 'TFU',
        customMeta: [
            { label: 'Taxi',           value: '~50-75 min · ~150 ¥ · 50 km' },
            { label: 'Mezzi pubblici', value: 'Metro L18 / L19 · ~45 min al centro' }
        ]
    },

    {
        id: 'ckg-airport',
        name: 'Aeroporto Jiangbei',
        city: 'Chongqing — CKG',
        category: 'airport',
        coords: [29.7194, 106.6416],
        zoom: 12,
        description:
            "Unico grande aeroporto di Chongqing, hub per Chongqing " +
            "Airlines e Sichuan Airlines. Voli domestici capillari + " +
            "collegamenti internazionali su Asia e Europa.",
        tags: ['Aeroporto', 'Hub'],
        iata: 'CKG',
        customMeta: [
            { label: 'Taxi',           value: '~30-45 min · ~50 ¥ · 19 km' },
            { label: 'Mezzi pubblici', value: 'Metro L3 / L10 · ~40 min al centro' }
        ]
    },

    {
        id: 'hkg-airport',
        name: 'Aeroporto Internazionale di Hong Kong',
        city: 'Hong Kong — HKG',
        category: 'airport',
        coords: [22.3080, 113.9185],
        zoom: 12,
        description:
            "Costruito sull'isola artificiale di Chek Lap Kok, uno degli " +
            "aeroporti più trafficati e premiati al mondo. Hub di Cathay " +
            "Pacific. Base per collegamenti Asia-Pacifico.",
        tags: ['Aeroporto', 'Hub', 'Cathay Pacific'],
        iata: 'HKG',
        customMeta: [
            { label: 'Taxi',           value: '~35-50 min · ~370 HKD · 34 km' },
            { label: 'Mezzi pubblici', value: 'Airport Express · 24 min a Central Station · ~115 HKD' }
        ]
    },

    {
        id: 'szx-airport',
        name: 'Aeroporto Bao\'an',
        city: 'Shenzhen — SZX',
        category: 'airport',
        coords: [22.6392, 113.8106],
        zoom: 12,
        description:
            "Principale aeroporto di Shenzhen, servizi capillari per " +
            "l'area del Pearl River Delta. Hub Shenzhen Airlines. " +
            "In forte crescita internazionale negli ultimi anni.",
        tags: ['Aeroporto', 'Hub'],
        iata: 'SZX',
        customMeta: [
            { label: 'Taxi',           value: '~30-45 min · ~110 ¥ · 32 km' },
            { label: 'Mezzi pubblici', value: 'Metro L11 · ~35 min a Futian (centro)' }
        ]
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
            "Tre terminal (T1/T2/T3). Storicamente il più trafficato " +
            "della Cina, oggi affiancato da PKX Daxing per i voli " +
            "internazionali crescenti.",
        tags: ['Aeroporto', 'Hub', 'Air China'],
        iata: 'PEK',
        customMeta: [
            { label: 'Taxi',           value: '~45-60 min · ~150 ¥ · 28 km' },
            { label: 'Mezzi pubblici', value: 'Airport Express metro · ~25 min al centro' }
        ]
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

    /* Nessuna immagine → nascondi la galleria del tutto invece di
       mostrare il placeholder rotto. Sensato per POI dove la foto
       non serve (es. aeroporti) o dove ancora non è stata caricata. */
    if (images.length === 0) {
        dom.detailGallery.classList.add('is-hidden');
        track.innerHTML = '';
        dots.innerHTML  = '';
        return;
    }
    dom.detailGallery.classList.remove('is-hidden');

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
    if (poi.priceLevel && (poi.category === 'food' || poi.category === 'shopping')) {
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
   markup (per renderPriceLevel / renderFireLevel / renderCrowdLevel).
   Layout adattivo: sotto ~25 caratteri il valore va inline a destra
   della label; sopra, va stacked sotto (a tutta larghezza, wrap
   naturale). I valori che contengono HTML (icone) sono sempre inline
   perché occupano visivamente poco spazio. */
function metaRow(label, valueHtml) {
    const hasHtml = /<[a-z]/i.test(valueHtml);
    // Solo valori davvero brevi restano inline (es. codici IATA a 3
    // lettere, priceLevel a icone). Tutto il resto va a capo, per
    // evitare troncamenti e mantenere una griglia visiva prevedibile
    // nella sidebar/pannello dettaglio (già stretti su mobile).
    const isShort = hasHtml || valueHtml.length <= 3;
    const cls = 'meta-row ' + (isShort ? 'meta-row--short' : 'meta-row--long');
    return `<div class="${cls}">` +
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
 *   - Click su "Tutti" (key === 'all'): comportamento speciale, vedi sotto.
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

    /* --- Caso speciale: click su "Tutti" ---------------------------
       L'utente tipicamente sta esplorando un'area zoommata (es. una
       città) e clicca Tutti per far riapparire i marker delle altre
       categorie SENZA essere sbalzato via dall'area corrente.
         - Primo click (Tutti non ancora attivo): mostra tutti i
           marker ma NON muove la mappa (skipFly).
         - Secondo click (Tutti già attivo): fly-to-bounds su tutti
           i POI → equivale a "torna alla vista iniziale".
    ------------------------------------------------------------------ */
    if (key === 'all') {
        const wasAlreadyAll = state.activeCategory === 'all';
        closeSubBar();
        state.activeCategory = 'all';
        updateFilterBarActive();
        clearOverlay();
        applyCategoryFilter({ skipFly: !wasAlreadyAll });
        return;
    }

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
 * Applica anche un fit-bounds automatico sui POI rimasti visibili,
 * salvo che venga passato { skipFly: true } (usato dal click su "Tutti"
 * per lasciare l'utente sulla vista corrente).
 */
function applyCategoryFilter(opts = {}) {
    const skipFly = opts.skipFly === true;

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

    if (skipFly) return;

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
