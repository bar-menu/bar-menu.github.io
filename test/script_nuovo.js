document.addEventListener('DOMContentLoaded', () => {
    console.log("1. Script avviato correttamente");

    // --- MODIFICA QUI: NOME FILE FISSO ---
    const CSV_URL = 'menu_nuovo.csv'; 
    console.log("2. File CSV target: " + CSV_URL);
    
    const CATEGORY_ORDER = [
        "Caffetteria", "Bevande", "Spritz", "Cocktails", "Vini",
        "Franciacorta", "Birre", "Gin", "Rum", "Whisky",
        "Amari e Liquori", "Grappe", "Vermouth", "Vodka",
        "Brandy", "Spuntini", "Panini & Piadine"
    ];

    const ginPairings = {
        "amuerte": "Indian Premium o Refreshingly Light.", "bombay": "Fever-Tree Indian.", "brockmans": "Fever-Tree Indian o Refreshingly Light.", "bulldog": "Fever-Tree Indian o Mediterranean.", "gin mare": "Fever-Tree Mediterranean.", "hendrick": "Fever-Tree Elderflower o Cucumber.", "malfy": "Mediterranean o Indian.", "monkey 47": "Fever-Tree Premium Indian.", "tanqueray": "Fever-Tree Indian."
    };

    function init() {
        console.log("3. Funzione init() chiamata");
        setSeasonalHeader();
        
        if (typeof Papa === 'undefined') {
            console.error("ERRORE GRAVE: Libreria PapaParse non trovata!");
            document.getElementById('loading-message').textContent = "Errore: Libreria CSV mancante.";
            return;
        }

        console.log("4. Inizio scaricamento CSV: " + CSV_URL);
        Papa.parse(CSV_URL, {
            download: true, 
            header: true, 
            skipEmptyLines: true,
            complete: function(results) { 
                console.log("5. CSV scaricato! Righe trovate: " + results.data.length);
                if (results.data.length === 0) {
                    console.error("ATTENZIONE: Il file CSV sembra vuoto!");
                }
                buildMenu(results.data); 
                initEvents(); 
            },
            error: function(err) { 
                console.error("ERRORE SCARICAMENTO CSV:", err); 
                document.getElementById('loading-message').textContent = "Errore caricamento menu. File non trovato: " + CSV_URL; 
            }
        });
    }

    function buildMenu(data) {
        console.log("6. Costruzione menu in corso...");
        const container = document.getElementById('menu-container');
        const nav = document.getElementById('quick-nav');
        const loader = document.getElementById('loading-message');
        const noRes = document.getElementById('no-results');
        
        if(loader) loader.style.display='none';

        const grouped = {};
        data.forEach(row => {
            const cat = row.Categoria ? row.Categoria.trim() : null;
            if(!cat) return;
            if(!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(row);
        });

        const cats = Object.keys(grouped).sort((a,b) => {
            let iA = CATEGORY_ORDER.indexOf(a), iB = CATEGORY_ORDER.indexOf(b);
            return (iA===-1?999:iA) - (iB===-1?999:iB);
        });

        cats.forEach(cat => {
            const sec = document.createElement('section');
            const id = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            sec.id = id;
            
            let sub = "";
            if(cat.toLowerCase().includes('panini')) sub = `<p style="text-align:center;color:#666;margin-bottom:15px;">Componi il tuo panino!</p>`;
            
            sec.innerHTML = `<h2>${cat}</h2>${sub}`;
            const ul = document.createElement('ul');

            grouped[cat].forEach(row => {
                const li = document.createElement('li');
                li.className = 'menu-item';
                
                const tipo = row.Tipo ? row.Tipo.trim().toLowerCase() : '';
                if(tipo==='spirit') li.classList.add('spirit-item');
                if(tipo==='recipe') li.classList.add('recipe-item');

                if(row.Descrizione) li.dataset.desc = row.Descrizione;
                if(row.Ricetta) li.dataset.recipe = row.Ricetta;

                let prezzo = `<span class="item-price">${row.Prezzo||''}</span>`;
                if(row.Prezzo && row.Prezzo.includes('|')) {
                    prezzo = `<span class="item-price-multi">` + row.Prezzo.split('|').map(p=>`<span class="item-price">${p.trim()}</span>`).join('') + `</span>`;
                }

                let html = `<span class="item-name">${row.Nome}</span>${prezzo}`;
                if(row.Descrizione && tipo!=='spirit' && tipo!=='recipe') {
                    const cls = cat.toLowerCase()==='vini'?'item-description-vini':'item-description';
                    html += `<span class="${cls}">${row.Descrizione}</span>`;
                }
                li.innerHTML = html;
                ul.appendChild(li);
            });
            sec.appendChild(ul);
            container.insertBefore(sec, noRes);

            const a = document.createElement('a');
            a.href = `#${id}`; a.textContent = cat;
            nav.appendChild(a);
        });
        console.log("7. Menu costruito con successo.");
    }

    function initEvents() {
        console.log("8. Inizializzazione eventi...");
        const searchBox = document.getElementById('search-wrapper');
        const input = document.getElementById('search-input');
        const popup = document.getElementById('description-popup');
        const modal = document.getElementById('recipe-modal');

        document.querySelectorAll('#quick-nav a').forEach(a => {
            a.addEventListener('click', function(e) {
                e.preventDefault();
                const t = document.querySelector(this.getAttribute('href'));
                if(t) window.scrollTo({top:t.offsetTop-20, behavior:'smooth'});
            });
        });

        function filter() {
            const term = input.value.toLowerCase().trim();
            let found = false;
            document.querySelectorAll('section:not(#no-results)').forEach(s => {
                let sVis = false;
                s.querySelectorAll('.menu-item').forEach(i => {
                    const txt = i.textContent.toLowerCase() + (i.dataset.desc||'').toLowerCase();
                    const show = txt.includes(term);
                    i.style.display = show ? (i.closest('ul')?'flex':'block') : 'none';
                    if(show) sVis = true;
                });
                s.style.display = sVis?'block':'none';
                if(sVis) found = true;
            });
            document.getElementById('no-results').style.display = (term && !found)?'flex':'none';
        }

        if(document.getElementById('search-icon-trigger')) {
             document.getElementById('search-icon-trigger').addEventListener('click', (e)=>{
                e.stopPropagation(); searchBox.classList.toggle('search-active');
                if(searchBox.classList.contains('search-active')) setTimeout(()=>input.focus(),50);
            });
            input.addEventListener('input', filter);
            document.getElementById('clear-search-link').addEventListener('click', (e)=>{ e.preventDefault(); input.value=''; filter(); });
        }

        document.querySelector('main').addEventListener('click', (e) => {
            const sp = e.target.closest('.spirit-item');
            const rec = e.target.closest('.recipe-item');

            if(sp) {
                e.stopPropagation();
                const name = sp.querySelector('.item-name').textContent;
                popup.querySelector('#popup-product-name').textContent = name;
                popup.querySelector('#popup-product-description').textContent = sp.dataset.desc || '';
                
                const pairingDiv = document.getElementById('popup-pairing-container');
                let pairingTxt = '';
                Object.keys(ginPairings).forEach(k => {
                    if(name.toLowerCase().includes(k)) pairingTxt = ginPairings[k];
                });
                if(pairingTxt) {
                    pairingDiv.innerHTML = `<strong>Abbinamento:</strong> ${pairingTxt}`;
                    pairingDiv.style.display='block';
                } else {
                    pairingDiv.style.display='none';
                }
                popup.classList.add('visible');
            } else if (rec) {
                e.stopPropagation();
                const name = rec.querySelector('.item-name').textContent;
                const raw = rec.dataset.recipe || '';
                modal.querySelector('#modal-recipe-name').textContent = name;
                
                const ul = modal.querySelector('#modal-recipe-ingredients ul'); ul.innerHTML='';
                const meth = modal.querySelector('#modal-recipe-method'); meth.innerHTML='<h5>Metodo</h5>';

                const lines = raw.split(/\\n|\n/);
                let isMethod = false;
                
                lines.forEach(l => {
                    l = l.trim();
                    if(!l) return;
                    if(l.toUpperCase().includes("METODO") || l.match(/^\d+\./)) isMethod=true;
                    
                    if(isMethod) {
                         const p = document.createElement('p'); p.textContent = l; meth.appendChild(p);
                    } else {
                         const li = document.createElement('li'); 
                         li.innerHTML = l.replace(/^(\d+(?:\.\d+)?(?:\s?cl|\s?ml|\s?gr)?)/i, '<strong>$1</strong>');
                         ul.appendChild(li);
                    }
                });
                modal.classList.add('visible');
            }
        });

        document.querySelectorAll('#popup-close-btn, #modal-recipe-close-btn').forEach(b=>
            b.addEventListener('click', ()=>{ popup.classList.remove('visible'); modal.classList.remove('visible'); })
        );
        console.log("9. Eventi pronti.");
    }

    function setSeasonalHeader() {
        const h = document.querySelector('header');
        if(!h) return;
        const d = new Date(), m=d.getMonth(), day=d.getDate();
        let img = 'https://bar-menu.github.io/Nuovo-2.jpg';
        if ((m===11 && day>=8) || (m===0 && day<=6)) img = 'https://bar-menu.github.io/Nuovo-Natale.jpg';
        if(m===7 && day===15) img = 'https://bar-menu.github.io/Nuovo-Ferragosto.jpg';
        h.style.backgroundImage = `url('${img}')`;
    }

    // AVVIO
    console.log("-> Avvio init()...");
    init(); 

});