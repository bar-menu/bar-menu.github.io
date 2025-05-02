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
    const allSections = mainElement?.querySelectorAll('section:not(#no-results)');
    const noResultsSection = document.getElementById('no-results');
    const noResultsTermSpan = document.getElementById('no-results-term');

    // Elementi Popup Descrizione Dettagliata
    const descriptionPopup = document.getElementById('gin-description-popup');
    const popupContent = descriptionPopup?.querySelector('.popup-content');
    const popupProductName = document.getElementById('popup-product-name');
    const popupStrength = document.getElementById('popup-strength'); // Selettore ripristinato
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
        // Verifica elementi essenziali, inclusi quelli del popup ripristinati
        if (!mainElement || !allSections || !descriptionPopup || !popupProductName || !popupStrength || !popupProductDescription || !popupPreparationContainer || !popupPreparationText || !togglePrepBtn || !popupCloseBtn) {
            console.error("Errore: Elementi DOM essenziali (inclusi elementi popup) non trovati. Script interrotto.");
            // Potresti voler aggiungere un log più specifico per capire quale elemento manca
             if (!popupStrength) console.error("Elemento #popup-strength non trovato!");
             // ... altri controlli specifici se necessario ...
            return; // Interrompi se manca qualcosa di fondamentale
        }
        const menuIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#888888" d="M14 2.2C22.5-1.7 32.5-.3 39.6 5.8L80 40.4 120.4 5.8c9-7.7 22.3-7.7 31.2 0L192 40.4 232.4 5.8c9-7.7 22.3-7.7 31.2 0L304 40.4 344.4 5.8c7.1-6.1 17.1-7.5 25.6-3.6s14 12.4 14 21.8l0 464c0 9.4-5.5 17.9-14 21.8s-18.5 2.5-25.6-3.6L304 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L192 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L80 471.6 39.6 506.2c-7.1 6.1-17.1 7.5-25.6 3.6S0 497.4 0 488L0 24C0 14.6 5.5 6.1 14 2.2zM96 144c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 144zM80 352c0 8.8 7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 336c-8.8 0-16 7.2-16 16zM96 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 240z"/></svg>`;
        setSvgFavicon(menuIconSvg);
        setSeasonalHeaderImage();
        if (searchInputDesktop) searchInputDesktop.value = '';
        if (stickySearchInput) stickySearchInput.value = '';
        resetVisibility();
        setupEventListeners(); // Chiama dopo che le verifiche sono passate
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
             const itemsInSection = section.querySelectorAll('.menu-item, .item-description-footer');
             itemsInSection.forEach(item => {
                let displayStyle = 'flex';
                if (item.classList.contains('item-description-footer') || item.closest('.simple-list')) {
                    displayStyle = 'block';
                }
                item.style.display = displayStyle;
             });
         });
         if (noResultsSection) noResultsSection.style.display = 'none';
    }

    // --- GESTIONE SISTEMA DI RICERCA ---
    function activateSearch(type) {
        hideDescriptionPopup();
        if (type === 'desktop' && searchWrapperDesktop && !searchWrapperDesktop.classList.contains('search-active')) {
             deactivateSearch(false, 'mobile');
             searchWrapperDesktop.classList.add('search-active');
             setTimeout(() => { if (searchInputDesktop) searchInputDesktop.focus(); }, 50);
        } else if (type === 'mobile' && stickyNavBar && !stickyNavBar.classList.contains('search-active')) {
             deactivateSearch(false, 'desktop');
             stickyNavBar.classList.add('search-active');
             if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'none';
             setTimeout(() => { if (stickySearchInput) stickySearchInput.focus(); }, 50);
        }
    }

    function deactivateSearch(resetSearch = true, type) {
        let inputToClear = null;
        let wasActive = false;
        if (type === 'desktop' && searchWrapperDesktop && searchWrapperDesktop.classList.contains('search-active')) {
            searchWrapperDesktop.classList.remove('search-active');
            if (searchInputDesktop) searchInputDesktop.blur();
            inputToClear = searchInputDesktop;
            wasActive = true;
        } else if (type === 'mobile' && stickyNavBar && stickyNavBar.classList.contains('search-active')) {
            stickyNavBar.classList.remove('search-active');
            if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'flex';
            if (stickySearchInput) stickySearchInput.blur();
            inputToClear = stickySearchInput;
            wasActive = true;
        }
        if (resetSearch && inputToClear) {
            inputToClear.value = '';
        }
        if (resetSearch && wasActive) {
             filterItemsAndSections(type);
        }
    }

    function filterItemsAndSections(sourceType) {
        const inputElement = (sourceType === 'desktop') ? searchInputDesktop : stickySearchInput;
        if (!inputElement) return;
        const searchTerm = inputElement.value.trim().toLowerCase();
        const isSearchActive = searchTerm !== '';
        let anyItemVisibleGlobal = false;
        if (!isSearchActive) {
            resetVisibility();
            return;
        }
        if (!allSections) return;
        allSections.forEach(section => {
            const sectionTitleElement = section.querySelector('h2');
            const sectionTitleText = sectionTitleElement ? sectionTitleElement.textContent.trim().toLowerCase() : '';
            const isSectionTitleMatch = sectionTitleText.includes(searchTerm);
            let sectionHasVisibleItem = false;
            const itemsInSection = section.querySelectorAll('.menu-item, .item-description-footer');
            itemsInSection.forEach(item => {
                let itemText = '';
                let isMatch = false;
                const itemNameElement = item.querySelector('.item-name');
                const itemDescriptionElement = item.querySelector('.item-description:not(.item-description-footer):not(.item-variations), .item-description-vini');
                const itemVariationsElement = item.querySelector('.item-variations');
                if (itemNameElement) itemText += itemNameElement.textContent.toLowerCase() + ' ';
                if (itemDescriptionElement) itemText += itemDescriptionElement.textContent.toLowerCase() + ' ';
                if (itemVariationsElement) itemText += itemVariationsElement.textContent.toLowerCase() + ' ';
                const dataDesc = item.dataset.description ? item.dataset.description.toLowerCase() : '';
                if (dataDesc) itemText += dataDesc + ' ';
                const dataStrength = item.dataset.strength ? item.dataset.strength.toLowerCase() : '';
                if (dataStrength) itemText += dataStrength + ' ';
                if (item.classList.contains('item-description-footer')) itemText += item.textContent.toLowerCase();
                isMatch = itemText.includes(searchTerm);
                let displayStyle = 'flex';
                if (item.classList.contains('item-description-footer') || item.closest('.simple-list')) {
                    displayStyle = 'block';
                }
                const targetDisplay = isMatch ? displayStyle : 'none';
                // Applica lo stile solo se è diverso per evitare reflow inutili
                if (item.style.display !== targetDisplay) item.style.display = targetDisplay;
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
        // Verifica elementi popup necessari (incluso popupStrength)
         if (!descriptionPopup || !popupContent || !popupProductName || !popupStrength || !popupProductDescription || !popupPreparationContainer || !popupPreparationText || !togglePrepBtn) {
             console.error("Elementi popup mancanti in showDescriptionPopup.");
             return; // Non continuare se manca qualcosa
         }

        // Recupera dati
        const name = element.querySelector('.item-name')?.textContent || 'Prodotto';
        const description = element.dataset.description || 'Nessuna descrizione disponibile.';
        const strength = element.dataset.strength;
        const preparation = element.dataset.preparation;

        // Popola campi base
        popupProductName.textContent = name;
        popupProductDescription.textContent = description;

        // Gestisci sezione preparazione
        if (preparation && popupPreparationContainer && popupPreparationText && togglePrepBtn) {
            popupPreparationText.textContent = preparation; // Solo testo preparazione
            togglePrepBtn.style.display = 'block'; // Mostra bottone

            // Gestisci badge forza DENTRO la sezione preparazione
            if (strength && popupStrength) {
                popupStrength.textContent = strength;
                popupStrength.className = 'strength-badge'; // Resetta classi
                const strengthClass = `strength-${strength.toLowerCase().replace(/[\s/]+/g, '-')}`;
                popupStrength.classList.add(strengthClass);
                popupStrength.style.display = 'inline-block'; // Mostra
            } else if (popupStrength) {
                popupStrength.style.display = 'none'; // Nascondi se non c'è forza
            }

            // Resetta stato toggle
            popupPreparationContainer.style.display = 'none';
            descriptionPopup.classList.remove('preparation-visible');
            togglePrepBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Come si fa?';
            togglePrepBtn.title = "Mostra preparazione";

        } else { // Se non c'è preparazione
            if (togglePrepBtn) togglePrepBtn.style.display = 'none';
            if (popupPreparationContainer) popupPreparationContainer.style.display = 'none';
            if (popupStrength) popupStrength.style.display = 'none'; // Nascondi badge
            descriptionPopup.classList.remove('preparation-visible');
        }

        // Mostra il popup
        descriptionPopup.classList.add('visible');
    }

    function hideDescriptionPopup() {
        if (!descriptionPopup) { return; }
        descriptionPopup.classList.remove('visible');
        descriptionPopup.classList.remove('preparation-visible');
         if (popupPreparationContainer) popupPreparationContainer.style.display = 'none';
         // Nascondi il badge strength quando chiudi il popup
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
                deactivateSearch(true, 'desktop');
                deactivateSearch(true, 'mobile');
                hideDescriptionPopup();
                const targetId = this.getAttribute('href');
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 20;
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
        // Verifica elementi essenziali (CON popupStrength)
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
                 event.stopPropagation();
             });
        } else {
            // Log migliorato per capire cosa manca
            console.warn("Funzionalità popup disabilitata. Verifica l'esistenza di: .spirit-item(s) = ", spiritItems.length, ", #gin-description-popup = ", !!descriptionPopup, ", #popup-close-btn = ", !!popupCloseBtn, ", #toggle-prep-btn = ", !!togglePrepBtn, ", #popup-strength = ", !!popupStrength);
        }

        // 3. Listener Ricerca Desktop
        if (searchIconTriggerDesktop && searchWrapperDesktop && searchInputDesktop && searchInputContainerDesktop) {
            searchIconTriggerDesktop.addEventListener('click', (event) => {
                event.stopPropagation();
                if (searchWrapperDesktop.classList.contains('search-active')) {
                    deactivateSearch(true, 'desktop');
                } else {
                    activateSearch('desktop');
                }
            });
            searchInputDesktop.addEventListener('input', () => filterItemsAndSections('desktop'));
            searchInputDesktop.addEventListener('click', (e) => e.stopPropagation());
            searchInputContainerDesktop.addEventListener('click', (e) => e.stopPropagation());
        }

        // 4. Listener Ricerca Mobile Sticky
        if (stickySearchTrigger && stickyNavBar && stickySearchInput) {
            stickySearchTrigger.addEventListener('click', (event) => {
                event.stopPropagation();
                if (stickyNavBar.classList.contains('search-active')) {
                    deactivateSearch(true, 'mobile');
                } else {
                    activateSearch('mobile');
                }
            });
            stickySearchInput.addEventListener('input', () => filterItemsAndSections('mobile'));
             stickySearchInput.addEventListener('click', (event) => {
                 event.stopPropagation();
             });
        }

         // 5. Listener Globale (Document) per chiudere cliccando fuori
         document.addEventListener('click', (event) => {
             if (searchWrapperDesktop && searchWrapperDesktop.classList.contains('search-active') && !searchWrapperDesktop.contains(event.target)) {
                deactivateSearch(false, 'desktop');
             }
             if (stickyNavBar && stickyNavBar.classList.contains('search-active') && !stickyNavBar.contains(event.target)) {
                 deactivateSearch(false, 'mobile');
             }
             if (descriptionPopup && descriptionPopup.classList.contains('visible') && !descriptionPopup.contains(event.target) && !event.target.closest('.spirit-item')) {
                 hideDescriptionPopup();
             }
         });

    } // Fine setupEventListeners

    // --- ESECUZIONE INIZIALE ---
    initializeApp();

}); // Fine DOMContentLoaded wrapper