/* 
=========================================================================
⚠️ MANUALE D'USO E REGOLE SACRE - NON MODIFICARE SENZA PERMESSO ⚠️
=========================================================================

1. STILE & DESIGN (CSS):
   - Font: Sempre e solo 'Inter' (anche per le icone X).
   - Barra Ricerca: "Pillola" grigia scura, X interna a sinistra. 
     USARE `box-sizing: border-box` E padding precisi per non tagliarla a destra.
   - Popup X: Ora è allineata.
     Non usare Flexbox per centrarla, usa solo posizionamento assoluto.
   - Fix iPhone: Le righe `li.menu-item` DEVONO avere `padding-right: 15px` 
     altrimenti la "i" corsiva viene tagliata dal bordo schermo.

2. CSV & DATI:
   - "Descrizione_Lista": Testo che appare subito nel menu.
   - "Descrizione_Popup": Testo lungo che appare solo cliccando.
   - "Ricetta": Se vuota (es. Birre), il bottone "Come si fa" SPARISCE.
   - "Titolo_Popup": Decide se scrivere "Preparazione", "Dettagli" o "Info".
   - "Tipo": Se è 'info', formatta come Panini (titolo + lista grigia).
   - "Grado": Accetta testo (Forte) o % esatte (5.0% Vol).

3. INTERFACCIA UTENTE (JS):
   - Indicatore click: La "i" è un pseudo-elemento ::after con `user-select: none`.
     NON toccare questo parametro o torna l'artefatto blu quando selezioni il testo.
   - Prezzi: 80 secco (senza .00), allineato a destra con margin-left: auto.
   - Logica Vini/Franciacorta: Alcuni hanno descrizione in lista, altri no. 
     Comanda il CSV (se la colonna è vuota, non stampa nulla).

4. MANTENIMENTO:
   - Quando modifichi il CSS o il JS, cambia sempre il numero di versione 
     nell'HTML (es. style_nuovo.css?v=667) o l'iPhone non aggiorna un cazzo.

=========================================================================
*/



