// --- JAVASCRIPT ---

document.addEventListener('DOMContentLoaded', () => {
    // --- SELETTORI DOM ---
    // Elementi Ricerca Desktop
    const searchWrapperDesktop = document.getElementById('search-wrapper-desktop');
    const searchIconTriggerDesktop = document.getElementById('search-icon-trigger-desktop');
    const searchInputContainerDesktop = document.getElementById('search-input-container-desktop');
    const searchInputDesktop = document.getElementById('search-input-desktop');

    // Elementi Ricerca Mobile Sticky
    const stickyNavBar = document.getElementById('quick-nav-mobile-sticky');
    const stickySearchTrigger = document.getElementById('sticky-search-trigger');
    const stickySearchInput = document.getElementById('sticky-search-input');
    const stickyNavLinksWrapper = document.querySelector('.sticky-nav-links-wrapper');

    // Elementi Principali Pagina e Contenuto Menu
    const headerElement = document.querySelector('header');
    const mainElement = document.querySelector('main');
    const allSections = mainElement?.querySelectorAll('section:not(#no-results)'); // Sezioni del menu
    const noResultsSection = document.getElementById('no-results');
    const noResultsTermSpan = document.getElementById('no-results-term');

    // Elementi Popup Descrizione Dettagliata
    const descriptionPopup = document.getElementById('gin-description-popup'); // ID storico, usato per tutti i popup
    const popupContent = descriptionPopup?.querySelector('.popup-content');
    const popupProductName = document.getElementById('popup-product-name');
    const popupStrength = document.getElementById('popup-strength'); // Badge forza
    const popupProductDescription = document.getElementById('popup-product-description');
    const popupPreparationContainer = document.getElementById('popup-preparation-container'); // Contenitore preparazione
    const popupPreparationText = document.getElementById('popup-preparation-text'); // Testo preparazione
    const togglePrepBtn = document.getElementById('toggle-prep-btn'); // Bottone mostra/nascondi prep.
    const popupCloseBtn = document.getElementById('popup-close-btn'); // Bottone chiusura popup

    // Elementi Cliccabili per Aprire il Popup
    const spiritItems = document.querySelectorAll('.spirit-item'); // Tutti gli item che aprono popup

    // --- CONFIGURAZIONE ---
    // Immagini Header Stagionali
    const headerImages = {
        default: 'https://bar-menu.github.io/Santos-2.jpg',
        christmas: 'https://bar-menu.github.io/Santos-Natale.jpg',
        newYear: 'https://bar-menu.github.io/Santos-New-Year.jpg',
        epiphany: 'https://bar-menu.github.io/Santos-Epifania.jpg',
        valentine: 'https://bar-menu.github.io/Santos-Valentino.jpg',
        ferragosto: 'https://bar-menu.github.io/Santos-Ferragosto.jpg'
        // Aggiungi altre festività/immagini qui
    };

    // --- INIZIALIZZAZIONE APP ---
    function initializeApp() {
        // Verifica esistenza elementi essenziali
        if (!mainElement || !allSections || !descriptionPopup) {
            console.error("Errore: Elementi DOM essenziali non trovati. Script interrotto.");
            return;
        }

        // Imposta Favicon
        const menuIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#888888" d="M14 2.2C22.5-1.7 32.5-.3 39.6 5.8L80 40.4 120.4 5.8c9-7.7 22.3-7.7 31.2 0L192 40.4 232.4 5.8c9-7.7 22.3-7.7 31.2 0L304 40.4 344.4 5.8c7.1-6.1 17.1-7.5 25.6-3.6s14 12.4 14 21.8l0 464c0 9.4-5.5 17.9-14 21.8s-18.5 2.5-25.6-3.6L304 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L192 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L80 471.6 39.6 506.2c-7.1 6.1-17.1 7.5-25.6 3.6S0 497.4 0 488L0 24C0 14.6 5.5 6.1 14 2.2zM96 144c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 144zM80 352c0 8.8 7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 336c-8.8 0-16 7.2-16 16zM96 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 240z"/></svg>`;
        setSvgFavicon(menuIconSvg);

        // Imposta Immagine Header Stagionale
        setSeasonalHeaderImage();

        // Resetta Campi Ricerca
        if (searchInputDesktop) searchInputDesktop.value = '';
        if (stickySearchInput) stickySearchInput.value = '';

        // Assicura Visibilità Iniziale
        resetVisibility();

        // Collega tutti gli Event Listener
        setupEventListeners();
    }

    // --- FUNZIONI UTILITY ---
    // Imposta Favicon SVG
    function setSvgFavicon(svgString) {
        const cleanSvgString = svgString.replace(/<!--.*?-->/gs, ''); // Rimuovi commenti
        try {
            // Codifica correttamente per URL e Base64
            const encodedSvg = btoa(unescape(encodeURIComponent(cleanSvgString)));
            const dataUri = `data:image/svg+xml;base64,${encodedSvg}`;
            let faviconLink = document.querySelector("link[rel~='icon']");
            if (!faviconLink) {
                faviconLink = document.createElement('link');
                faviconLink.rel = 'icon';
                document.head.appendChild(faviconLink);
            }
            faviconLink.href = dataUri;
            faviconLink.type = 'image/svg+xml';
        } catch (e) {
            console.error("Errore durante la codifica SVG per favicon:", e);
        }
    }

    // Imposta Immagine Header in base alla data
    function setSeasonalHeaderImage() {
        if (!headerElement || !headerImages) return;
        const today = new Date();
        const month = today.getMonth(); // 0 = Gennaio, 11 = Dicembre
        const day = today.getDate();
        let imageUrl = headerImages.default; // Immagine predefinita

        // Logica per date specifiche (da personalizzare)
        // Natale: 8 Dic - 6 Gen
        if ((month === 11 && day >= 8) || (month === 0 && day <= 6)) {
             if (month === 0 && day === 1) imageUrl = headerImages.newYear;       // Capodanno
             else if (month === 0 && day === 6) imageUrl = headerImages.epiphany; // Epifania
             else imageUrl = headerImages.christmas;                                // Natale
        }
        else if (month === 1 && day === 14) { imageUrl = headerImages.valentine; } // San Valentino
        else if (month === 7 && day === 15) { imageUrl = headerImages.ferragosto; } // Ferragosto
        // Aggiungi altre condizioni qui...

        headerElement.style.backgroundImage = `url('${imageUrl}')`;
    }

    // Ripristina la visibilità di default per tutte le sezioni e gli item
    function resetVisibility() {
         if (!allSections) return;
         allSections.forEach(section => {
             section.style.display = 'block'; // Mostra sezione
             const itemsInSection = section.querySelectorAll('.menu-item, .item-description-footer');
             itemsInSection.forEach(item => {
                // Determina lo stile di display corretto in base al contesto e classe
                let displayStyle = 'flex'; // Default per menu-item standard
                if (item.classList.contains('item-description-footer')) { // Footer gin è block
                    displayStyle = 'block';
                } else if (item.closest('.simple-list')) { // Se mai useremo simple-list
                    displayStyle = 'block';
                }
                // Non è necessario specificare qui i casi flex (cocktail, panini) perché è già il default

                item.style.display = displayStyle; // Applica lo stile
             });
         });
         if (noResultsSection) noResultsSection.style.display = 'none'; // Nascondi "nessun risultato"
    }


    // --- GESTIONE SISTEMA DI RICERCA ---

    // Attiva la barra di ricerca (desktop o mobile)
    function activateSearch(type) {
        hideDescriptionPopup(); // Chiudi sempre popup quando si inizia a cercare
        if (type === 'desktop' && searchWrapperDesktop && !searchWrapperDesktop.classList.contains('search-active')) {
             deactivateSearch(false, 'mobile'); // Chiudi l'altra se aperta (senza resettare testo)
             searchWrapperDesktop.classList.add('search-active');
             // Focus sull'input dopo la transizione CSS per visibilità
             setTimeout(() => { if (searchInputDesktop) searchInputDesktop.focus(); }, 50);
        } else if (type === 'mobile' && stickyNavBar && !stickyNavBar.classList.contains('search-active')) {
             deactivateSearch(false, 'desktop'); // Chiudi l'altra se aperta
             stickyNavBar.classList.add('search-active');
             // Nascondi i link nav per dare spazio all'input
             if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'none';
             setTimeout(() => { if (stickySearchInput) stickySearchInput.focus(); }, 50);
        }
    }

    // Disattiva la barra di ricerca (desktop o mobile)
    function deactivateSearch(resetSearch = true, type) {
        let inputToClear = null;
        let wasActive = false; // Flag per sapere se la ricerca era effettivamente attiva

        if (type === 'desktop' && searchWrapperDesktop && searchWrapperDesktop.classList.contains('search-active')) {
            searchWrapperDesktop.classList.remove('search-active');
            if (searchInputDesktop) searchInputDesktop.blur(); // Rimuovi focus
            inputToClear = searchInputDesktop;
            wasActive = true;
        } else if (type === 'mobile' && stickyNavBar && stickyNavBar.classList.contains('search-active')) {
            stickyNavBar.classList.remove('search-active');
            if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'flex'; // Rendi visibili i link
            if (stickySearchInput) stickySearchInput.blur();
            inputToClear = stickySearchInput;
            wasActive = true;
        }

        // Se richiesto (es. chiusura esplicita), pulisci l'input
        if (resetSearch && inputToClear) {
            inputToClear.value = '';
        }

        // Esegui il filtro (per mostrare tutto) solo se è stato resettato e la ricerca era attiva
        if (resetSearch && wasActive) {
             filterItemsAndSections(type); // Ripristina visibilità chiamando filtro con input vuoto
        }
    }

    // Funzione principale per filtrare item e sezioni
    function filterItemsAndSections(sourceType) { // sourceType indica se chiamata da 'desktop' o 'mobile'
        const inputElement = (sourceType === 'desktop') ? searchInputDesktop : stickySearchInput;
        if (!inputElement) return; // Se l'input non esiste, esci

        const searchTerm = inputElement.value.trim().toLowerCase(); // Testo cercato, pulito e in minuscolo
        const isSearchActive = searchTerm !== ''; // La ricerca è attiva se c'è testo
        let anyItemVisibleGlobal = false; // Flag per sapere se almeno un item è visibile globalmente

        // Se la ricerca è vuota, mostra tutto e nascondi "nessun risultato"
        if (!isSearchActive) {
            resetVisibility();
            return;
        }

        // Cicla su tutte le sezioni del menu
        if (!allSections) return;
        allSections.forEach(section => {
            const sectionTitleElement = section.querySelector('h2');
            // Cerca anche nel titolo della sezione
            const sectionTitleText = sectionTitleElement ? sectionTitleElement.textContent.trim().toLowerCase() : '';
            const isSectionTitleMatch = sectionTitleText.includes(searchTerm);

            let sectionHasVisibleItem = false; // Flag per sapere se la sezione corrente ha item visibili
            // Seleziona tutti gli elementi potenzialmente filtrabili nella sezione
            const itemsInSection = section.querySelectorAll('.menu-item, .item-description-footer');

            itemsInSection.forEach(item => {
                let itemText = ''; // Testo combinato dell'item per la ricerca
                let isMatch = false; // Flag se l'item matcha la ricerca

                // Estrai il testo da varie parti dell'item
                const itemNameElement = item.querySelector('.item-name');
                const itemDescriptionElement = item.querySelector('.item-description:not(.item-description-footer):not(.item-variations), .item-description-vini');
                const itemVariationsElement = item.querySelector('.item-variations');

                // Aggiungi il nome (se presente)
                if (itemNameElement) {
                    itemText += itemNameElement.textContent.toLowerCase() + ' ';
                }
                // Aggiungi la descrizione visibile (se presente e non variazioni/footer)
                if (itemDescriptionElement) {
                    itemText += itemDescriptionElement.textContent.toLowerCase() + ' ';
                }
                // Aggiungi le variazioni (se presenti)
                if (itemVariationsElement) {
                    itemText += itemVariationsElement.textContent.toLowerCase() + ' ';
                }
                // Aggiungi la descrizione dal data attribute (usata nel popup)
                const dataDesc = item.dataset.description ? item.dataset.description.toLowerCase() : '';
                if (dataDesc) { itemText += dataDesc + ' '; }
                 // Aggiungi la forza dal data attribute (usata nel popup)
                 const dataStrength = item.dataset.strength ? item.dataset.strength.toLowerCase() : '';
                 if (dataStrength) { itemText += dataStrength + ' '; }
                 // Caso speciale per footer gin tonic
                 if (item.classList.contains('item-description-footer')) {
                     itemText += item.textContent.toLowerCase();
                 }

                // Verifica se il testo dell'item contiene il termine di ricerca
                isMatch = itemText.includes(searchTerm);

                // Determina lo stile di display corretto (come in resetVisibility)
                let displayStyle = 'flex'; // Default
                if (item.classList.contains('item-description-footer') || item.closest('.simple-list')) {
                    displayStyle = 'block';
                }

                // Applica lo stile (mostra o nascondi)
                const targetDisplay = isMatch ? displayStyle : 'none';
                if (item.style.display !== targetDisplay) {
                    item.style.display = targetDisplay;
                }

                // Se l'item matcha, la sezione ha almeno un item visibile
                if (isMatch) {
                    sectionHasVisibleItem = true;
                }
            }); // Fine ciclo sugli item

            // La sezione deve essere mostrata SE il suo titolo matcha O SE contiene almeno un item visibile
            const shouldShowSection = isSectionTitleMatch || sectionHasVisibleItem;
            const targetDisplaySection = shouldShowSection ? 'block' : 'none';
            if (section.style.display !== targetDisplaySection) {
                section.style.display = targetDisplaySection;
            }

            // Se questa sezione è visibile, segna che c'è almeno un risultato globale
            if (shouldShowSection) {
                anyItemVisibleGlobal = true;
            }
        }); // Fine ciclo sulle sezioni

        // Gestione del messaggio "Nessun risultato trovato"
        const showNoResults = !anyItemVisibleGlobal;
        if (showNoResults && noResultsSection) {
            if (noResultsTermSpan) noResultsTermSpan.textContent = inputElement.value.trim(); // Mostra termine cercato
            noResultsSection.style.display = 'flex'; // Mostra il box "nessun risultato"
        } else if (noResultsSection) {
            noResultsSection.style.display = 'none'; // Nascondi il box
        }
    }


    // --- GESTIONE POPUP DETTAGLI PRODOTTO ---

    // Mostra il popup con i dettagli dell'elemento cliccato
    function showDescriptionPopup(element) {
        // Verifica esistenza elementi popup
        if (!descriptionPopup || !popupContent || !popupProductName || !popupStrength || !popupProductDescription || !popupPreparationContainer || !popupPreparationText || !togglePrepBtn) {
             console.error("Elementi del popup mancanti.");
             return;
        }

        // Recupera i dati dall'elemento HTML cliccato usando gli attributi data-*
        const name = element.querySelector('.item-name')?.textContent || 'Prodotto'; // Nome dall'elemento .item-name
        const description = element.dataset.description || 'Nessuna descrizione disponibile.'; // Descrizione da data-description
        const strength = element.dataset.strength; // Forza/Grado da data-strength
        const preparation = element.dataset.preparation; // Testo preparazione da data-preparation

        // Popola i campi base del popup
        popupProductName.textContent = name;
        popupProductDescription.textContent = description;

        // Gestisci e mostra il badge della forza (se presente)
        if (strength && popupStrength) {
            popupStrength.textContent = strength;
            // Applica classe CSS per colore (es. "strength-medio", "strength-forte")
            popupStrength.className = 'strength-badge'; // Resetta classi precedenti, tieni la base
            const strengthClass = `strength-${strength.toLowerCase().replace(/[\s/]+/g, '-')}`; // Crea classe CSS valida (es. medio/forte -> medio-forte)
            popupStrength.classList.add(strengthClass);
            popupStrength.style.display = 'inline-block'; // Rendi visibile
        } else if (popupStrength) {
            popupStrength.style.display = 'none'; // Nascondi se non c'è data-strength
        }

        // Gestisci la sezione preparazione (se presente)
        if (preparation && popupPreparationContainer && popupPreparationText && togglePrepBtn) {
            popupPreparationText.textContent = preparation; // Inserisci testo preparazione
            togglePrepBtn.style.display = 'block'; // Mostra il bottone "Come si fa?"

            // Resetta lo stato iniziale della preparazione (nascosta)
            popupPreparationContainer.style.display = 'none';
            descriptionPopup.classList.remove('preparation-visible'); // Rimuovi classe dal popup
            // Resetta testo e icona del bottone
            togglePrepBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Come si fa?';
            togglePrepBtn.title = "Mostra preparazione";

        } else { // Se non c'è preparazione
            if (togglePrepBtn) togglePrepBtn.style.display = 'none'; // Nascondi bottone
            if (popupPreparationContainer) popupPreparationContainer.style.display = 'none'; // Nascondi contenitore
             descriptionPopup.classList.remove('preparation-visible'); // Assicura rimozione classe
        }

        // Rendi visibile il popup
        descriptionPopup.classList.add('visible');
    }

    // Nasconde il popup
    function hideDescriptionPopup() {
        if (!descriptionPopup) { return; }
        descriptionPopup.classList.remove('visible'); // Rimuovi classe per animazione uscita

        // Resetta anche lo stato del toggle preparazione per la prossima apertura
        descriptionPopup.classList.remove('preparation-visible');
         if (popupPreparationContainer) popupPreparationContainer.style.display = 'none';
         if (togglePrepBtn) {
             togglePrepBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Come si fa?';
             togglePrepBtn.title = "Mostra preparazione";
         }
    }

    // Mostra/Nasconde la sezione preparazione all'interno del popup
    function togglePreparationVisibility() {
        if (!descriptionPopup || !popupPreparationContainer || !togglePrepBtn) return;

        // Aggiungi/Rimuovi la classe .preparation-visible al popup
        const isVisible = descriptionPopup.classList.toggle('preparation-visible');

        // Aggiorna lo stile e il testo/icona del bottone di conseguenza
        if (isVisible) {
            popupPreparationContainer.style.display = 'block'; // Mostra contenitore
            togglePrepBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Nascondi preparazione'; // Cambia icona e testo
            togglePrepBtn.title = "Nascondi preparazione";
        } else {
            popupPreparationContainer.style.display = 'none'; // Nascondi contenitore
            togglePrepBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Come si fa?'; // Ripristina icona e testo
            togglePrepBtn.title = "Mostra preparazione";
        }
    }

    // --- COLLEGAMENTO DEGLI EVENT LISTENER ---
    function setupEventListeners() {
        // 1. Listener per i link di Navigazione Rapida (Scroll)
        document.querySelectorAll('#quick-nav a, #quick-nav-mobile-sticky ul a').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault(); // Impedisci comportamento default dell'ancora
                // Chiudi eventuali ricerche attive e il popup
                deactivateSearch(true, 'desktop');
                deactivateSearch(true, 'mobile');
                hideDescriptionPopup();

                const targetId = this.getAttribute('href'); // Prendi l'ID target (#nome-sezione)
                try {
                    const targetElement = document.querySelector(targetId); // Trova l'elemento target
                    if (targetElement) {
                        // Calcola la posizione target con un piccolo offset dall'alto
                        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 20; // 20px sopra l'inizio sezione
                        window.scrollTo({ top: offsetTop, behavior: 'smooth' }); // Scroll fluido
                    } else {
                         console.warn(`Elemento target non trovato per l'ancora: ${targetId}`);
                    }
                } catch (error) { // Gestione errori selettore CSS non valido
                     console.error(`Errore nel selettore CSS per l'ancora ${targetId}:`, error);
                }
            });
        });

        // 2. Listener per aprire il Popup Descrizione (su tutti gli .spirit-item)
        if (spiritItems.length > 0 && descriptionPopup && popupCloseBtn && togglePrepBtn) {
            spiritItems.forEach(item => {
                item.addEventListener('click', (event) => {
                    event.stopPropagation(); // Impedisci che il click si propaghi al documento
                    showDescriptionPopup(item); // Mostra popup per l'item cliccato
                });
            });
            // Listener per chiudere il popup con il bottone 'X'
            popupCloseBtn.addEventListener('click', (event) => {
                 event.stopPropagation();
                 hideDescriptionPopup();
            });
            // Listener per il bottone "Come si fa?" dentro il popup
             togglePrepBtn.addEventListener('click', (event) => {
                 event.stopPropagation();
                 togglePreparationVisibility();
            });
             // Impedisci che un click dentro il popup lo chiuda (propagandosi al document)
             descriptionPopup.addEventListener('click', (event) => {
                 event.stopPropagation();
             });
        } else {
            console.warn("Elementi per il popup (popup, close button, toggle button) o item cliccabili (.spirit-item) non trovati. Funzionalità popup disabilitata.");
        }

        // 3. Listener per la Ricerca Desktop
        if (searchIconTriggerDesktop && searchWrapperDesktop && searchInputDesktop && searchInputContainerDesktop) {
            // Click sull'icona per aprire/chiudere
            searchIconTriggerDesktop.addEventListener('click', (event) => {
                event.stopPropagation();
                if (searchWrapperDesktop.classList.contains('search-active')) {
                    deactivateSearch(true, 'desktop'); // Chiudi e resetta
                } else {
                    activateSearch('desktop'); // Apri
                }
            });
            // Filtra mentre l'utente digita
            searchInputDesktop.addEventListener('input', () => filterItemsAndSections('desktop'));
            // Impedisci che click su input/container chiudano la ricerca
            searchInputDesktop.addEventListener('click', (e) => e.stopPropagation());
            searchInputContainerDesktop.addEventListener('click', (e) => e.stopPropagation());
        }

        // 4. Listener per la Ricerca Mobile Sticky
        if (stickySearchTrigger && stickyNavBar && stickySearchInput) {
            // Click sull'icona per aprire/chiudere
            stickySearchTrigger.addEventListener('click', (event) => {
                event.stopPropagation();
                if (stickyNavBar.classList.contains('search-active')) {
                    deactivateSearch(true, 'mobile'); // Chiudi e resetta
                } else {
                    activateSearch('mobile'); // Apri
                }
            });
            // Filtra mentre l'utente digita
            stickySearchInput.addEventListener('input', () => filterItemsAndSections('mobile'));
             // Impedisci che click sull'input chiuda la ricerca
             stickySearchInput.addEventListener('click', (event) => {
                 event.stopPropagation();
             });
        }

         // 5. Listener Globale sul Documento per chiudere elementi cliccando fuori
         document.addEventListener('click', (event) => {
             // Chiudi Ricerca Desktop se attiva e si clicca fuori dal suo wrapper
             if (searchWrapperDesktop && searchWrapperDesktop.classList.contains('search-active') && !searchWrapperDesktop.contains(event.target)) {
                deactivateSearch(false, 'desktop'); // Nascondi senza resettare il testo
             }
             // Chiudi Ricerca Mobile se attiva e si clicca fuori dalla barra intera
             if (stickyNavBar && stickyNavBar.classList.contains('search-active') && !stickyNavBar.contains(event.target)) {
                 deactivateSearch(false, 'mobile'); // Nascondi senza resettare
             }
            // Chiudi Popup Descrizione se visibile e si clicca fuori da esso E non su un item che lo apre
             if (descriptionPopup && descriptionPopup.classList.contains('visible') && !descriptionPopup.contains(event.target) && !event.target.closest('.spirit-item')) {
                 hideDescriptionPopup();
             }
         });

          // 6. Opzionale: Listener per il resize della finestra (per eventuali aggiustamenti layout)
          // window.addEventListener('resize', () => { /* Codice qui */ });

    } // Fine setupEventListeners

    // --- ESECUZIONE INIZIALE ---
    initializeApp();

}); // Fine DOMContentLoaded wrapper