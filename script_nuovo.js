// --- JAVASCRIPT ---

document.addEventListener('DOMContentLoaded', () => {

    // Elementi Ricerca Sticky
    const stickyNavBar = document.getElementById('quick-nav-mobile-sticky');
    const stickySearchTrigger = document.getElementById('sticky-search-trigger');
    const stickySearchInput = document.getElementById('sticky-search-input');
    const stickyNavLinksWrapper = stickyNavBar?.querySelector('.sticky-nav-links-wrapper'); // Aggiornato per sicurezza

    // Elementi Principali Pagina e Contenuto Menu
    const headerElement = document.querySelector('header');
    const mainElement = document.querySelector('main');
    const allSections = mainElement?.querySelectorAll('section:not(#no-results)');
    const noResultsSection = document.getElementById('no-results');
    const noResultsTermSpan = document.getElementById('no-results-term');

    // Elementi Popup Descrizione Dettagliata
    const descriptionPopup = document.getElementById('gin-description-popup');
    const popupContent = descriptionPopup?.querySelector('.popup-content');
    const popupProductName = document.getElementById('popup-product-name');
    const popupStrength = document.getElementById('popup-strength');
    const popupProductDescription = document.getElementById('popup-product-description');
    const popupPreparationContainer = document.getElementById('popup-preparation-container');
    const popupPreparationText = document.getElementById('popup-preparation-text');
    const togglePrepBtn = document.getElementById('toggle-prep-btn');
    const popupCloseBtn = document.getElementById('popup-close-btn');

    // Elementi Cliccabili per Aprire il Popup
    const spiritItems = document.querySelectorAll('.spirit-item');

    // --- URLs Immagini Header Stagionali ---
    const headerImages = {
        default: 'https://bar-menu.github.io/Nuovo-2.jpg',
        christmas: 'https://bar-menu.github.io/Nuovo-Natale.jpg',
        newYear: 'https://bar-menu.github.io/Nuovo-New-Year.jpg',
        epiphany: 'https://bar-menu.github.io/Nuovo-Epifania.jpg',
        valentine: 'https://bar-menu.github.io/Nuovo-Valentino.jpg',
        ferragosto: 'https://bar-menu.github.io/Nuovo-Ferragosto.jpg'
    };

    // --- INIZIALIZZAZIONE APP ---
    function initializeApp() {
        if (!mainElement || !allSections || !descriptionPopup || !popupProductName || !popupStrength || !popupProductDescription || !popupPreparationContainer || !popupPreparationText || !togglePrepBtn || !popupCloseBtn || !stickyNavBar || !stickySearchTrigger || !stickySearchInput || !stickyNavLinksWrapper) {
            console.error("Errore: Elementi DOM essenziali (inclusi elementi popup e barra di navigazione/ricerca) non trovati. Script interrotto.");
            if (!popupStrength) console.error("Elemento #popup-strength non trovato!");
            if (!stickyNavBar) console.error("Elemento #quick-nav-mobile-sticky non trovato!");
            // ... altri controlli specifici ...
            return;
        }
        const menuIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#888888" d="M14 2.2C22.5-1.7 32.5-.3 39.6 5.8L80 40.4 120.4 5.8c9-7.7 22.3-7.7 31.2 0L192 40.4 232.4 5.8c9-7.7 22.3-7.7 31.2 0L304 40.4 344.4 5.8c7.1-6.1 17.1-7.5 25.6-3.6s14 12.4 14 21.8l0 464c0 9.4-5.5 17.9-14 21.8s-18.5 2.5-25.6-3.6L304 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L192 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L80 471.6 39.6 506.2c-7.1 6.1-17.1 7.5-25.6 3.6S0 497.4 0 488L0 24C0 14.6 5.5 6.1 14 2.2zM96 144c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 144zM80 352c0 8.8 7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 336c-8.8 0-16 7.2-16 16zM96 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 240z"/></svg>`;
        setSvgFavicon(menuIconSvg);
        setSeasonalHeaderImage();
        // if (searchInputDesktop) searchInputDesktop.value = ''; // Rimosso
        if (stickySearchInput) stickySearchInput.value = '';
        resetVisibility();
        setupEventListeners();
    }

    // --- FUNZIONI UTILITY ---
    function setSvgFavicon(svgString) {
        const cleanSvgString = svgString.replace(/<!--.*?-->/gs, '');
        try {
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

    function setSeasonalHeaderImage() {
        if (!headerElement || !headerImages) return;
        const today = new Date();
        const month = today.getMonth();
        const day = today.getDate();
        let imageUrl = headerImages.default;
        if ((month === 11 && day >= 8) || (month === 0 && day <= 6)) {
             if (month === 0 && day === 1) imageUrl = headerImages.newYear;
             else if (month === 0 && day === 6) imageUrl = headerImages.epiphany;
             else imageUrl = headerImages.christmas;
        }
        else if (month === 1 && day === 14) { imageUrl = headerImages.valentine; }
        else if (month === 7 && day === 15) { imageUrl = headerImages.ferragosto; }
        headerElement.style.backgroundImage = `url('${imageUrl}')`;
    }

    function resetVisibility() {
         if (!allSections) return;
         allSections.forEach(section => {
             section.style.display = 'block';
             // Includi h3 e p nella ricerca di elementi da mostrare/nascondere
             const itemsInSection = section.querySelectorAll('.menu-item, .item-description-footer, h3, p');
             itemsInSection.forEach(item => {
                let displayStyle = 'flex'; // Default per .menu-item
                if (item.classList.contains('item-description-footer') ||
                    item.tagName.toLowerCase() === 'h3' ||
                    item.tagName.toLowerCase() === 'p' ||
                    item.closest('.simple-list') /* se hai una classe del genere */) {
                    displayStyle = 'block';
                }
                item.style.display = displayStyle;
             });
         });
         if (noResultsSection) noResultsSection.style.display = 'none';
    }

    // --- GESTIONE SISTEMA DI RICERCA (Solo per barra sticky) ---
    function activateSearch() { // Rimosso 'type'
        hideDescriptionPopup();
        // Rimuovi la parte desktop
        // if (type === 'desktop' && searchWrapperDesktop && !searchWrapperDesktop.classList.contains('search-active')) { ... }
        if (stickyNavBar && !stickyNavBar.classList.contains('search-active')) {
             // deactivateSearch(false, 'desktop'); // Non più necessario
             stickyNavBar.classList.add('search-active');
             if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'none';
             setTimeout(() => { if (stickySearchInput) stickySearchInput.focus(); }, 50);
        }
    }

    function deactivateSearch(resetSearch = true) { // Rimosso 'type'
        let inputToClear = null;
        let wasActive = false;
        // Rimuovi la parte desktop
        // if (type === 'desktop' && searchWrapperDesktop && searchWrapperDesktop.classList.contains('search-active')) { ... }
        if (stickyNavBar && stickyNavBar.classList.contains('search-active')) {
            stickyNavBar.classList.remove('search-active');
            if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'flex'; // o 'block' a seconda del layout
            if (stickySearchInput) stickySearchInput.blur();
            inputToClear = stickySearchInput;
            wasActive = true;
        }
        if (resetSearch && inputToClear) {
            inputToClear.value = '';
        }
        if (resetSearch && wasActive) {
             filterItemsAndSections(); // Rimosso 'type'
        }
    }

    function filterItemsAndSections() { // Rimosso 'sourceType'
        // const inputElement = (sourceType === 'desktop') ? searchInputDesktop : stickySearchInput; // Modificato
        const inputElement = stickySearchInput;
        if (!inputElement) return;

        const searchTerm = inputElement.value.trim().toLowerCase();
        const isSearchActive = searchTerm !== '';

        if (!isSearchActive) {
            resetVisibility();
            if (stickyNavBar) stickyNavBar.classList.remove('search-active-results'); // Rimuovi classe se la ricerca è vuota
            if (noResultsSection) noResultsSection.style.display = 'none';
            return;
        }
        if (stickyNavBar) stickyNavBar.classList.add('search-active-results'); // Aggiungi una classe per indicare che ci sono risultati filtrati (opzionale)


        let anyItemVisibleGlobal = false;
        if (!allSections) return;

        allSections.forEach(section => {
            const sectionTitleElement = section.querySelector('h2');
            const sectionTitleText = sectionTitleElement ? sectionTitleElement.textContent.trim().toLowerCase() : '';
            const isSectionTitleMatch = sectionTitleText.includes(searchTerm);
            let sectionHasVisibleItem = false;

            // Includi h3 e p per il filtraggio del testo e per la loro visibilità
            const itemsAndTextBlocksInSection = section.querySelectorAll('.menu-item, .item-description-footer, h3, p');

            itemsAndTextBlocksInSection.forEach(element => {
                let elementText = '';
                let isMatch = false;

                if (element.classList.contains('menu-item')) {
                    const itemNameElement = element.querySelector('.item-name');
                    const itemDescriptionElement = element.querySelector('.item-description:not(.item-description-footer):not(.item-variations), .item-description-vini');
                    const itemVariationsElement = element.querySelector('.item-variations');

                    if (itemNameElement) elementText += itemNameElement.textContent.toLowerCase() + ' ';
                    if (itemDescriptionElement) elementText += itemDescriptionElement.textContent.toLowerCase() + ' ';
                    if (itemVariationsElement) elementText += itemVariationsElement.textContent.toLowerCase() + ' ';

                    const dataDesc = element.dataset.description ? element.dataset.description.toLowerCase() : '';
                    if (dataDesc) elementText += dataDesc + ' ';
                    const dataStrength = element.dataset.strength ? element.dataset.strength.toLowerCase() : '';
                    if (dataStrength) elementText += dataStrength + ' ';
                } else if (element.classList.contains('item-description-footer') || element.tagName.toLowerCase() === 'h3' || element.tagName.toLowerCase() === 'p') {
                    elementText += element.textContent.toLowerCase();
                }

                isMatch = elementText.includes(searchTerm);

                let displayStyle = 'flex'; // Default per .menu-item
                if (element.classList.contains('item-description-footer') ||
                    element.tagName.toLowerCase() === 'h3' ||
                    element.tagName.toLowerCase() === 'p' ||
                    element.closest('.simple-list')) {
                    displayStyle = 'block';
                }

                const targetDisplay = isMatch ? displayStyle : 'none';
                if (element.style.display !== targetDisplay) element.style.display = targetDisplay;

                if (isMatch) sectionHasVisibleItem = true;
            });

            const shouldShowSection = isSectionTitleMatch || sectionHasVisibleItem;
            const targetDisplaySection = shouldShowSection ? 'block' : 'none';
            if (section.style.display !== targetDisplaySection) section.style.display = targetDisplaySection;
            if (shouldShowSection) anyItemVisibleGlobal = true;
        });

        const showNoResults = !anyItemVisibleGlobal;
        if (showNoResults && noResultsSection) {
            if (noResultsTermSpan) noResultsTermSpan.textContent = inputElement.value.trim();
            noResultsSection.style.display = 'flex';
        } else if (noResultsSection) {
            noResultsSection.style.display = 'none';
        }
    }


    // --- GESTIONE POPUP DETTAGLI PRODOTTO ---
    function showDescriptionPopup(element) {
         if (!descriptionPopup || !popupContent || !popupProductName || !popupStrength || !popupProductDescription || !popupPreparationContainer || !popupPreparationText || !togglePrepBtn) {
             console.error("Elementi popup mancanti in showDescriptionPopup.");
             return;
         }

        const name = element.querySelector('.item-name')?.textContent || 'Prodotto';
        const description = element.dataset.description || 'Nessuna descrizione disponibile.';
        const strength = element.dataset.strength;
        const preparation = element.dataset.preparation;

        popupProductName.textContent = name;
        popupProductDescription.textContent = description;

        if (preparation && popupPreparationContainer && popupPreparationText && togglePrepBtn) {
            popupPreparationText.innerHTML = preparation.replace(/\n/g, '<br>'); // Usa innerHTML per <br>
            togglePrepBtn.style.display = 'block';

            if (strength && popupStrength) {
                popupStrength.textContent = strength;
                popupStrength.className = 'strength-badge';
                const strengthClass = `strength-${strength.toLowerCase().replace(/[\s/]+/g, '-')}`;
                popupStrength.classList.add(strengthClass);
                popupStrength.style.display = 'inline-block';
            } else if (popupStrength) {
                popupStrength.style.display = 'none';
            }

            popupPreparationContainer.style.display = 'none'; // Nascosto di default
            descriptionPopup.classList.remove('preparation-visible'); // Rimuovi classe
            togglePrepBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Come si fa?';
            togglePrepBtn.title = "Mostra preparazione";

        } else {
            if (togglePrepBtn) togglePrepBtn.style.display = 'none';
            if (popupPreparationContainer) popupPreparationContainer.style.display = 'none';
            if (popupStrength) popupStrength.style.display = 'none';
            descriptionPopup.classList.remove('preparation-visible');
        }
        descriptionPopup.classList.add('visible');
    }

    function hideDescriptionPopup() {
        if (!descriptionPopup) { return; }
        descriptionPopup.classList.remove('visible');
        descriptionPopup.classList.remove('preparation-visible');
         if (popupPreparationContainer) popupPreparationContainer.style.display = 'none';
         if (popupStrength) popupStrength.style.display = 'none';
         if (togglePrepBtn) {
             togglePrepBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Come si fa?';
             togglePrepBtn.title = "Mostra preparazione";
         }
    }

    function togglePreparationVisibility() {
        if (!descriptionPopup || !popupPreparationContainer || !togglePrepBtn) return;
        const isVisible = descriptionPopup.classList.toggle('preparation-visible');
        if (isVisible) {
            popupPreparationContainer.style.display = 'block';
            togglePrepBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Nascondi preparazione';
            togglePrepBtn.title = "Nascondi preparazione";
        } else {
            popupPreparationContainer.style.display = 'none';
            togglePrepBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Come si fa?';
            togglePrepBtn.title = "Mostra preparazione";
        }
    }

    // --- COLLEGAMENTO DEGLI EVENT LISTENER ---
    function setupEventListeners() {
        // 1. Listener Quick Nav (Scroll)
        document.querySelectorAll('#quick-nav a, #quick-nav-mobile-sticky ul a').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                // deactivateSearch(true, 'desktop'); // Rimosso
                deactivateSearch(true); // Modificato
                hideDescriptionPopup();
                const targetId = this.getAttribute('href');
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        // Calcolo offset considerando l'altezza della barra sticky e un margine
                        const stickyNavHeight = stickyNavBar ? stickyNavBar.offsetHeight : 55; // Prendi altezza reale o default
                        const offsetMargin = 20; // Margine aggiuntivo
                        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - stickyNavHeight - offsetMargin;
                        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                    } else {
                         console.warn(`Elemento target non trovato per l'ancora: ${targetId}`);
                    }
                } catch (error) {
                     console.error(`Errore nel selettore CSS per l'ancora ${targetId}:`, error);
                }
            });
        });

        // 2. Listener Popup Descrizione (su .spirit-item)
        if (spiritItems.length > 0 && descriptionPopup && popupCloseBtn && togglePrepBtn && popupStrength) {
             spiritItems.forEach(item => {
                 item.addEventListener('click', (event) => {
                     event.stopPropagation();
                     showDescriptionPopup(item);
                 });
             });
             popupCloseBtn.addEventListener('click', (event) => {
                 event.stopPropagation();
                 hideDescriptionPopup();
             });
             togglePrepBtn.addEventListener('click', (event) => {
                 event.stopPropagation();
                 togglePreparationVisibility();
             });
             descriptionPopup.addEventListener('click', (event) => {
                 // Permetti click interni senza chiudere, eccetto se è il bottone chiudi o toggle
                 if (event.target !== popupCloseBtn && event.target !== togglePrepBtn && !togglePrepBtn.contains(event.target)) {
                    event.stopPropagation();
                 }
             });
        } else {
            console.warn("Funzionalità popup disabilitata. Verifica elementi essenziali: .spirit-item(s), #gin-description-popup, #popup-close-btn, #toggle-prep-btn, #popup-strength.");
        }

        // 3. Listener Ricerca Desktop (RIMOSSO o COMMENTATO)
        // if (searchIconTriggerDesktop && searchWrapperDesktop && searchInputDesktop && searchInputContainerDesktop) { ... }

        // 4. Listener Ricerca Mobile Sticky (ora Globale)
        if (stickySearchTrigger && stickyNavBar && stickySearchInput) {
            stickySearchTrigger.addEventListener('click', (event) => {
                event.stopPropagation();
                if (stickyNavBar.classList.contains('search-active')) {
                    deactivateSearch(true); // Modificato
                } else {
                    activateSearch(); // Modificato
                }
            });
            stickySearchInput.addEventListener('input', () => filterItemsAndSections()); // Modificato
            stickySearchInput.addEventListener('click', (event) => {
                 event.stopPropagation();
            });
        }

         // 5. Listener Globale (Document) per chiudere cliccando fuori


         document.addEventListener('DOMContentLoaded', () => {
            // ... (i tuoi altri selettori DOM)
            const bodyElement = document.body;
            const stickySearchInput = document.getElementById('sticky-search-input');
        
            // ... (il resto del tuo script di inizializzazione e altre funzioni)
        
            function setupEventListeners() {
                // ... (i tuoi altri event listener)
        
                if (stickySearchInput && bodyElement) {
                    stickySearchInput.addEventListener('focus', () => {
                        bodyElement.classList.add('search-input-focused');
                        // console.log('Body class added: search-input-focused'); // Per debug
                    });
        
                    stickySearchInput.addEventListener('blur', () => {
                        bodyElement.classList.remove('search-input-focused');
                        // console.log('Body class removed: search-input-focused'); // Per debug
                    });
        
                    // Assicurati che la logica per l'attivazione/disattivazione della ricerca
                    // gestisca correttamente il focus e il blur dell'input.
                    // Ad esempio, quando chiudi la ricerca, l'input dovrebbe perdere il focus (blur).
                }
        
                // ... (altri event listener)
            }
        
            // ... (chiama setupEventListeners e altre funzioni di inizializzazione)
            // initializeApp(); // Se hai una funzione del genere
        });

        // 6. Listener per il link "cancella ricerca" in #no-results (se lo aggiungi)
        const clearSearchLink = document.getElementById('clear-search-link'); // Assicurati che esista nell'HTML
        if (clearSearchLink && noResultsSection) {
            clearSearchLink.addEventListener('click', (event) => {
                event.preventDefault();
                if (stickySearchInput) stickySearchInput.value = '';
                filterItemsAndSections(); // Riesegui filtro (mostrerà tutto)
                if(stickyNavBar) stickyNavBar.classList.remove('search-active'); // Chiudi interfaccia ricerca
                if(stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'flex'; // Mostra link nav
                if (noResultsSection) noResultsSection.style.display = 'none'; // Nascondi "nessun risultato"
            });
        }

    } // Fine setupEventListeners

    // --- ESECUZIONE INIZIALE ---
    initializeApp();

}); // Fine DOMContentLoaded wrapper