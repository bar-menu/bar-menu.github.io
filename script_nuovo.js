// --- JAVASCRIPT (script_nuovo.js) ---

document.addEventListener('DOMContentLoaded', () => {
    // --- SELETTORI DOM ---
    const bodyElement = document.body;
    const headerElement = document.querySelector('header');
    const mainElement = document.querySelector('main');

    // Elementi Barra Sticky e Ricerca
    const stickyNavBar = document.getElementById('quick-nav-mobile-sticky');
    const stickySearchTrigger = document.getElementById('sticky-search-trigger');
    const stickySearchInput = document.getElementById('sticky-search-input');
    const stickySearchClearBtn = document.getElementById('sticky-search-clear-btn'); // Per la X interna
    const stickyNavLinksWrapper = stickyNavBar?.querySelector('.sticky-nav-links-wrapper');
    const stickyNavLinks = stickyNavBar?.querySelectorAll('ul a');

    // Elementi Menu e Risultati Ricerca
    const allSections = mainElement?.querySelectorAll('section:not(#no-results)');
    const noResultsSection = document.getElementById('no-results');
    const noResultsTermSpan = document.getElementById('no-results-term');
    const clearSearchNoResultsLink = document.getElementById('clear-search-link');

    // Elementi Popup Descrizione
    const descriptionPopup = document.getElementById('gin-description-popup');
    const popupContent = descriptionPopup?.querySelector('.popup-content');
    const popupProductName = document.getElementById('popup-product-name');
    const popupStrength = document.getElementById('popup-strength');
    const popupProductDescription = document.getElementById('popup-product-description');
    const popupPreparationContainer = document.getElementById('popup-preparation-container');
    const popupPreparationText = document.getElementById('popup-preparation-text');
    const togglePrepBtn = document.getElementById('toggle-prep-btn');
    const popupCloseBtn = document.getElementById('popup-close-btn');

    // Elementi Cliccabili per Popup
    const spiritItems = document.querySelectorAll('.spirit-item');

    // URLs Immagini Header Stagionali
    const headerImages = {
        default: 'https://bar-menu.github.io/Nuovo-2.jpg',
        christmas: 'https://bar-menu.github.io/Nuovo-Natale.jpg',
        newYear: 'https://bar-menu.github.io/Nuovo-New-Year.jpg',
        epiphany: 'https://bar-menu.github.io/Nuovo-Epifania.jpg',
        valentine: 'https://bar-menu.github.io/Nuovo-Valentino.jpg',
        ferragosto: 'https://bar-menu.github.io/Nuovo-Ferragosto.jpg'
    };

    // --- INIZIALIZZAZIONE ---
    function initializeApp() {
        // Verifica elementi critici
        if (!bodyElement || !stickyNavBar || !stickySearchInput || !mainElement || !allSections) {
            console.error("Errore critico: Elementi DOM fondamentali mancanti. Lo script potrebbe non funzionare.");
            return;
        }

        const menuIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#888888" d="M14 2.2C22.5-1.7 32.5-.3 39.6 5.8L80 40.4 120.4 5.8c9-7.7 22.3-7.7 31.2 0L192 40.4 232.4 5.8c9-7.7 22.3-7.7 31.2 0L304 40.4 344.4 5.8c7.1-6.1 17.1-7.5 25.6-3.6s14 12.4 14 21.8l0 464c0 9.4-5.5 17.9-14 21.8s-18.5 2.5-25.6-3.6L304 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L192 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L80 471.6 39.6 506.2c-7.1 6.1-17.1 7.5-25.6 3.6S0 497.4 0 488L0 24C0 14.6 5.5 6.1 14 2.2zM96 144c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 144zM80 352c0 8.8 7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 336c-8.8 0-16 7.2-16 16zM96 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 240z"/></svg>`;
        setSvgFavicon(menuIconSvg);
        setSeasonalHeaderImage();
        stickySearchInput.value = ''; // Pulisci input al caricamento
        resetVisibility();
        setupEventListeners();
        if (stickyNavLinks && stickyNavLinks.length > 0) {
            highlightActiveNavLink(); // Stato iniziale per link attivi
        }
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
        } catch (e) { console.error("Errore Favicon:", e); }
    }

    function setSeasonalHeaderImage() {
        if (!headerElement || !headerImages) return;
        const today = new Date(); const month = today.getMonth(); const day = today.getDate();
        let imageUrl = headerImages.default;
        if ((month === 11 && day >= 8) || (month === 0 && day <= 6)) { imageUrl = headerImages.christmas;}
        else if (month === 0 && day === 1) { imageUrl = headerImages.newYear; }
        else if (month === 0 && day === 6) { imageUrl = headerImages.epiphany;}
        else if (month === 1 && day === 14) { imageUrl = headerImages.valentine;}
        else if (month === 7 && day === 15) { imageUrl = headerImages.ferragosto;}
        headerElement.style.backgroundImage = `url('${imageUrl}')`;
    }

    function resetVisibility() {
         if (!allSections) return;
         allSections.forEach(section => {
             section.style.display = 'block';
             const itemsInSection = section.querySelectorAll('.menu-item, .item-description-footer, h3, p');
             itemsInSection.forEach(item => {
                let displayStyle = 'flex';
                if (item.classList.contains('item-description-footer') ||
                    item.tagName.toLowerCase() === 'h3' ||
                    item.tagName.toLowerCase() === 'p' ||
                    item.closest('.simple-list')) {
                    displayStyle = 'block';
                }
                item.style.display = displayStyle;
             });
         });
         if (noResultsSection) noResultsSection.style.display = 'none';
    }

    // --- GESTIONE MODALITÀ RICERCA ---
    function activateSearchMode() {
        hideDescriptionPopup(); // Chiudi popup se aperto
        if (stickyNavBar && !stickyNavBar.classList.contains('search-active')) {
            stickyNavBar.classList.add('search-active');
            if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'none';
            // Il focus sull'input attiverà l'aggiunta della classe al body
            setTimeout(() => { if (stickySearchInput) stickySearchInput.focus(); }, 50);
        }
    }

    function deactivateSearchMode(resetInput = true) {
        if (stickyNavBar && stickyNavBar.classList.contains('search-active')) {
            stickyNavBar.classList.remove('search-active');
            if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'flex'; // Mostra di nuovo i link
            if (stickySearchInput) {
                if (resetInput) {
                    stickySearchInput.value = '';
                }
                stickySearchInput.blur(); // Il blur attiverà la rimozione della classe dal body
            }
            // Rimuovi la classe per la X interna, se presente
            if (stickyNavBar.classList.contains('input-has-text')) {
                stickyNavBar.classList.remove('input-has-text');
            }
            // Assicurati che il CSS nasconda stickySearchClearBtn se .input-has-text non c'è

            filterItemsAndSections(); // Aggiorna la vista (mostra tutto se input vuoto)
        }
    }

    // --- FILTRAGGIO ELEMENTI ---
    function filterItemsAndSections() {
        if (!stickySearchInput || !allSections) return;

        const searchTerm = stickySearchInput.value.trim().toLowerCase();
        const isSearchActiveNow = searchTerm !== ''; // Se c'è effettivamente un termine di ricerca

        // Se non c'è termine E la modalità ricerca non è attiva, resetta tutto
        if (!isSearchActiveNow && !stickyNavBar.classList.contains('search-active')) {
            resetVisibility();
            if (noResultsSection) noResultsSection.style.display = 'none';
            return;
        }

        let anyItemVisibleGlobal = false;

        allSections.forEach(section => {
            const sectionTitleElement = section.querySelector('h2');
            const sectionTitleText = sectionTitleElement ? sectionTitleElement.textContent.trim().toLowerCase() : '';
            // Il titolo della sezione matcha solo se c'è un termine di ricerca attivo
            const isSectionTitleMatch = isSearchActiveNow && sectionTitleText.includes(searchTerm);
            let sectionHasVisibleItem = false;

            const itemsAndTextBlocksInSection = section.querySelectorAll('.menu-item, .item-description-footer, h3, p');
            itemsAndTextBlocksInSection.forEach(element => {
                let elementText = '';
                let isMatch = false;

                if (isSearchActiveNow) { // Controlla il testo solo se c'è un termine di ricerca
                    if (element.classList.contains('menu-item')) {
                        const itemNameElement = element.querySelector('.item-name');
                        if (itemNameElement) elementText += itemNameElement.textContent.toLowerCase() + ' ';
                        // Aggiungi altre fonti di testo per il .menu-item...
                        const itemDescriptionElements = element.querySelectorAll('.item-description, .item-description-vini, .item-variations');
                        itemDescriptionElements.forEach(desc => { if (desc) elementText += desc.textContent.toLowerCase() + ' '; });
                        if(element.classList.contains('spirit-item')) { // Per data attributes
                            elementText += (element.dataset.description || '').toLowerCase() + ' ';
                            elementText += (element.dataset.preparation || '').toLowerCase() + ' ';
                            elementText += (element.dataset.strength || '').toLowerCase() + ' ';
                        }
                    } else if (element.classList.contains('item-description-footer') || element.tagName.toLowerCase() === 'h3' || element.tagName.toLowerCase() === 'p') {
                        elementText += element.textContent.toLowerCase();
                    }
                    isMatch = elementText.includes(searchTerm);
                } else {
                    // Se la modalità ricerca è attiva ma non c'è testo nell'input, mostra tutto
                    isMatch = true;
                }

                let displayStyle = 'flex';
                if (element.classList.contains('item-description-footer') || element.tagName.toLowerCase() === 'h3' || element.tagName.toLowerCase() === 'p' || element.closest('.simple-list')) {
                    displayStyle = 'block';
                }
                const targetDisplay = isMatch ? displayStyle : 'none';
                if (element.style.display !== targetDisplay) element.style.display = targetDisplay;

                if (isMatch) sectionHasVisibleItem = true;
            });

            // La sezione è visibile se il suo titolo matcha (e c'è un termine) OPPURE se ha un item visibile
            // O se la modalità ricerca è attiva ma non c'è un termine di ricerca (mostra tutto)
            const shouldShowSection = !isSearchActiveNow || isSectionTitleMatch || sectionHasVisibleItem;
            const targetDisplaySection = shouldShowSection ? 'block' : 'none';
            if (section.style.display !== targetDisplaySection) section.style.display = targetDisplaySection;

            if (shouldShowSection) anyItemVisibleGlobal = true;
        });

        // Mostra "Nessun risultato" SOLO se c'è un termine di ricerca e nulla è visibile
        if (noResultsSection) {
            const showNoResults = isSearchActiveNow && !anyItemVisibleGlobal;
            noResultsSection.style.display = showNoResults ? 'flex' : 'none';
            if (showNoResults && noResultsTermSpan) {
                noResultsTermSpan.textContent = stickySearchInput.value.trim();
            }
        }
    }

    // --- GESTIONE POPUP DETTAGLI PRODOTTO ---
    function showDescriptionPopup(element) { /* ...invariato... (assicurati che gli ID usati qui esistano) */ }
    function hideDescriptionPopup() { /* ...invariato... */ }
    function togglePreparationVisibility() { /* ...invariato... */ }

    // --- HIGHLIGHT LINK NAVIGAZIONE ATTIVO ---
    function highlightActiveNavLink() {
        if (!allSections || !stickyNavLinks || !stickyNavBar || stickyNavLinks.length === 0) return;
        let currentSectionId = '';
        const navHeight = stickyNavBar.offsetHeight || 55; // Valore di fallback
        const offsetThreshold = navHeight + 30; // Quando considerare una sezione "attiva"

        allSections.forEach(section => {
            const sectionTop = section.offsetTop - offsetThreshold;
            if (window.scrollY >= sectionTop) { // Se abbiamo scrollato oltre l'inizio (considerando l'offset)
                currentSectionId = section.id; // L'ultima sezione che soddisfa è quella corrente
            }
        });
        // Se siamo molto in alto, nessuna sezione potrebbe essere "current"
        if (window.scrollY < (allSections[0].offsetTop - offsetThreshold) ) {
            currentSectionId = '';
        }


        stickyNavLinks.forEach(link => {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active-link');
            }
        });
    }

    // --- COLLEGAMENTO DEGLI EVENT LISTENER ---
    function setupEventListeners() {
        // 1. Listener Quick Nav (Scroll e Link Attivo)
        const allQuickNavLinks = document.querySelectorAll('#quick-nav a, #quick-nav-mobile-sticky ul a');
        if (allQuickNavLinks.length > 0) {
            allQuickNavLinks.forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    deactivateSearchMode(true);
                    if (typeof hideDescriptionPopup === 'function') hideDescriptionPopup(); // Chiudi popup se esiste
                    const targetId = this.getAttribute('href');
                    try {
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            const stickyNavHeight = stickyNavBar ? stickyNavBar.offsetHeight : 55;
                            const offsetMargin = 20;
                            const headerHeight = headerElement ? headerElement.offsetHeight : 0;
                            // Considera l'altezza dell'header per il primo elemento, altrimenti solo nav sticky
                            let topOffset = (targetId === '#caffetteria' && headerHeight > 0) ? headerHeight + offsetMargin : stickyNavHeight + offsetMargin;
                            if (targetElement.offsetTop < headerHeight + stickyNavHeight + 50) { // Se vicino all'inizio
                                topOffset = offsetMargin + 5; // Meno offset per elementi in cima
                            }


                            let scrollTargetPosition = targetElement.offsetTop - topOffset;
                            // Prevenire scroll negativo
                            if (scrollTargetPosition < 0) scrollTargetPosition = 0;


                            window.scrollTo({ top: scrollTargetPosition, behavior: 'smooth' });

                            if (stickyNavLinks && stickyNavLinks.length > 0) {
                                stickyNavLinks.forEach(lnk => lnk.classList.remove('active-link'));
                                if (this.closest('#quick-nav-mobile-sticky')) {
                                    this.classList.add('active-link');
                                }
                            }
                        } else { console.warn(`Elemento target non trovato: ${targetId}`); }
                    } catch (error) { console.error(`Errore selettore ${targetId}:`, error); }
                });
            });
        }
        window.addEventListener('scroll', highlightActiveNavLink, { passive: true }); // Aggiunto passive


        // 2. Listener Popup Descrizione
        if (spiritItems.length > 0 && descriptionPopup && popupCloseBtn && togglePrepBtn && popupStrength) {
            spiritItems.forEach(item => {
                item.addEventListener('click', (event) => {
                    event.stopPropagation();
                    if (typeof showDescriptionPopup === 'function') showDescriptionPopup(item);
                });
            });
            popupCloseBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                if (typeof hideDescriptionPopup === 'function') hideDescriptionPopup();
            });
            if (togglePrepBtn) { // togglePrepBtn può essere opzionale
                togglePrepBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    if (typeof togglePreparationVisibility === 'function') togglePreparationVisibility();
                });
            }
            descriptionPopup.addEventListener('click', (event) => {
                if (event.target !== popupCloseBtn && (!togglePrepBtn || (event.target !== togglePrepBtn && !togglePrepBtn.contains(event.target))) ) {
                   event.stopPropagation();
                }
            });
        } else {
            console.warn("Funzionalità popup non completamente inizializzata (mancano elementi).");
        }

        // 3. Listener Barra di Ricerca Sticky
        if (stickySearchTrigger && stickyNavBar && stickySearchInput) {
            stickySearchTrigger.addEventListener('click', (event) => {
                event.stopPropagation();
                if (stickyNavBar.classList.contains('search-active')) {
                    deactivateSearchMode(true);
                } else {
                    activateSearchMode();
                }
            });

            stickySearchInput.addEventListener('input', () => {
                filterItemsAndSections();
                if (stickySearchClearBtn) {
                    if (stickySearchInput.value.length > 0) {
                        stickyNavBar.classList.add('input-has-text');
                        // Il CSS dovrebbe gestire display:flex per stickySearchClearBtn con .input-has-text
                    } else {
                        stickyNavBar.classList.remove('input-has-text');
                        // Il CSS dovrebbe gestire display:none per stickySearchClearBtn
                    }
                }
            });

            stickySearchInput.addEventListener('click', (event) => event.stopPropagation());

            // Listener per focus e blur per la classe su body
            stickySearchInput.addEventListener('focus', () => {
                if (bodyElement) bodyElement.classList.add('search-input-focused');
            });
            stickySearchInput.addEventListener('blur', () => {
                if (bodyElement) bodyElement.classList.remove('search-input-focused');
            });
        }

        // Listener per il bottone X di pulizia interna (se esiste)
        if (stickySearchClearBtn && stickySearchInput) {
            stickySearchClearBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                stickySearchInput.value = '';
                stickySearchInput.focus();
                // Scatena manualmente l'evento 'input' per aggiornare la visibilità della X e i filtri
                stickySearchInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            });
        }

        // 4. Listener Globale (Document) per chiudere cliccando fuori
        document.addEventListener('click', (event) => {
             if (stickyNavBar && stickyNavBar.classList.contains('search-active') &&
                 !stickyNavBar.contains(event.target) && // Clic fuori dalla barra intera
                 event.target !== stickySearchTrigger && !stickySearchTrigger.contains(event.target) ) { // E non sul trigger
                 deactivateSearchMode(false);
             }
             if (descriptionPopup && descriptionPopup.classList.contains('visible') &&
                 !descriptionPopup.contains(event.target) &&
                 !event.target.closest('.spirit-item')) {
                 if (typeof hideDescriptionPopup === 'function') hideDescriptionPopup();
             }
        });

        // 5. Listener per il link "cancella ricerca" in #no-results
        if (clearSearchNoResultsLink && noResultsSection && stickySearchInput && stickyNavBar && stickyNavLinksWrapper) {
            clearSearchNoResultsLink.addEventListener('click', (event) => {
                event.preventDefault();
                deactivateSearchMode(true);
                if (noResultsSection) noResultsSection.style.display = 'none';
            });
        }

    } // Fine setupEventListeners

    // --- ESECUZIONE INIZIALE ---
    initializeApp();

}); // Fine del SINGOLO DOMContentLoaded wrapper