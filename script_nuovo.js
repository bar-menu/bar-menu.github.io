// --- JAVASCRIPT (script_nuovo.js) ---

document.addEventListener('DOMContentLoaded', () => {
    // --- SELETTORI DOM GLOBALI ---
    const bodyElement = document.body;

    // Elementi Ricerca Sticky
    const stickyNavBar = document.getElementById('quick-nav-mobile-sticky');
    const stickySearchContainer = document.getElementById('sticky-search-container');
    const stickySearchTrigger = document.getElementById('sticky-search-trigger');
    const stickySearchInput = document.getElementById('sticky-search-input');
    const stickySearchClearBtn = document.getElementById('sticky-search-clear-btn');
    const stickyNavLinksWrapper = stickyNavBar?.querySelector('.sticky-nav-links-wrapper');

    // Elementi Principali Pagina e Contenuto Menu
    const headerElement = document.querySelector('header');
    const mainElement = document.querySelector('main');
    const allSections = mainElement?.querySelectorAll('section:not(#no-results)');
    const noResultsSection = document.getElementById('no-results');
    const noResultsTermSpan = document.getElementById('no-results-term');
    const clearSearchNoResultsLink = document.getElementById('clear-search-link');

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

    const headerImages = {
        default: 'https://bar-menu.github.io/Nuovo-2.jpg',
        christmas: 'https://bar-menu.github.io/Nuovo-Natale.jpg',
        newYear: 'https://bar-menu.github.io/Nuovo-New-Year.jpg',
        epiphany: 'https://bar-menu.github.io/Nuovo-Epifania.jpg',
        valentine: 'https://bar-menu.github.io/Nuovo-Valentino.jpg',
        ferragosto: 'https://bar-menu.github.io/Nuovo-Ferragosto.jpg'
    };

    function initializeApp() {
        const criticalElements = [
            bodyElement, headerElement, mainElement, allSections,
            descriptionPopup, popupContent, popupProductName, popupProductDescription,
            popupPreparationContainer, popupPreparationText, togglePrepBtn, popupCloseBtn,
            stickyNavBar, stickySearchContainer, stickySearchTrigger, stickySearchInput, stickyNavLinksWrapper
        ];
        if (criticalElements.some(el => !el || (el instanceof NodeList && el.length === 0))) {
            console.error("Errore Critico: Elementi DOM fondamentali mancanti. Script potrebbe non funzionare correttamente.");
            // Log dettagliato per debug
            if (!descriptionPopup) console.error("- #gin-description-popup mancante.");
            if (!popupContent) console.error("- .popup-content mancante.");
            // ... altri controlli specifici
            // Non fare return qui per permettere ad altre parti (es. ricerca) di funzionare se i loro elementi ci sono.
            // La gestione del popup verrà disabilitata nei suoi listener.
        }

        const menuIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#888888" d="M14 2.2C22.5-1.7 32.5-.3 39.6 5.8L80 40.4 120.4 5.8c9-7.7 22.3-7.7 31.2 0L192 40.4 232.4 5.8c9-7.7 22.3-7.7 31.2 0L304 40.4 344.4 5.8c7.1-6.1 17.1-7.5 25.6-3.6s14 12.4 14 21.8l0 464c0 9.4-5.5 17.9-14 21.8s-18.5 2.5-25.6-3.6L304 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L192 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L80 471.6 39.6 506.2c-7.1 6.1-17.1 7.5-25.6 3.6S0 497.4 0 488L0 24C0 14.6 5.5 6.1 14 2.2zM96 144c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 144zM80 352c0 8.8 7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 336c-8.8 0-16 7.2-16 16zM96 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 240z"/></svg>`;
        setSvgFavicon(menuIconSvg);
        setSeasonalHeaderImage();
        if (stickySearchInput) stickySearchInput.value = '';
        resetVisibility();
        setupEventListeners();
    }

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
        if ((month === 11 && day >= 8) || (month === 0 && day <= 6)) {
             if (month === 0 && day === 1) imageUrl = headerImages.newYear;
             else if (month === 0 && day === 6) imageUrl = headerImages.epiphany;
             else imageUrl = headerImages.christmas;
        } else if (month === 1 && day === 14) { imageUrl = headerImages.valentine; }
        else if (month === 7 && day === 15) { imageUrl = headerImages.ferragosto; }
        if (imageUrl) headerElement.style.backgroundImage = `url('${imageUrl}')`;
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

    function activateSearchMode() {
        hideDescriptionPopup();
        if (stickyNavBar && !stickyNavBar.classList.contains('search-active')) {
            stickyNavBar.classList.add('search-active');
            if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'none';
            setTimeout(() => { if (stickySearchInput) stickySearchInput.focus(); }, 50);
        }
    }

    function deactivateSearchMode(resetInput = true) {
        if (stickyNavBar && stickyNavBar.classList.contains('search-active')) {
            stickyNavBar.classList.remove('search-active');
            if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'flex';
            if (stickySearchInput) {
                if (resetInput) stickySearchInput.value = '';
                stickySearchInput.blur();
            }
            if (stickySearchClearBtn && stickyNavBar.classList.contains('input-has-text')) {
                 stickyNavBar.classList.remove('input-has-text'); // CSS gestirà la X tramite questa classe
            }
            filterItemsAndSections();
        }
    }

    function filterItemsAndSections() {
        const inputElement = stickySearchInput;
        if (!inputElement || !allSections) return;

        const searchTerm = inputElement.value.trim().toLowerCase();
        const isUISearchActive = stickyNavBar ? stickyNavBar.classList.contains('search-active') : false;
        const hasSearchTerm = searchTerm !== '';

        if (!hasSearchTerm && !isUISearchActive) { // Se non c'è termine e la UI ricerca è chiusa, resetta
            resetVisibility();
            if (noResultsSection) noResultsSection.style.display = 'none';
            return;
        }
        // Se UI ricerca è aperta ma non c'è termine, mostra tutto
        const showAllDueToEmptyInputInActiveMode = isUISearchActive && !hasSearchTerm;

        let anyItemVisibleGlobal = false;

        allSections.forEach(section => {
            const sectionTitleElement = section.querySelector('h2');
            const sectionTitleText = sectionTitleElement ? sectionTitleElement.textContent.trim().toLowerCase() : '';
            const isSectionTitleMatch = hasSearchTerm && sectionTitleText.includes(searchTerm);
            let sectionHasVisibleItem = false;

            const itemsAndTextBlocksInSection = section.querySelectorAll('.menu-item, .item-description-footer, h3, p');
            itemsAndTextBlocksInSection.forEach(element => {
                let elementText = '';
                let isMatch = false;

                if (showAllDueToEmptyInputInActiveMode) {
                    isMatch = true;
                } else if (hasSearchTerm) {
                    if (element.classList.contains('menu-item')) {
                        const itemNameElement = element.querySelector('.item-name');
                        const itemDescriptionElements = element.querySelectorAll('[class*="item-description"]:not(.item-description-footer):not(.item-variations), .item-description-vini');
                        const itemVariationsElement = element.querySelector('.item-variations');

                        if (itemNameElement) elementText += itemNameElement.textContent.toLowerCase() + ' ';
                        itemDescriptionElements.forEach(descEl => { if (descEl) elementText += descEl.textContent.toLowerCase() + ' '; });
                        if (itemVariationsElement) elementText += itemVariationsElement.textContent.toLowerCase() + ' ';
                        elementText += (element.dataset.description || '').toLowerCase() + ' ';
                        elementText += (element.dataset.strength || '').toLowerCase() + ' ';
                    } else if (element.classList.contains('item-description-footer') || element.tagName.toLowerCase() === 'h3' || element.tagName.toLowerCase() === 'p') {
                        elementText += element.textContent.toLowerCase();
                    }
                    isMatch = elementText.includes(searchTerm);
                } else { // UI non attiva e nessun termine di ricerca (dovrebbe essere gestito dal primo if, ma per sicurezza)
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

            const shouldShowSection = showAllDueToEmptyInputInActiveMode || isSectionTitleMatch || sectionHasVisibleItem;
            const targetDisplaySection = shouldShowSection ? 'block' : 'none';
            if (section.style.display !== targetDisplaySection) section.style.display = targetDisplaySection;
            if (shouldShowSection) anyItemVisibleGlobal = true;
        });

        const showNoResults = hasSearchTerm && !anyItemVisibleGlobal;
        if (noResultsSection) {
            if (showNoResults) {
                if (noResultsTermSpan) noResultsTermSpan.textContent = inputElement.value.trim();
                noResultsSection.style.display = 'flex'; // O 'block' come da tuo CSS
            } else {
                noResultsSection.style.display = 'none';
            }
        }
    }

    function showDescriptionPopup(element) {
        if (!descriptionPopup || !popupContent || !popupProductName || !popupProductDescription || !popupPreparationContainer || !popupPreparationText || !togglePrepBtn || !popupCloseBtn) {
            console.error("Popup error: Elementi DOM del popup mancanti in showDescriptionPopup.");
            return;
        }

        const name = element.querySelector('.item-name')?.textContent || 'Prodotto';
        const description = element.dataset.description || element.querySelector('.item-description')?.textContent || 'Nessuna descrizione disponibile.';
        const strength = element.dataset.strength;
        const preparation = element.dataset.preparation;

        popupProductName.textContent = name;
        popupProductDescription.textContent = description;

        if (preparation) {
            popupPreparationText.innerHTML = preparation.replace(/\n/g, '<br>');
            togglePrepBtn.style.display = 'block'; // Mostra il bottone
            popupPreparationContainer.classList.remove('prep-visible'); // Nascosto di default
            togglePrepBtn.classList.remove('prep-shown');
            togglePrepBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Come si fa?';
            togglePrepBtn.title = "Mostra preparazione";

            if (strength && popupStrength) {
                popupStrength.textContent = strength;
                popupStrength.className = 'strength-badge'; // Resetta classi
                const strengthClass = `strength-${strength.toLowerCase().replace(/[\s/]+/g, '-')}`;
                popupStrength.classList.add(strengthClass);
                popupStrength.style.display = 'inline-block'; // Mostra il badge
            } else if (popupStrength) {
                popupStrength.style.display = 'none'; // Nascondi se non c'è strength
            }
        } else {
            togglePrepBtn.style.display = 'none';
            popupPreparationContainer.classList.remove('prep-visible');
            if (popupStrength) popupStrength.style.display = 'none';
        }
        descriptionPopup.classList.add('visible');
        if (bodyElement) bodyElement.classList.add('popup-open');
    }

    function hideDescriptionPopup() {
        if (!descriptionPopup) return;
        descriptionPopup.classList.remove('visible');
        if (bodyElement) bodyElement.classList.remove('popup-open');
        // Resetta anche lo stato della preparazione
        if (popupPreparationContainer) popupPreparationContainer.classList.remove('prep-visible');
        if (togglePrepBtn) togglePrepBtn.classList.remove('prep-shown');
    }

    function togglePreparationVisibility() {
        if (!popupPreparationContainer || !togglePrepBtn) return;
        popupPreparationContainer.classList.toggle('prep-visible');
        const isVisible = popupPreparationContainer.classList.contains('prep-visible');
        togglePrepBtn.classList.toggle('prep-shown', isVisible);

        if (isVisible) {
            togglePrepBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Nascondi preparazione';
            togglePrepBtn.title = "Nascondi preparazione";
        } else {
            togglePrepBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Come si fa?';
            togglePrepBtn.title = "Mostra preparazione";
        }
    }

    function setupEventListeners() {
        // 1. Listener Quick Nav (Scroll)
        document.querySelectorAll('#quick-nav a, #quick-nav-mobile-sticky ul a').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                deactivateSearchMode(true);
                hideDescriptionPopup();
                const targetId = this.getAttribute('href');
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        const stickyNavHeight = stickyNavBar ? stickyNavBar.offsetHeight : 55;
                        const offsetMargin = (targetId === '#caffetteria' && headerElement && headerElement.offsetHeight > 0) ? 5 : 20; // Meno offset per il primo se header visibile
                        const headerHeightForOffset = (targetId === '#caffetteria' && headerElement) ? headerElement.offsetHeight : 0;

                        let scrollTargetPosition = targetElement.offsetTop - stickyNavHeight - offsetMargin;
                        if(targetId === '#caffetteria' && headerHeightForOffset > 0) { // Caso speciale per il primo elemento con header
                           scrollTargetPosition = targetElement.offsetTop - headerHeightForOffset - offsetMargin;
                        }
                        if (scrollTargetPosition < 0) scrollTargetPosition = 0; // Evita scroll negativo

                        window.scrollTo({ top: scrollTargetPosition, behavior: 'smooth' });
                    } else { console.warn(`Target non trovato: ${targetId}`); }
                } catch (error) { console.error(`Errore selettore ${targetId}:`, error); }
            });
        });

        // 2. Listener Popup Descrizione
        if (spiritItems.length > 0 && descriptionPopup && popupContent && popupCloseBtn && togglePrepBtn) {
            spiritItems.forEach(item => {
                const hasDescription = item.dataset.description || item.querySelector('.item-description');
                if (hasDescription) { // Solo se c'è una descrizione da mostrare
                    item.style.cursor = 'pointer';
                    item.addEventListener('click', (event) => {
                        event.stopPropagation();
                        showDescriptionPopup(item);
                    });
                }
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
                if (event.target === descriptionPopup) { // Click sull'overlay
                    hideDescriptionPopup();
                }
            });
            popupContent.addEventListener('click', (event) => {
                event.stopPropagation(); // Previene chiusura se si clicca dentro il contenuto
            });
        } else {
            console.warn("Funzionalità Popup Descrizione disabilitata o elementi DOM critici mancanti.");
        }

        // 3. Listener Ricerca Mobile Sticky
        if (stickySearchTrigger && stickyNavBar && stickySearchInput && stickySearchContainer) {
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
                if (stickySearchClearBtn) { // Gestione X interna
                    if (stickySearchInput.value.length > 0) {
                        stickyNavBar.classList.add('input-has-text'); // CSS mostrerà X
                    } else {
                        stickyNavBar.classList.remove('input-has-text'); // CSS nasconderà X
                    }
                }
            });
            stickySearchInput.addEventListener('click', (event) => event.stopPropagation());
            if (stickySearchClearBtn) { // Listener per la X interna
                stickySearchClearBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    stickySearchInput.value = '';
                    filterItemsAndSections(); // Riesegui filtro
                    stickyNavBar.classList.remove('input-has-text');
                    stickySearchInput.focus(); // Mantieni il focus per nuova ricerca
                });
            }
        }

        // 4. Listener Globale (Document) per chiudere cliccando fuori dalla ricerca
        document.addEventListener('click', (event) => {
            if (stickyNavBar && stickySearchContainer && stickyNavBar.classList.contains('search-active') &&
                !stickySearchContainer.contains(event.target) && // Clic fuori dal contenitore della ricerca
                event.target !== stickySearchTrigger && !stickySearchTrigger.contains(event.target)) { // E non sul trigger
                deactivateSearchMode(false); // Non resettare l'input, l'utente potrebbe voler vedere i risultati
            }
            // La chiusura del popup cliccando fuori è gestita dal suo listener diretto sull'overlay
        });

        // 5. Listener per il link "cancella ricerca" in #no-results
        if (clearSearchNoResultsLink && noResultsSection && stickySearchInput) {
            clearSearchNoResultsLink.addEventListener('click', (event) => {
                event.preventDefault();
                deactivateSearchMode(true); // Resetta e chiudi
                if (noResultsSection) noResultsSection.style.display = 'none';
            });
        }
    }

    initializeApp();
});