/* ================================================================
   menu.js — Menu di navigazione condiviso fra tutte le pagine.
   ----------------------------------------------------------------
   Ogni pagina include un <div id="menu-mount"></div> in cima al body,
   e questo script inietta al suo interno: il pulsante burger, il
   backdrop scuro e il drawer con la lista delle pagine.
   Il drawer usa la classe .is-open per apparire/scomparire; il
   backdrop cliccato o il tasto Esc chiudono il menu.
   La voce corrispondente alla pagina corrente viene evidenziata
   confrontando window.location.pathname contro i file target.
   ================================================================ */

'use strict';

(function initMenu() {

    /* La lista delle voci del menu. Aggiungi qui pagine nuove:
       key   -> identificatore usato per capire la pagina corrente
       href  -> file di destinazione
       label -> testo visibile
       icon  -> path SVG (viewBox 0 0 24 24) usato dentro un <svg> */
    const ITEMS = [
        {
            key: 'home',
            href: 'index.html',
            label: 'Home',
            icon: '<path d="M3 12l9-9 9 9M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>'
        },
        {
            key: 'mappa',
            href: 'mappa.html',
            label: 'Mappa',
            icon: '<path d="M9 3l6 3 6-2v14l-6 2-6-3-6 2V5l6-2z"/><path d="M9 3v14M15 6v14"/>'
        },
        {
            key: 'il-file',
            href: 'il-file.html',
            label: 'Il File',
            icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>'
        }
    ];

    /** Ritorna la chiave della pagina corrente in base all'URL. */
    function detectCurrentKey() {
        const path = window.location.pathname.toLowerCase();
        for (const item of ITEMS) {
            if (path.endsWith('/' + item.href) || path.endsWith(item.href)) {
                return item.key;
            }
        }
        /* Se il path finisce con "/" (o è la root del deploy),
           consideriamo che stiamo sulla home (index.html implicito). */
        if (path.endsWith('/') || path === '') return 'home';
        return null;
    }

    const mount = document.getElementById('menu-mount');
    if (!mount) return;

    const currentKey = detectCurrentKey();

    /* Costruzione dell'HTML del menu. Usiamo template literal
       per leggibilità; è statico, niente interpolazione utente. */
    mount.innerHTML = `
        <button class="menu-btn" id="menu-btn" type="button"
                aria-label="Apri menu" title="Menu">
            <svg viewBox="0 0 24 24" width="18" height="18"
                 fill="none" stroke="currentColor"
                 stroke-width="2.2" stroke-linecap="round"
                 aria-hidden="true">
                <line x1="4" y1="7"  x2="20" y2="7"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
                <line x1="4" y1="17" x2="20" y2="17"/>
            </svg>
        </button>

        <div class="menu-backdrop" id="menu-backdrop"></div>

        <aside class="menu-drawer" id="menu-drawer"
               aria-label="Menu di navigazione">
            <div class="menu-drawer-header">
                <h2 class="menu-drawer-title">Viaggio in Cina</h2>
                <button class="menu-close" id="menu-close" type="button"
                        aria-label="Chiudi menu">
                    <svg viewBox="0 0 24 24" width="14" height="14"
                         fill="none" stroke="currentColor"
                         stroke-width="2.5" stroke-linecap="round"
                         aria-hidden="true">
                        <line x1="5" y1="5" x2="19" y2="19"/>
                        <line x1="19" y1="5" x2="5" y2="19"/>
                    </svg>
                </button>
            </div>

            <nav class="menu-nav">
                ${ITEMS.map(item => `
                    <a class="menu-item ${item.key === currentKey ? 'is-active' : ''}"
                       href="${item.href}">
                        <span class="menu-item-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="20" height="20"
                                 fill="none" stroke="currentColor"
                                 stroke-width="1.8" stroke-linecap="round"
                                 stroke-linejoin="round">${item.icon}</svg>
                        </span>
                        <span class="menu-item-label">${item.label}</span>
                    </a>
                `).join('')}
            </nav>
        </aside>
    `;

    /* Cache dei riferimenti dopo l'iniezione */
    const btn      = document.getElementById('menu-btn');
    const drawer   = document.getElementById('menu-drawer');
    const backdrop = document.getElementById('menu-backdrop');
    const closeBtn = document.getElementById('menu-close');

    function open() {
        drawer.classList.add('is-open');
        backdrop.classList.add('is-open');
    }

    function close() {
        drawer.classList.remove('is-open');
        backdrop.classList.remove('is-open');
    }

    btn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);

    /* Tasto Esc: chiude il menu se aperto */
    document.addEventListener('keydown', evt => {
        if (evt.key === 'Escape' && drawer.classList.contains('is-open')) {
            close();
        }
    });

})();
