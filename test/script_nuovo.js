document.addEventListener('DOMContentLoaded', () => {
    const CSV_URL = 'menu_nuovo.csv'; 
    const CATEGORY_ORDER = ["Caffetteria", "Bevande", "Spritz", "Cocktails", "Vini", "Franciacorta", "Birre", "Gin", "Rum", "Whisky", "Amari e Liquori", "Grappe", "Vermouth", "Vodka", "Brandy", "Spuntini", "Panini & Piadine"];
    const ginPairings = { "amuerte": "Indian o Light", "bombay": "Indian", "hendrick": "Elderflower/Cucumber", "gin mare": "Mediterranean", "malfy": "Mediterranean" }; // (Abbreviato per leggibilità, funziona uguale)

    // Elementi DOM
    const els = {
        container: document.getElementById('menu-container'),
        mobileNavList: document.querySelector('#quick-nav-mobile-sticky ul'),
        desktopNav: document.getElementById('quick-nav'),
        loader: document.getElementById('loading-message'),
        searchTriggers: [document.getElementById('sticky-search-trigger')],
        searchInput: document.getElementById('sticky-search-input'),
        stickyNav: document.getElementById('quick-nav-mobile-sticky'),
        popup: document.getElementById('gin-description-popup'),
        modal: document.getElementById('recipe-modal')
    };

    function init() {
        setSeasonalHeader();
        Papa.parse(CSV_URL, {
            download: true, header: true, skipEmptyLines: true,
            complete: (res) => { buildMenu(res.data); initEvents(); },
            error: (err) => { console.error(err); els.loader.textContent = "Errore CSV."; }
        });
    }

    function buildMenu(data) {
        els.loader.style.display = 'none';
        const grouped = {};
        
        // Raggruppa
        data.forEach(row => {
            const cat = row.Categoria ? row.Categoria.trim() : null;
            if(!cat) return;
            if(!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(row);
        });

        // Ordina Categorie
        const cats = Object.keys(grouped).sort((a,b) => {
            let iA = CATEGORY_ORDER.indexOf(a), iB = CATEGORY_ORDER.indexOf(b);
            return (iA===-1?999:iA) - (iB===-1?999:iB);
        });

        cats.forEach(cat => {
            // 1. Crea Sezione Pagina
            const sec = document.createElement('section');
            const id = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            sec.id = id;
            sec.innerHTML = `<h2>${cat}</h2>`;
            
            const ul = document.createElement('ul');
            grouped[cat].forEach(row => {
                const li = document.createElement('li');
                li.className = 'menu-item';
                
                // Classi speciali
                const tipo = row.Tipo ? row.Tipo.trim().toLowerCase() : '';
                if(tipo === 'spirit') li.classList.add('spirit-item');
                if(tipo === 'recipe') li.classList.add('recipe-item');

                // Dati nascosti
                if(row.Descrizione) li.dataset.desc = row.Descrizione;
                if(row.Ricetta) li.dataset.recipe = row.Ricetta;

                // Prezzo
                let prezzoHtml = `<span class="item-price">${row.Prezzo || ''}</span>`;
                if(row.Prezzo && row.Prezzo.includes('|')) {
                    prezzoHtml = `<span class="item-price-multi">` + row.Prezzo.split('|').map(p=>`<span class="item-price">${p.trim()}</span>`).join('') + `</span>`;
                }

                // Descrizione visibile (se non è spirit/recipe)
                let descHtml = '';
                if(row.Descrizione && tipo !== 'spirit' && tipo !== 'recipe') {
                    descHtml = `<span class="item-description">${row.Descrizione}</span>`;
                }

                li.innerHTML = `<span class="item-name">${row.Nome}</span>${prezzoHtml}${descHtml}`;
                ul.appendChild(li);
            });
            sec.appendChild(ul);
            els.container.appendChild(sec);

            // 2. Crea Link Nav Desktop
            const aDesk = document.createElement('a');
            aDesk.href = `#${id}`; aDesk.textContent = cat;
            if(els.desktopNav) els.desktopNav.appendChild(aDesk);

            // 3. Crea Link Nav Mobile Sticky
            const liMob = document.createElement('li');
            liMob.innerHTML = `<a href="#${id}">${cat}</a>`;
            if(els.mobileNavList) els.mobileNavList.appendChild(liMob);
        });
    }

    function initEvents() {
        // Navigazione
        document.querySelectorAll('a[href^="#"]').forEach(a => {
            a.addEventListener('click', function(e) {
                e.preventDefault();
                closeAll();
                const t = document.querySelector(this.getAttribute('href'));
                if(t) window.scrollTo({top: t.offsetTop - 60, behavior: 'smooth'});
            });
        });

        // Ricerca Mobile
        els.searchTriggers.forEach(btn => {
            if(btn) btn.addEventListener('click', (e) => {
                e.stopPropagation();
                els.stickyNav.classList.toggle('search-active');
                if(els.stickyNav.classList.contains('search-active')) setTimeout(()=>els.searchInput.focus(), 100);
            });
        });

        if(els.searchInput) {
            els.searchInput.addEventListener('input', function() {
                const term = this.value.toLowerCase().trim();
                let found = false;
                document.querySelectorAll('section').forEach(sec => {
                    if(sec.id === 'no-results') return;
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
                document.getElementById('no-results').style.display = (!found && term) ? 'block' : 'none';
            });
        }

        // Click Item (Popup & Modal)
        document.querySelector('main').addEventListener('click', (e) => {
            const spirit = e.target.closest('.spirit-item');
            const recipe = e.target.closest('.recipe-item');

            if (spirit) openSpiritPopup(spirit);
            else if (recipe) openRecipeModal(recipe);
        });

        // Chiudi Popup/Modal
        document.getElementById('popup-close-btn').onclick = closeAll;
        document.getElementById('modal-recipe-close-btn').onclick = closeAll;
        document.getElementById('toggle-prep-btn').onclick = function(e) {
            e.stopPropagation();
            const cont = document.getElementById('popup-preparation-container');
            const isVis = cont.style.display === 'block';
            cont.style.display = isVis ? 'none' : 'block';
            this.innerHTML = isVis ? '<i class="fas fa-chevron-down"></i> Dettagli' : '<i class="fas fa-chevron-up"></i> Nascondi';
        };
    }

    function openSpiritPopup(el) {
        const name = el.querySelector('.item-name').innerText;
        const desc = el.dataset.desc || '';
        
        els.popup.querySelector('#popup-product-name').innerText = name;
        els.popup.querySelector('#popup-product-description').innerText = desc;
        
        // Logica Pairing (Semplificata)
        const pairingDiv = document.getElementById('popup-pairing-content');
        let pair = '';
        for(let k in ginPairings) { if(name.toLowerCase().includes(k)) pair = ginPairings[k]; }
        
        if(pair) {
            pairingDiv.innerHTML = `<strong>Abbinamento:</strong> ${pair}`;
            document.getElementById('toggle-prep-btn').style.display = 'block';
        } else {
            document.getElementById('toggle-prep-btn').style.display = 'none';
        }
        
        document.getElementById('popup-preparation-container').style.display = 'none'; // Resetta chiusura
        els.popup.classList.add('visible');
    }

    function openRecipeModal(el) {
        const name = el.querySelector('.item-name').innerText;
        const raw = el.dataset.recipe || '';
        els.modal.querySelector('#modal-recipe-name').innerText = name;
        
        const ul = els.modal.querySelector('#modal-recipe-ingredients ul'); ul.innerHTML = '';
        const divMeth = els.modal.querySelector('#modal-recipe-method'); divMeth.innerHTML = '<h5>Metodo</h5>';

        if(raw) {
            const parts = raw.split('---'); // Assumiamo separatore "---"
            const linesIngr = (parts[0] || '').split('\n');
            const linesMeth = (parts[1] || '').split('\n');

            linesIngr.forEach(l => { if(l.trim() && !l.includes('INGREDIENTI')) { 
                const li = document.createElement('li'); li.innerText = l.replace('-','').trim(); ul.appendChild(li); 
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
        const d = new Date();
        const m = d.getMonth();
        const day = d.getDate();
        const h = document.querySelector('header');
        // Logica base (aggiungi le altre se vuoi)
        if ((m===11 && day>=8) || (m===0 && day<=6)) h.style.backgroundImage = "url('https://bar-menu.github.io/Nuovo-Natale.jpg')";
    }

    init();
});