document.addEventListener('DOMContentLoaded', () => {
    const CSV_URL = 'menu_nuovo.csv'; 
    
    const I18N = {
        it: {
            cats: { 
                "Caffetteria":"Caffetteria", 
                "Tè & Cioccolate": "Tè & Cioccolate",
                "Bevande":"Bevande", 
                "Spritz":"Spritz & Co.", 
                "Cocktails":"Cocktails", 
                "Vini":"Vini", 
                "Franciacorta":"Franciacorta", 
                "Birre":"Birre", 
                "Gin & Tonic":"Gin & Tonic", 
                "Rum":"Rum", 
                "Whisky":"Whisky", 
                "Amari e Liquori":"Amari", 
                "Grappe":"Grappe", 
                "Vermouth":"Vermouth", 
                "Vodka":"Vodka", 
                "Brandy":"Brandy", 
                "Spuntini":"Spuntini", 
                "Panini & Piadine":"Panini & Piadine" 
            },
            paniniSub: "Componi il tuo panino o piadina!",
            detailsBtn: "Come si fa?",
            hideBtn: "Nascondi",
            search: "Cerca...",
            noResPart1: "Nessun risultato trovato per",
            tryAgain: "Prova a cercare un altro termine o",
            resetLink: "cancella la ricerca.",
            service: "Servizio al tavolo incluso",
            allergenDisclaimer: "Per allergie o intolleranze rivolgersi al personale.",
            allergenPrefix: "Allergeni:",
            prepTitle: "Preparazione / Dettagli:"
        },
        en: {
            cats: { 
                "Caffetteria":"Coffee", 
                "Tè & Cioccolate": "Tea & Chocolate",
                "Bevande":"Soft Drinks", 
                "Spritz":"Spritz & Co.", 
                "Cocktails":"Cocktails", 
                "Vini":"Wines", 
                "Franciacorta":"Sparkling", 
                "Birre":"Beers", 
                "Gin & Tonic":"Gin & Tonic", 
                "Rum":"Rum", 
                "Whisky":"Whisky", 
                "Amari e Liquori":"Bitters & Liqueurs", 
                "Grappe":"Grappa", 
                "Vermouth":"Vermouth", 
                "Vodka":"Vodka", 
                "Brandy":"Brandy", 
                "Spuntini":"Snacks", 
                "Panini & Piadine":"Sandwiches" 
            },
            paniniSub: "Build your own sandwich!",
            detailsBtn: "How is it made?",
            hideBtn: "Hide",
            search: "Search...",
            noResPart1: "No results found for",
            tryAgain: "Try another term or",
            resetLink: "clear search.",
            service: "Table service included",
            allergenDisclaimer: "For allergies and intolerances please ask the staff.",
            allergenPrefix: "Allergens:",
            prepTitle: "Preparation / Details:"
        }
    };

    const ALLERGEN_LABELS = { 'G': 'Glutine/Gluten', 'L': 'Lattosio/Lactose', 'V': 'Vegano/Vegan', 'N': 'Nocciole/Nuts', 'Soia': 'Soia/Soy' };
    const CATEGORY_ORDER = Object.keys(I18N.it.cats);
    
    let currentLang = 'it';
    let globalData = [];

    const els = {
        container: document.getElementById('menu-container'),
        mobileNavList: document.querySelector('#quick-nav-mobile-sticky ul'),
        desktopNav: document.getElementById('quick-nav'),
        loader: document.getElementById('loading-message'),
        searchTrigger: document.getElementById('sticky-search-trigger'),
        searchInput: document.getElementById('sticky-search-input'),
        stickyNav: document.getElementById('quick-nav-mobile-sticky'),
        popup: document.getElementById('gin-description-popup'),
        clearSearchLink: document.getElementById('clear-search-link'),
        noResultsSection: document.getElementById('no-results'),
        noResultsMsg: document.getElementById('no-results-msg')
    };

    function init() {
        setSeasonalHeader();
        
        if(els.popup && !document.getElementById('popup-strength')) {
            const container = document.getElementById('popup-preparation-container');
            if(container) {
                const badge = document.createElement('span');
                badge.id = 'popup-strength';
                badge.className = 'strength-badge';
                badge.style.display = 'none';
                container.appendChild(badge);
            }
        }

        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => switchLanguage(e.target.dataset.lang));
        });
        Papa.parse(CSV_URL, {
            download: true, header: true, skipEmptyLines: true,
            complete: (res) => { globalData = res.data; buildMenu(); initEvents(); },
            error: (err) => { console.error(err); els.loader.textContent = "Errore CSV."; }
        });
    }

    function switchLanguage(lang) {
        currentLang = lang;
        const dict = I18N[lang];
        
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
        document.getElementById('footer-service').textContent = dict.service;
        document.getElementById('footer-allergens').textContent = dict.allergenDisclaimer;
        els.searchInput.placeholder = dict.search;
        
        if(els.clearSearchLink) els.clearSearchLink.textContent = dict.resetLink;
        if(els.clearSearchLink && els.clearSearchLink.parentElement) {
            els.clearSearchLink.parentElement.firstChild.textContent = dict.tryAgain + " ";
        }
        
        buildMenu();
    }

    function cleanText(text) {
        if (!text) return '';
        let cleaned = text.trim();
        if (cleaned === '""' || cleaned === '"') return '';
        return cleaned.replace(/\.$/, '');
    }

    function buildMenu() {
        els.container.querySelectorAll('section:not(#no-results)').forEach(e => e.remove());
        if(els.desktopNav) els.desktopNav.innerHTML = '';
        if(els.mobileNavList) els.mobileNavList.innerHTML = '';
        els.loader.style.display = 'none';

        const dict = I18N[currentLang];
        const grouped = {};
        
        // Raggruppa i dati dal CSV
        globalData.forEach(row => {
            const cat = row.Categoria ? row.Categoria.trim() : null;
            if(!cat) return;
            if(!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(row);
        });

        // --- LOGICA INTELLIGENTE PER L'ORDINE ---
        let finalOrder = [...CATEGORY_ORDER]; // Copia l'ordine standard iniziale
        const ora = new Date().getHours();
        
        // ORARIO PRANZO (11:00 - 16:00): Panini e Spuntini vincono
        if (ora >= 11 && ora < 16) {
            const priority = ["Caffetteria", "Bevande", "Panini & Piadine", "Spuntini", "Birre"];
            // Mette i priority all'inizio, il resto segue
            finalOrder = priority.concat(finalOrder.filter(c => !priority.includes(c)));
            // console.log("Modo Pranzo Attivo");
        }
        // ORARIO APERITIVO/SERA (17:00 in poi): Alcol vince
        else if (ora >= 17) {
            const priority = ["Spritz", "Vini", "Franciacorta", "Cocktails", "Birre", "Gin & Tonic"];
            finalOrder = priority.concat(finalOrder.filter(c => !priority.includes(c)));
            // console.log("Modo Aperitivo Attivo");
        }
        // ALTRIMENTI (Mattina): Rimane l'ordine standard del CSV/Config
        // ----------------------------------------

        // Ordina le categorie presenti nel CSV secondo la logica temporale
        const cats = Object.keys(grouped).sort((a,b) => {
            let iA = finalOrder.indexOf(a), iB = finalOrder.indexOf(b);
            // Se una categoria non è nella lista, va in fondo (999)
            return (iA===-1?999:iA) - (iB===-1?999:iB);
        });

        // Costruisce l'HTML
        cats.forEach(catKey => {
            const sec = document.createElement('section');
            // Crea ID pulito (es. "Tè & Cioccolate" -> "t-cioccolate")
            const id = catKey.toLowerCase()
                .replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e") // Gestione accenti base
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); // Pulizia caratteri strani
            
            sec.id = id;
            
            const displayTitle = dict.cats[catKey] || catKey;
            let sub = "";
            if(catKey.toLowerCase().includes('panini')) sub = `<p style="text-align:center;color:#666;margin-bottom:15px;">${dict.paniniSub}</p>`;
            
            sec.innerHTML = `<h2>${displayTitle}</h2>${sub}`;
            const ul = document.createElement('ul');

            grouped[catKey].forEach(row => {
                const li = document.createElement('li');
                li.className = 'menu-item';
                
                const nome = cleanText((currentLang === 'en' && row.Nome_EN) ? row.Nome_EN : row.Nome);
                const descList = cleanText(row.Descrizione_Lista);
                
                let descContentForInfo = "";
                if(row.Tipo === 'info') {
                    descContentForInfo = cleanText((currentLang === 'en' && row.Descrizione_EN) ? row.Descrizione_EN : row.Descrizione_Popup);
                }

                const descPopup = cleanText((currentLang === 'en' && row.Descrizione_EN) ? row.Descrizione_EN : row.Descrizione_Popup);
                const tipo = row.Tipo ? row.Tipo.trim().toLowerCase() : '';
                const grado = row.Grado ? row.Grado.trim() : ''; 
                const popupTitle = row.Titolo_Popup ? row.Titolo_Popup.trim() : "Dettagli"; 

                const ignoreAllergens = (catKey.toLowerCase().includes('panini') || catKey.toLowerCase().includes('spuntini'));
                const allergeni = ignoreAllergens ? '' : (row.Allergeni || '');

                if(tipo === 'spirit' || tipo === 'recipe') li.classList.add('spirit-item');
                
                if(tipo === 'info') {
                    li.classList.add('info-item');
                    li.innerHTML = `<span class="item-name">${nome}</span><span class="item-description">${descContentForInfo}</span>`;
                    ul.appendChild(li);
                    return; 
                }

                li.dataset.name = nome; 
                li.dataset.desc = descPopup; 
                li.dataset.recipe = row.Ricetta || ''; 
                li.dataset.allergens = allergeni; 
                li.dataset.strength = grado; 
                li.dataset.popuptitle = popupTitle; 

                let prezzoHtml = `<span class="item-price">${row.Prezzo || ''}</span>`;
                if(row.Prezzo && row.Prezzo.includes('|')) {
                    prezzoHtml = `<span class="item-price-multi">` + row.Prezzo.split('|').map(p=>`<span class="item-price">${p.trim()}</span>`).join('') + `</span>`;
                }

                let descHtml = '';
                if(descList) { 
                    descHtml = `<span class="item-description">${descList}</span>`; 
                }

                li.innerHTML = `<span class="item-name">${nome}</span>${prezzoHtml}${descHtml}`;
                ul.appendChild(li);
            });
            sec.appendChild(ul);
            els.container.appendChild(sec);

            const aDesk = document.createElement('a'); aDesk.href = `#${id}`; aDesk.textContent = displayTitle;
            if(els.desktopNav) els.desktopNav.appendChild(aDesk);
            const liMob = document.createElement('li'); liMob.innerHTML = `<a href="#${id}">${displayTitle}</a>`;
            if(els.mobileNavList) els.mobileNavList.appendChild(liMob);
        });
    }

    function initEvents() {
        // --- 1. GESTIONE SCROLL MENU ---
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', function(e) {
                if(this.id === 'clear-search-link') return;
                e.preventDefault();
                deactivateSearch();
                closePopup();
                const t = document.querySelector(this.getAttribute('href'));
                if(t) window.scrollTo({top: t.offsetTop - 60, behavior: 'smooth'});
            });
        });

        // --- 2. GESTIONE RICERCA E TRACKING GOOGLE ---
        if(els.searchTrigger && els.searchInput) {
            
            // Attiva/Disattiva barra ricerca
            els.searchTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if(els.stickyNav.classList.contains('search-active')) {
                    deactivateSearch();
                } else {
                    activateSearch();
                }
            });

            // Timer per non mandare 1000 eventi a Google mentre scrivi
            let searchTimer;

            // Logica mentre scrivi
            els.searchInput.addEventListener('input', () => {
                const term = els.searchInput.value.toLowerCase().trim();
                const dict = I18N[currentLang];
                let found = false;

                // Filtra le sezioni e i prodotti
                document.querySelectorAll('section:not(#no-results)').forEach(sec => {
                    let hasVis = false;
                    sec.querySelectorAll('.menu-item').forEach(item => {
                        const text = (item.innerText + " " + (item.dataset.desc||"")).toLowerCase();
                        const vis = text.includes(term);
                        item.style.display = vis ? 'flex' : 'none';
                        if(vis) hasVis = true;
                    });
                    sec.style.display = hasVis ? 'block' : 'none';
                    if(hasVis) found = true;
                });

                // Gestione "Nessun Risultato"
                if (!found && term.length > 0) {
                    els.noResultsSection.style.display = 'flex'; 
                    if(els.noResultsMsg) {
                        els.noResultsMsg.innerHTML = `${dict.noResPart1} "<strong style="color:#d9534f;">${els.searchInput.value}</strong>".`;
                    }
                } else {
                    els.noResultsSection.style.display = 'none';
                }

                // --- TRACKING GOOGLE ANALYTICS (DEBOUNCE 2 SECONDI) ---
                clearTimeout(searchTimer); // Resetta il timer se l'utente sta ancora scrivendo
                if(term.length > 2) { // Traccia solo se ha scritto almeno 3 lettere
                    searchTimer = setTimeout(() => {
                        if (typeof gtag === 'function') {
                            gtag('event', 'search', { search_term: term });
                            // console.log("Google Search Tracked: " + term); 
                        }
                    }, 2000); // Aspetta 2 secondi di pausa prima di inviare
                }
                // -----------------------------------------------------
            });
        }

        // --- 3. GESTIONE CLICK POPUP (APERTURA) ---
        document.querySelector('main').addEventListener('click', (e) => {
            const item = e.target.closest('.spirit-item');
            if(item) openPopup(item);
        });

        // --- 4. GESTIONE TASTI POPUP (CHIUSURA E INFO) ---
        document.getElementById('popup-close-btn').onclick = closePopup;
        
        document.getElementById('toggle-prep-btn').onclick = function(e) {
            e.stopPropagation();
            const cont = document.getElementById('popup-preparation-container');
            const isVis = cont.style.display === 'block';
            cont.style.display = isVis ? 'none' : 'block';
            const dict = I18N[currentLang];
            this.innerHTML = isVis ? `<i class="fas fa-chevron-down"></i> ${dict.detailsBtn}` : `<i class="fas fa-chevron-up"></i> ${dict.hideBtn}`;
        };

        // --- 5. RESET RICERCA ---
        if(els.clearSearchLink) {
            els.clearSearchLink.addEventListener('click', (e) => {
                e.preventDefault();
                deactivateSearch();
            });
        }
    }
    function activateSearch() {
        els.stickyNav.classList.add('search-active');
        setTimeout(() => els.searchInput.focus(), 100);
    }

    function deactivateSearch() {
        els.stickyNav.classList.remove('search-active');
        els.searchInput.value = '';
        els.searchInput.blur();
        document.querySelectorAll('section').forEach(s => s.style.display = '');
        document.querySelectorAll('.menu-item').forEach(i => i.style.display = '');
        if(els.noResultsSection) els.noResultsSection.style.display = 'none';
    }



    function openPopup(el) {
        const name = el.dataset.name;
        const desc = el.dataset.desc;
        const rawRecipe = el.dataset.recipe; 
        const allergensCode = el.dataset.allergens;
        const strength = el.dataset.strength; 
        const popupTitleText = el.dataset.popuptitle; 
        
        const dict = I18N[currentLang];

        els.popup.querySelector('#popup-product-name').innerText = name;
        els.popup.querySelector('#popup-product-description').innerText = desc || '';
        
        // Gestione Allergeni
        const algDiv = document.getElementById('popup-allergens');
        if(allergensCode) {
            let algText = [];
            allergensCode.split(/[,\s]+/).forEach(c => {
                if(ALLERGEN_LABELS[c.trim()]) algText.push(ALLERGEN_LABELS[c.trim()]);
            });
            if(algText.length > 0) {
                algDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <strong>${dict.allergenPrefix}</strong> ` + algText.join(", ");
                algDiv.style.display = 'block';
            } else { algDiv.style.display = 'none'; }
        } else { algDiv.style.display = 'none'; }

        // Gestione Preparazione e Badge
        const prepContainer = document.getElementById('popup-preparation-container');
        const prepText = document.getElementById('popup-preparation-text');
        const toggleBtn = document.getElementById('toggle-prep-btn');
        const strengthBadge = document.getElementById('popup-strength');

        const prepTitle = prepContainer.querySelector('h5');
        if(prepTitle) prepTitle.textContent = popupTitleText;

        toggleBtn.style.display = 'none';
        prepContainer.style.display = 'none';

        if(strength && strengthBadge) {
            strengthBadge.textContent = strength;
            const cleanClass = strength.trim().toLowerCase().replace(/[\s%]+/g, '-');
            strengthBadge.className = `strength-badge strength-${cleanClass}`;
            strengthBadge.style.display = 'inline-block';
        } else if(strengthBadge) {
            strengthBadge.style.display = 'none';
        }

        if(rawRecipe) {
            prepText.innerHTML = rawRecipe; 
            toggleBtn.style.display = 'block';
            toggleBtn.innerHTML = `<i class="fas fa-chevron-down"></i> ${dict.detailsBtn}`;
        } else if (strength) {
            prepText.innerHTML = ''; 
            prepContainer.style.display = 'block'; 
        }

        // --- GOOGLE ANALYTICS TRACKING ---
        // Spara l'evento "visualizza_prodotto" a Google
        if (typeof gtag === 'function') {
            gtag('event', 'visualizza_prodotto', {
                'event_category': 'Menu Interaction',
                'event_label': name,
                'value': 1
            });
        }
        // --------------------------------

        els.popup.classList.add('visible');
    }

    function closePopup() {
        els.popup.classList.remove('visible');
    }

    function setSeasonalHeader() {
        const h = document.querySelector('header');
        const d = new Date(), m = d.getMonth(), day = d.getDate();
        if ((m===11 && day>=8) || (m===0 && day<=6)) h.style.backgroundImage = "url('https://bar-menu.github.io/Nuovo-Natale.jpg')";
    }

    init();
});