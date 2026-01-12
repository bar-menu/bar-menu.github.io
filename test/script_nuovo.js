document.addEventListener('DOMContentLoaded', () => {
    const CSV_URL = 'menu_nuovo.csv'; 
    
    // I18N
    const I18N = {
        it: {
            cats: { "Caffetteria":"Caffetteria", "Bevande":"Bevande", "Spritz":"Spritz", "Cocktails":"Cocktails", "Vini":"Vini", "Franciacorta":"Franciacorta", "Birre":"Birre", "Gin & Tonic":"Gin & Tonic", "Rum":"Rum", "Whisky":"Whisky", "Amari e Liquori":"Amari", "Grappe":"Grappe", "Vermouth":"Vermouth", "Vodka":"Vodka", "Brandy":"Brandy", "Spuntini":"Spuntini", "Panini & Piadine":"Panini & Piadine" },
            paniniSub: "Componi il tuo panino!",
            detailsBtn: "Dettagli",
            hideBtn: "Nascondi",
            search: "Cerca...",
            noRes: "Nessun risultato.",
            service: "Servizio al tavolo incluso",
            allergenDisclaimer: "Per allergie o intolleranze rivolgersi al personale.",
            allergenPrefix: "Contiene:",
            pairingPrefix: "Consiglio:"
        },
        en: {
            cats: { "Caffetteria":"Coffee", "Bevande":"Soft Drinks", "Spritz":"Spritz & Co.", "Cocktails":"Cocktails", "Vini":"Wines", "Franciacorta":"Sparkling", "Birre":"Beers", "Gin & Tonic":"Gin & Tonic", "Rum":"Rum", "Whisky":"Whisky", "Amari e Liquori":"Bitters & Liqueurs", "Grappe":"Grappa", "Vermouth":"Vermouth", "Vodka":"Vodka", "Brandy":"Brandy", "Spuntini":"Snacks", "Panini & Piadine":"Sandwiches" },
            paniniSub: "Build your own sandwich!",
            detailsBtn: "Details",
            hideBtn: "Hide",
            search: "Search...",
            noRes: "No results found.",
            service: "Table service included",
            allergenDisclaimer: "For allergies and intolerances please ask the staff.",
            allergenPrefix: "Contains:",
            pairingPrefix: "Pairing:"
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
        searchTriggers: [document.getElementById('sticky-search-trigger')],
        searchInput: document.getElementById('sticky-search-input'),
        searchClear: document.getElementById('sticky-search-clear'),
        stickyNav: document.getElementById('quick-nav-mobile-sticky'),
        popup: document.getElementById('gin-description-popup'),
        modal: document.getElementById('recipe-modal')
    };

    function init() {
        setSeasonalHeader();
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
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
        document.getElementById('footer-service').textContent = I18N[lang].service;
        document.getElementById('footer-allergens').textContent = I18N[lang].allergenDisclaimer;
        document.getElementById('no-results-text').textContent = I18N[lang].noRes;
        document.getElementById('clear-search-link').textContent = (lang === 'en') ? "Show all" : "Mostra tutto";
        els.searchInput.placeholder = I18N[lang].search;
        buildMenu();
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

        const cats = Object.keys(grouped).sort((a,b) => {
            let iA = CATEGORY_ORDER.indexOf(a), iB = CATEGORY_ORDER.indexOf(b);
            return (iA===-1?999:iA) - (iB===-1?999:iB);
        });

        cats.forEach(catKey => {
            const sec = document.createElement('section');
            const id = catKey.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            sec.id = id;
            
            const displayTitle = dict.cats[catKey] || catKey;
            let sub = "";
            if(catKey.toLowerCase().includes('panini')) sub = `<p style="text-align:center;color:#666;margin-bottom:15px;">${dict.paniniSub}</p>`;
            
            sec.innerHTML = `<h2>${displayTitle}</h2>${sub}`;
            const ul = document.createElement('ul');

            grouped[catKey].forEach(row => {
                const li = document.createElement('li');
                li.className = 'menu-item';
                
                const nome = (currentLang === 'en' && row.Nome_EN) ? row.Nome_EN : row.Nome;
                const desc = (currentLang === 'en' && row.Descrizione_EN) ? row.Descrizione_EN : row.Descrizione;
                const tipo = row.Tipo ? row.Tipo.trim().toLowerCase() : '';

                if(tipo === 'spirit') li.classList.add('spirit-item');
                if(tipo === 'recipe') li.classList.add('recipe-item');
                if(tipo === 'info') {
                    li.innerHTML = `<span style="width:100%;text-align:center;font-style:italic;color:#666;font-size:0.9em;">${nome}</span>`;
                    li.style.borderBottom = "none";
                    ul.appendChild(li);
                    return;
                }

                li.dataset.name = nome; 
                li.dataset.desc = desc || ''; 
                li.dataset.recipe = row.Ricetta; 
                li.dataset.allergens = row.Allergeni || ''; 

                let prezzoHtml = `<span class="item-price">${row.Prezzo || ''}</span>`;
                if(row.Prezzo && row.Prezzo.includes('|')) {
                    prezzoHtml = `<span class="item-price-multi">` + row.Prezzo.split('|').map(p=>`<span class="item-price">${p.trim()}</span>`).join('') + `</span>`;
                }

                // CORREZIONE: Mostra la descrizione SEMPRE se esiste (non nasconderla più per ricette/spirit)
                let descHtml = '';
                if(desc) { descHtml = `<span class="item-description">${desc}</span>`; }

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
                e.preventDefault();
                closeAll();
                const t = document.querySelector(this.getAttribute('href'));
                if(t) window.scrollTo({top: t.offsetTop - 60, behavior: 'smooth'});
            });
        });

        if(els.searchInput) {
            const doFilter = function() {
                const term = els.searchInput.value.toLowerCase().trim();
                if (els.searchClear) els.searchClear.classList.toggle('show-x', term.length > 0);
                
                let found = false;
                document.querySelectorAll('section:not(#no-results)').forEach(sec => {
                    let hasVis = false;
                    sec.querySelectorAll('.menu-item').forEach(item => {
                        const text = item.innerText.toLowerCase();
                        const vis = text.includes(term);
                        item.style.display = vis ? 'flex' : 'none';
                        if(vis) hasVis = true;
                    });
                    sec.style.display = hasVis ? 'block' : 'none';
                    if(hasVis) found = true;
                });
                document.getElementById('no-results').style.display = (!found && term) ? 'flex' : 'none';
            };

            els.searchInput.addEventListener('input', doFilter);
            
            if(els.searchClear) {
                els.searchClear.addEventListener('click', function(e) {
                    e.preventDefault(); e.stopPropagation();
                    els.searchInput.value = ''; doFilter(); els.searchInput.focus();
                });
            }
            
            els.searchTriggers.forEach(btn => {
                if(btn) btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    els.stickyNav.classList.toggle('search-active');
                    if(els.stickyNav.classList.contains('search-active')) setTimeout(()=>els.searchInput.focus(), 100);
                });
            });
        }

        document.querySelector('main').addEventListener('click', (e) => {
            const spirit = e.target.closest('.spirit-item');
            const recipe = e.target.closest('.recipe-item');
            if (spirit) openSpiritPopup(spirit);
            else if (recipe) openRecipeModal(recipe);
        });

        document.getElementById('popup-close-btn').onclick = closeAll;
        document.getElementById('modal-recipe-close-btn').onclick = closeAll;
        document.getElementById('toggle-prep-btn').onclick = function(e) {
            e.stopPropagation();
            const cont = document.getElementById('popup-preparation-container');
            const isVis = cont.style.display === 'block';
            cont.style.display = isVis ? 'none' : 'block';
            const dict = I18N[currentLang];
            this.innerHTML = isVis ? `<i class="fas fa-chevron-down"></i> ${dict.detailsBtn}` : `<i class="fas fa-chevron-up"></i> ${dict.hideBtn}`;
        };
    }

    function openSpiritPopup(el) {
        const name = el.querySelector('.item-name').innerText;
        const desc = el.dataset.desc || '';
        const allergensCode = el.dataset.allergens || '';
        
        els.popup.querySelector('#popup-product-name').innerText = name;
        els.popup.querySelector('#popup-product-description').innerText = desc; 
        
        const algDiv = document.getElementById('popup-allergens');
        const dict = I18N[currentLang];
        
        if(allergensCode) {
            let algText = [];
            allergensCode.split(/[,\s]+/).forEach(c => {
                if(ALLERGEN_LABELS[c.trim()]) algText.push(ALLERGEN_LABELS[c.trim()]);
            });
            if(algText.length > 0) {
                algDiv.innerHTML = `<strong>${dict.allergenPrefix}</strong> ` + algText.join(", ");
                algDiv.style.display = 'block';
            } else { algDiv.style.display = 'none'; }
        } else { algDiv.style.display = 'none'; }

        document.getElementById('toggle-prep-btn').style.display = 'none'; 
        els.popup.classList.add('visible');
    }

    function openRecipeModal(el) {
        const name = el.querySelector('.item-name').innerText;
        const raw = el.dataset.recipe || '';
        els.modal.querySelector('#modal-recipe-name').innerText = name;
        
        const ul = els.modal.querySelector('#modal-recipe-ingredients ul'); ul.innerHTML = '';
        const divMeth = els.modal.querySelector('#modal-recipe-method'); divMeth.innerHTML = ''; 

        if(raw) {
            const parts = raw.split('---');
            const linesIngr = (parts[0] || '').split('\n');
            const linesMeth = (parts[1] || '').split('\n');
            linesIngr.forEach(l => { if(l.trim() && !l.includes('INGREDIENTI')) { 
                const li = document.createElement('li'); li.innerHTML = l.replace('-','').trim(); ul.appendChild(li); 
            }});
            linesMeth.forEach(l => { if(l.trim() && !l.includes('METODO')) { 
                const p = document.createElement('p'); p.innerText = l.trim(); divMeth.appendChild(p); 
            }});
        }
        els.modal.classList.add('visible');
    }

    function closeAll() {
        els.popup.classList.remove('visible');
        els.modal.classList.remove('visible');
        els.stickyNav.classList.remove('search-active');
    }

    function setSeasonalHeader() {
        const h = document.querySelector('header');
        const d = new Date(), m = d.getMonth(), day = d.getDate();
        if ((m===11 && day>=8) || (m===0 && day<=6)) h.style.backgroundImage = "url('https://bar-menu.github.io/Nuovo-Natale.jpg')";
    }

    init();
});