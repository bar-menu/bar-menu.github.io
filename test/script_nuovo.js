document.addEventListener('DOMContentLoaded', () => {
    const CSV_URL = 'menu_nuovo.csv'; 
    
    // Configurazione I18N
    const I18N = {
        it: {
            cats: { "Caffetteria":"Caffetteria", "Bevande":"Bevande", "Spritz":"Spritz & Co.", "Cocktails":"Cocktails", "Vini":"Vini", "Franciacorta":"Franciacorta", "Birre":"Birre", "Gin & Tonic":"Gin & Tonic", "Rum":"Rum", "Whisky":"Whisky", "Amari e Liquori":"Amari", "Grappe":"Grappe", "Vermouth":"Vermouth", "Vodka":"Vodka", "Brandy":"Brandy", "Spuntini":"Spuntini", "Panini & Piadine":"Panini & Piadine" },
            paniniSub: "Componi il tuo panino!",
            detailsBtn: "Come si fa?",
            hideBtn: "Nascondi",
            search: "Cerca...",
            noRes: "Nessun risultato.",
            service: "Servizio al tavolo incluso",
            allergenDisclaimer: "Per allergie o intolleranze rivolgersi al personale.",
            allergenPrefix: "Allergeni:",
            reset: "Mostra tutto"
        },
        en: {
            cats: { "Caffetteria":"Coffee", "Bevande":"Soft Drinks", "Spritz":"Spritz & Co.", "Cocktails":"Cocktails", "Vini":"Wines", "Franciacorta":"Sparkling", "Birre":"Beers", "Gin & Tonic":"Gin & Tonic", "Rum":"Rum", "Whisky":"Whisky", "Amari e Liquori":"Bitters & Liqueurs", "Grappe":"Grappa", "Vermouth":"Vermouth", "Vodka":"Vodka", "Brandy":"Brandy", "Spuntini":"Snacks", "Panini & Piadine":"Sandwiches" },
            paniniSub: "Build your own sandwich!",
            detailsBtn: "How is it made?",
            hideBtn: "Hide",
            search: "Search...",
            noRes: "No results found.",
            service: "Table service included",
            allergenDisclaimer: "For allergies and intolerances please ask the staff.",
            allergenPrefix: "Allergens:",
            reset: "Show all"
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
        searchTrigger: document.getElementById('sticky-search-trigger'), // Il bottone lente/X
        searchInput: document.getElementById('sticky-search-input'),
        stickyNav: document.getElementById('quick-nav-mobile-sticky'),
        popup: document.getElementById('gin-description-popup'),
        clearSearchLink: document.getElementById('clear-search-link')
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
        els.clearSearchLink.textContent = I18N[lang].reset;
        els.searchInput.placeholder = I18N[lang].search;
        buildMenu();
    }

    function cleanText(text) {
        if (!text) return '';
        // Toglie il punto finale se c'è
        return text.trim().replace(/\.$/, '');
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
                
                const nome = cleanText((currentLang === 'en' && row.Nome_EN) ? row.Nome_EN : row.Nome);
                const desc = cleanText((currentLang === 'en' && row.Descrizione_EN) ? row.Descrizione_EN : row.Descrizione);
                const tipo = row.Tipo ? row.Tipo.trim().toLowerCase() : '';
                // Ignora allergeni per i cibi (Spuntini/Panini) come richiesto
                const ignoreAllergens = (catKey.toLowerCase().includes('panini') || catKey.toLowerCase().includes('spuntini'));
                const allergeni = ignoreAllergens ? '' : (row.Allergeni || '');

                if(tipo === 'spirit' || tipo === 'recipe') li.classList.add('spirit-item');
                
                if(tipo === 'info') {
                    li.innerHTML = `<span style="width:100%;text-align:center;font-style:italic;color:#666;font-size:0.9em;">${nome}</span>`;
                    li.style.borderBottom = "none";
                    ul.appendChild(li);
                    return;
                }

                // Dati per il popup
                li.dataset.name = nome; 
                li.dataset.desc = desc; 
                li.dataset.recipe = row.Ricetta || ''; 
                li.dataset.allergens = allergeni; 

                let prezzoHtml = `<span class="item-price">${row.Prezzo || ''}</span>`;
                if(row.Prezzo && row.Prezzo.includes('|')) {
                    prezzoHtml = `<span class="item-price-multi">` + row.Prezzo.split('|').map(p=>`<span class="item-price">${p.trim()}</span>`).join('') + `</span>`;
                }

                // La descrizione appare sempre, stile "Old" (senza punti finali)
                let descHtml = '';
                if(desc) { descHtml = `<span class="item-description">${desc}</span>`; }

                li.innerHTML = `<span class="item-name">${nome}</span>${prezzoHtml}${descHtml}`;
                ul.appendChild(li);
            });
            sec.appendChild(ul);
            els.container.appendChild(sec);

            // Nav link
            const aDesk = document.createElement('a'); aDesk.href = `#${id}`; aDesk.textContent = displayTitle;
            if(els.desktopNav) els.desktopNav.appendChild(aDesk);
            const liMob = document.createElement('li'); liMob.innerHTML = `<a href="#${id}">${displayTitle}</a>`;
            if(els.mobileNavList) els.mobileNavList.appendChild(liMob);
        });
    }

    function initEvents() {
        // Link anchor scrolling
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', function(e) {
                if(this.id === 'clear-search-link') return; // Gestito a parte
                e.preventDefault();
                deactivateSearch();
                closePopup();
                const t = document.querySelector(this.getAttribute('href'));
                if(t) window.scrollTo({top: t.offsetTop - 60, behavior: 'smooth'});
            });
        });

        // Search System - LA LOGICA ORIGINALE
        if(els.searchTrigger && els.searchInput) {
            
            // Click sulla lente (o sulla X quando attivo)
            els.searchTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                if(els.stickyNav.classList.contains('search-active')) {
                    // Se è attivo (X), chiudi ricerca e resetta
                    deactivateSearch();
                } else {
                    // Se non è attivo (Lente), apri
                    activateSearch();
                }
            });

            // Input typing
            els.searchInput.addEventListener('input', () => {
                const term = els.searchInput.value.toLowerCase().trim();
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
            });
        }

        // Popup Open
        document.querySelector('main').addEventListener('click', (e) => {
            const item = e.target.closest('.spirit-item');
            if(item) openPopup(item);
        });

        // Popup Actions
        document.getElementById('popup-close-btn').onclick = closePopup;
        document.getElementById('toggle-prep-btn').onclick = function(e) {
            e.stopPropagation();
            const cont = document.getElementById('popup-preparation-container');
            const isVis = cont.style.display === 'block';
            cont.style.display = isVis ? 'none' : 'block';
            const dict = I18N[currentLang];
            this.innerHTML = isVis ? `<i class="fas fa-chevron-down"></i> ${dict.detailsBtn}` : `<i class="fas fa-chevron-up"></i> ${dict.hideBtn}`;
        };

        // Clear Search Link
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
        // Resetta visibilità
        document.querySelectorAll('section').forEach(s => s.style.display = '');
        document.querySelectorAll('.menu-item').forEach(i => i.style.display = '');
        document.getElementById('no-results').style.display = 'none';
    }

    function openPopup(el) {
        const name = el.dataset.name;
        const desc = el.dataset.desc;
        const rawRecipe = el.dataset.recipe;
        const allergensCode = el.dataset.allergens;
        
        els.popup.querySelector('#popup-product-name').innerText = name;
        els.popup.querySelector('#popup-product-description').innerText = desc || '';
        
        // Allergeni (solo bevande, se presenti)
        const algDiv = document.getElementById('popup-allergens');
        const dict = I18N[currentLang];
        
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

        // Preparazione / Ricetta
        const prepContainer = document.getElementById('popup-preparation-container');
        const prepText = document.getElementById('popup-preparation-text');
        const toggleBtn = document.getElementById('toggle-prep-btn');

        if(rawRecipe) {
            // Formatta la ricetta (sostituisci a capo con <br>)
            // Il CSV usa --- per separare ingredienti e metodo, li uniamo per semplicità o li formattiamo
            const formatted = rawRecipe.replace(/---/g, '<hr style="border:0; border-top:1px dashed #666; margin:10px 0;">').replace(/\n/g, '<br>');
            prepText.innerHTML = formatted;
            toggleBtn.style.display = 'block';
            toggleBtn.innerHTML = `<i class="fas fa-chevron-down"></i> ${dict.detailsBtn}`;
            prepContainer.style.display = 'none'; // Parte chiuso
        } else {
            toggleBtn.style.display = 'none';
            prepContainer.style.display = 'none';
        }

        els.popup.classList.add('visible');
    }

    function closePopup() {
        els.popup.classList.remove('visible');
    }

    function setSeasonalHeader() {
        const h = document.querySelector('header');
        const d = new Date(), m = d.getMonth(), day = d.getDate();
        // Logica festività
        if ((m===11 && day>=8) || (m===0 && day<=6)) h.style.backgroundImage = "url('https://bar-menu.github.io/Nuovo-Natale.jpg')";
    }

    init();
});