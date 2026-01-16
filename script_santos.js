document.addEventListener('DOMContentLoaded', () => {
    
    const CSV_URL = 'menu_santos.csv'; 
    
    // TRADUZIONI INTERFACCIA (Titoli categorie, bottoni, ecc.)
    const I18N = {
        it: {
            cats: { 
                "Caffetteria":"Caffetteria", 
                "Tè & Cioccolate":"Tè & Cioccolate",
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
            service: "Servizio al tavolo incluso",
            allergenPrefix: "Allergeni:",
            prepTitle: "Preparazione / Dettagli:"
        },
        en: {
            cats: { 
                "Caffetteria":"Coffee", 
                "Tè & Cioccolate":"Tea & Chocolate",
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
            service: "Table service included",
            allergenPrefix: "Allergens:",
            prepTitle: "Preparation / Details:"
        }
    };

    const ALLERGEN_LABELS = { 'G': 'Glutine/Gluten', 'L': 'Lattosio/Lactose', 'V': 'Vegano/Vegan', 'N': 'Nocciole/Nuts', 'Soia': 'Soia/Soy' };
    const CATEGORY_ORDER = Object.keys(I18N.it.cats);
    
    let currentLang = 'it'; // Lingua di default
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
        
        // GESTIONE CLICK LINGUA
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.target.dataset.lang;
                if(lang) switchLanguage(lang);
            });
        });

        Papa.parse(CSV_URL, {
            download: true, header: true, skipEmptyLines: true,
            complete: (res) => { 
                globalData = res.data; 
                buildMenu(); 
                initEvents(); 
                initScrollSpy(); 
            },
            error: (err) => { console.error(err); els.loader.textContent = "Errore CSV."; }
        });
    }

    // --- FUNZIONE CAMBIO LINGUA (Mancava questa!) ---
    function switchLanguage(lang) {
        if(currentLang === lang) return; // Se clicchi la stessa, non fare nulla
        currentLang = lang;
        const dict = I18N[lang];
        
        // Aggiorna classe active sui bottoni
        document.querySelectorAll('.lang-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.lang === lang);
        });

        // Aggiorna testi fissi
        document.getElementById('footer-service').textContent = dict.service;
        els.searchInput.placeholder = dict.search;
        
        // Ridisegna il menu con la nuova lingua
        buildMenu();
        // Riattiva lo ScrollSpy sui nuovi elementi
        initScrollSpy();
    }

    // Funzione pulizia testo (rimuove virgolette strane di Excel)
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
        
        globalData.forEach(row => {
            const cat = row.Categoria ? row.Categoria.trim() : null;
            if(!cat) return;
            if(!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(row);
        });

        // LOGICA ORARIO
        let finalOrder = [...CATEGORY_ORDER]; 
        const ora = new Date().getHours();
        
        if (ora >= 11 && ora < 15) {
            const priority = ["Panini & Piadine", "Spuntini", "Bevande", "Birre"];
            finalOrder = priority.concat(finalOrder.filter(c => !priority.includes(c)));
        }
        else if (ora >= 18) {
            const priority = ["Spritz", "Vini", "Franciacorta", "Cocktails", "Birre", "Gin & Tonic"];
            finalOrder = priority.concat(finalOrder.filter(c => !priority.includes(c)));
        }

        const cats = Object.keys(grouped).sort((a,b) => {
            let iA = finalOrder.indexOf(a), iB = finalOrder.indexOf(b);
            return (iA===-1?999:iA) - (iB===-1?999:iB);
        });

        cats.forEach(catKey => {
            const sec = document.createElement('section');
            const id = catKey.toLowerCase().replace(/[àáâãäå]/g,"a").replace(/[èéêë]/g,"e").replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            sec.id = id;
            
            const displayTitle = dict.cats[catKey] || catKey;
            let sub = "";
            if(catKey.toLowerCase().includes('panini')) sub = `<p style="text-align:center;color:#666;margin-bottom:15px;font-size:0.9em;">${dict.paniniSub}</p>`;
            
            sec.innerHTML = `<h2>${displayTitle}</h2>${sub}`;
            const ul = document.createElement('ul');

            grouped[catKey].forEach(row => {
                const li = document.createElement('li');
                li.className = 'menu-item';
                
                // --- QUI È LA MAGIA: SCELTA LINGUA ---
                // Se siamo in EN e la colonna Nome_EN esiste, usa quella. Altrimenti usa Nome.
                const nome = cleanText((currentLang === 'en' && row.Nome_EN) ? row.Nome_EN : row.Nome);
                
                // Idem per le descrizioni
                const descList = cleanText(row.Descrizione_Lista);
                const descPopup = cleanText((currentLang === 'en' && row.Descrizione_EN) ? row.Descrizione_EN : row.Descrizione_Popup);
                
                const tipo = row.Tipo ? row.Tipo.trim().toLowerCase() : '';
                const grado = row.Grado ? row.Grado.trim() : ''; 
                const popupTitle = row.Titolo_Popup ? row.Titolo_Popup.trim() : "Dettagli"; 

                const ignoreAllergens = (catKey.toLowerCase().includes('panini') || catKey.toLowerCase().includes('spuntini'));
                const allergeni = ignoreAllergens ? '' : (row.Allergeni || '');

                if(tipo === 'spirit' || tipo === 'recipe') li.classList.add('spirit-item');
                
                if(tipo === 'info') {
                    li.classList.add('info-item');
                    // Per le info (Panini), usiamo la descrizione popup tradotta come testo visibile
                    li.innerHTML = `<span class="item-name">${nome}</span><span class="item-description">${descPopup || ''}</span>`;
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

        if(els.searchTrigger && els.searchInput) {
            els.searchTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if(els.stickyNav.classList.contains('search-active')) deactivateSearch();
                else activateSearch();
            });

            let searchTimer;
            els.searchInput.addEventListener('input', () => {
                const term = els.searchInput.value.toLowerCase().trim();
                let found = false;

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

                if (!found && term.length > 0) {
                    els.noResultsSection.style.display = 'flex'; 
                    if(els.noResultsMsg) els.noResultsMsg.innerHTML = `Nessun risultato per "<strong>${els.searchInput.value}</strong>".`;
                } else {
                    els.noResultsSection.style.display = 'none';
                }

                clearTimeout(searchTimer);
                if(term.length > 2) { 
                    searchTimer = setTimeout(() => {
                        if (typeof gtag === 'function') {
                            gtag('event', 'search', { search_term: term });
                        }
                    }, 2000); 
                }
            });
        }

        document.querySelector('main').addEventListener('click', (e) => {
            const item = e.target.closest('.spirit-item');
            if(item) openPopup(item);
        });

        document.getElementById('popup-close-btn').onclick = closePopup;
        document.getElementById('toggle-prep-btn').onclick = function(e) {
            e.stopPropagation();
            const cont = document.getElementById('popup-preparation-container');
            const isVis = cont.style.display === 'block';
            cont.style.display = isVis ? 'none' : 'block';
            this.innerHTML = isVis ? `<i class="fas fa-chevron-down"></i> Come si fa?` : `<i class="fas fa-chevron-up"></i> Nascondi`;
        };
        
        if(els.clearSearchLink) {
            els.clearSearchLink.addEventListener('click', (e) => { e.preventDefault(); deactivateSearch(); });
        }
    }

    function initScrollSpy() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    document.querySelectorAll('#quick-nav-mobile-sticky a').forEach(a => a.classList.remove('active'));
                    const id = entry.target.id;
                    const activeLink = document.querySelector(`#quick-nav-mobile-sticky a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                        activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }
            });
        }, { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 });
        document.querySelectorAll('section').forEach(section => observer.observe(section));
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
        const dict = I18N[currentLang]; // Usa il dizionario corrente per le etichette

        els.popup.querySelector('#popup-product-name').innerText = name;
        els.popup.querySelector('#popup-product-description').innerText = desc || '';
        
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

        if (typeof gtag === 'function') {
            gtag('event', 'visualizza_prodotto', {
                'event_category': 'Menu Interaction',
                'event_label': name,
                'value': 1
            });
        }

        els.popup.classList.add('visible');
    }

    function closePopup() {
        els.popup.classList.remove('visible');
    }

function setSeasonalHeader() {
        const h = document.querySelector('header');
        if (!h) return;

        const d = new Date();
        const m = d.getMonth(); // 0 = Gennaio, 11 = Dicembre
        const day = d.getDate();
        const baseUrl = 'https://bar-menu.github.io/';

        // Immagine di base (Santos Rossa Elegante)
        let bgImage = 'Bar_Santos.png';

        // CAPODANNO (1 Gennaio)
        if (m === 0 && day === 1) {
            bgImage = 'Santos-New-Year.jpg';
        }
        // EPIFANIA (6 Gennaio)
        else if (m === 0 && day === 6) {
            bgImage = 'Santos-Epifania.jpg';
        }
        // SAN VALENTINO (14 Febbraio)
        else if (m === 1 && day === 14) {
            bgImage = 'Santos-Valentino.jpg';
        }
        // FERRAGOSTO (15 Agosto)
        else if (m === 7 && day === 15) {
            bgImage = 'Santos-Ferragosto.jpg';
        }
        // NATALE (dall'8 Dicembre al 6 Gennaio)
        else if ((m === 11 && day >= 8) || (m === 0 && day <= 6)) {
            // Se crei un'immagine di natale per il santos, metti il nome qui sotto:
            bgImage = 'Santos-Natale.jpg'; 
        }

        // Applica l'immagine con !important per vincere sul CSS
        h.style.setProperty('background-image', `url('${baseUrl}${bgImage}')`, 'important');
    }

    init();
});