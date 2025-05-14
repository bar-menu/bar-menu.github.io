// --- JAVASCRIPT ---

document.addEventListener('DOMContentLoaded', () => {
    // --- SELETTORI DOM ---
    const bodyElement = document.body; // Aggiunto per classe focus
    const stickyNavBar = document.getElementById('quick-nav-mobile-sticky');
    const stickySearchTrigger = document.getElementById('sticky-search-trigger');
    const stickySearchInput = document.getElementById('sticky-search-input');
    const stickySearchClearBtn = document.getElementById('sticky-search-clear-btn');
    const stickyNavLinksWrapper = stickyNavBar?.querySelector('.sticky-nav-links-wrapper');
    const stickyNavLinks = stickyNavBar?.querySelectorAll('ul a');

    const headerElement = document.querySelector('header');
    const mainElement = document.querySelector('main');
    const allSections = mainElement?.querySelectorAll('section:not(#no-results)');
    const noResultsSection = document.getElementById('no-results');
    const noResultsTermSpan = document.getElementById('no-results-term');
    const clearSearchNoResultsLink = document.getElementById('clear-search-link');

    const descriptionPopup = document.getElementById('gin-description-popup');
    const popupContent = descriptionPopup?.querySelector('.popup-content');
    const popupProductName = document.getElementById('popup-product-name');
    const popupStrength = document.getElementById('popup-strength');
    const popupProductDescription = document.getElementById('popup-product-description');
    const popupPreparationContainer = document.getElementById('popup-preparation-container');
    const popupPreparationText = document.getElementById('popup-preparation-text');
    const togglePrepBtn = document.getElementById('toggle-prep-btn');
    const popupCloseBtn = document.getElementById('popup-close-btn');

    const spiritItems = document.querySelectorAll('.spirit-item');

    const headerImages = { /* ... URLs invariati ... */ };

    // --- INIZIALIZZAZIONE APP ---
    function initializeApp() {
        const essentialElements = [
            bodyElement, mainElement, allSections, descriptionPopup, popupProductName, popupStrength,
            popupProductDescription, popupPreparationContainer, popupPreparationText,
            togglePrepBtn, popupCloseBtn, stickyNavBar, stickySearchTrigger,
            stickySearchInput, /* stickySearchClearBtn può essere null se HTML non aggiornato, gestito nei listener */
            stickyNavLinksWrapper, stickyNavLinks
        ];
        if (essentialElements.some(el => !el || (el instanceof NodeList && el.length === 0) )) {
            console.error("Errore: Elementi DOM essenziali non trovati. Script interrotto.");
            if (!stickyNavLinks || stickyNavLinks.length === 0) console.error("Link di navigazione sticky non trovati!");
            return;
        }

        const menuIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="#888888" d="M14 2.2C22.5-1.7 32.5-.3 39.6 5.8L80 40.4 120.4 5.8c9-7.7 22.3-7.7 31.2 0L192 40.4 232.4 5.8c9-7.7 22.3-7.7 31.2 0L304 40.4 344.4 5.8c7.1-6.1 17.1-7.5 25.6-3.6s14 12.4 14 21.8l0 464c0 9.4-5.5 17.9-14 21.8s-18.5 2.5-25.6-3.6L304 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L192 471.6l-40.4 34.6c-9 7.7-22.3 7.7-31.2 0L80 471.6 39.6 506.2c-7.1 6.1-17.1 7.5-25.6 3.6S0 497.4 0 488L0 24C0 14.6 5.5 6.1 14 2.2zM96 144c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 144zM80 352c0 8.8 7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 336c-8.8 0-16 7.2-16 16zM96 240c-8.8 0-16 7.2-16 16s7.2 16 16 16l192 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L96 240z"/></svg>`;
        setSvgFavicon(menuIconSvg);
        setSeasonalHeaderImage();
        if (stickySearchInput) stickySearchInput.value = '';
        resetVisibility();
        setupEventListeners();
        highlightActiveNavLink();
    }

    // --- FUNZIONI UTILITY ---
    function setSvgFavicon(svgString) { /* ...codice invariato... */ }
    function setSeasonalHeaderImage() { /* ...codice invariato... */ }
    function resetVisibility() { /* ...codice invariato... */ }

    // --- GESTIONE POSIZIONE BARRA STICKY CON TASTIERA (VisualViewportAPI) ---
    let isKeyboardVisible = false; // Stato per tracciare la visibilità della tastiera

    function handleStickyNavPositionWithKeyboard() {
        if (!stickyNavBar || !window.visualViewport) {
            if (stickyNavBar) stickyNavBar.style.bottom = '0px'; // Fallback se API non supportata
            return;
        }

        const searchInputIsFocused = document.activeElement === stickySearchInput;
        const currentViewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight; // Altezza totale della finestra del browser
        const approximateKeyboardHeight = windowHeight - currentViewportHeight;

        // Un threshold per considerare la tastiera effettivamente "aperta"
        // Evita piccoli aggiustamenti dovuti a UI del browser che cambiano leggermente la visualViewport
        const keyboardThreshold = 50; //px

        if (searchInputIsFocused && approximateKeyboardHeight > keyboardThreshold) {
            // La tastiera è considerata aperta e l'input ha il focus
            stickyNavBar.style.bottom = approximateKeyboardHeight + 'px';
            isKeyboardVisible = true;
            if (bodyElement) bodyElement.classList.add('keyboard-visible'); // Classe opzionale per altri stili
        } else {
            // La tastiera è considerata chiusa o l'input non ha il focus
            stickyNavBar.style.bottom = '0px';
            isKeyboardVisible = false;
            if (bodyElement) bodyElement.classList.remove('keyboard-visible');
        }
    }


    // --- GESTIONE SISTEMA DI RICERCA ---
    function activateSearchMode() {
        hideDescriptionPopup();
        if (stickyNavBar && !stickyNavBar.classList.contains('search-active')) {
            stickyNavBar.classList.add('search-active');
            if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'none';
            setTimeout(() => {
                if (stickySearchInput) stickySearchInput.focus();
                // Dopo il focus, la VisualViewportAPI dovrebbe gestire il posizionamento della barra
            }, 50);
        }
    }

    function deactivateSearchMode(resetInput = true) {
        if (stickyNavBar && stickyNavBar.classList.contains('search-active')) {
            stickyNavBar.classList.remove('search-active');
            stickyNavBar.classList.remove('input-has-text');
            if (stickyNavLinksWrapper) stickyNavLinksWrapper.style.display = 'flex';
            if (stickySearchClearBtn) {
                stickySearchClearBtn.style.opacity = '0';
                setTimeout(() => { if(stickySearchClearBtn) stickySearchClearBtn.style.display = 'none'; }, 200);
            }
            if (resetInput && stickySearchInput) {
                stickySearchInput.value = '';
            }
            // Non sfocare qui se l'utente clicca la X esterna,
            // il focus si perderà naturalmente o con il click successivo.
            // if (stickySearchInput) stickySearchInput.blur();
            filterItemsAndSections();
            // La VisualViewportAPI dovrebbe resettare il bottom della barra quando l'input perde il focus
            // o se la tastiera si chiude.
            // Forziamo un check qui se l'input è stato sfocato implicitamente
            setTimeout(handleStickyNavPositionWithKeyboard, 100);
        }
    }

    function filterItemsAndSections() { /* ...codice invariato dalla tua ultima versione fornita... */ }

    // --- GESTIONE POPUP DETTAGLI PRODOTTO ---
    function showDescriptionPopup(element) { /* ...codice invariato... */ }
    function hideDescriptionPopup() { /* ...codice invariato... */ }
    function togglePreparationVisibility() { /* ...codice invariato... */ }

    // --- HIGHLIGHT LINK NAVIGAZIONE ATTIVO ---
    function highlightActiveNavLink() { /* ...codice invariato... */ }

    // --- COLLEGAMENTO DEGLI EVENT LISTENER ---
    function setupEventListeners() {
        // 1. Listener Quick Nav (Scroll e Link Attivo)
        if (stickyNavLinks && stickyNavLinks.length > 0) {
            stickyNavLinks.forEach(anchor => { /* ...codice invariato... */ });
        }
        window.addEventListener('scroll', highlightActiveNavLink);

        // 2. Listener Popup Descrizione
        if (spiritItems.length > 0 && descriptionPopup && popupCloseBtn && togglePrepBtn && popupStrength) {
            /* ...codice invariato... */
        } else { console.warn("Funzionalità popup disabilitata."); }

        // 3. Listener Barra di Ricerca Sticky
        if (stickySearchTrigger && stickyNavBar && stickySearchInput) { // stickySearchClearBtn è opzionale qui
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
                if (stickySearchClearBtn) { // Controlla se il bottone X interna esiste
                    if (stickySearchInput.value.length > 0) {
                        stickyNavBar.classList.add('input-has-text');
                        stickySearchClearBtn.style.display = 'flex';
                        stickySearchClearBtn.style.opacity = '1';
                    } else {
                        stickyNavBar.classList.remove('input-has-text');
                        stickySearchClearBtn.style.opacity = '0';
                        setTimeout(() => {
                            if (stickySearchInput.value.length === 0 && stickySearchClearBtn) {
                                 stickySearchClearBtn.style.display = 'none';
                            }
                        }, 200);
                    }
                }
            });

            stickySearchInput.addEventListener('click', (event) => event.stopPropagation());

            // Listener per focus e blur per VisualViewportAPI e classe su body
            stickySearchInput.addEventListener('focus', () => {
                if (bodyElement) bodyElement.classList.add('search-input-focused');
                // La VisualViewportAPI gestirà il posizionamento della barra
                // Un leggero ritardo per permettere alla tastiera di iniziare ad aprirsi
                setTimeout(handleStickyNavPositionWithKeyboard, 100);
            });
            stickySearchInput.addEventListener('blur', () => {
                if (bodyElement) bodyElement.classList.remove('search-input-focused');
                // Quando l'input perde il focus, la barra dovrebbe tornare a bottom: 0
                // Un timeout aiuta se la tastiera si sta ancora chiudendo
                // o se il blur è causato da un click che chiude la modalità ricerca
                setTimeout(() => {
                    // Ricontrolla se la modalità ricerca è ancora attiva o se un altro input ha il focus
                    if (!stickyNavBar.classList.contains('search-active') || document.activeElement !== stickySearchInput) {
                        handleStickyNavPositionWithKeyboard(); // Questo resetterà a bottom:0 se la tastiera è chiusa
                    }
                }, 250); // Un timeout leggermente più lungo per il blur
            });

        } // Fine if per listener ricerca

        if (stickySearchClearBtn && stickySearchInput) { // Listener separato per il clear button
            stickySearchClearBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                stickySearchInput.value = '';
                stickySearchInput.focus(); // Mantieni il focus
                filterItemsAndSections();
                stickyNavBar.classList.remove('input-has-text');
                stickySearchClearBtn.style.opacity = '0';
                setTimeout(() => { if(stickySearchClearBtn) stickySearchClearBtn.style.display = 'none'; }, 200);
            });
        }


        // 4. Listener Globale (Document) per chiudere cliccando fuori
        document.addEventListener('click', (event) => {
            if (stickyNavBar && stickyNavBar.classList.contains('search-active') &&
                !stickySearchContainer.contains(event.target) && // Modificato: usa stickySearchContainer
                event.target !== stickySearchTrigger && !stickySearchTrigger.contains(event.target)) {
                deactivateSearchMode(false);
            }
            if (descriptionPopup && descriptionPopup.classList.contains('visible') &&
                !descriptionPopup.contains(event.target) &&
                !event.target.closest('.spirit-item')) {
                hideDescriptionPopup();
            }
        });

        // 5. Listener per il link "cancella ricerca" in #no-results
        if (clearSearchNoResultsLink && noResultsSection && stickySearchInput) {
            clearSearchNoResultsLink.addEventListener('click', (event) => {
                event.preventDefault();
                deactivateSearchMode(true);
                if (noResultsSection) noResultsSection.style.display = 'none';
            });
        }

        // 6. Listener per VisualViewport API
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleStickyNavPositionWithKeyboard);
            // Non è sempre necessario ascoltare 'scroll' della visualViewport,
            // 'resize' è solitamente sufficiente per l'apertura/chiusura della tastiera.
            // window.visualViewport.addEventListener('scroll', handleStickyNavPositionWithKeyboard);
        } else {
            console.warn("VisualViewport API non supportata. Il posizionamento della barra con la tastiera potrebbe non essere ottimale.");
            // Qui potresti implementare un fallback più semplice se necessario,
            // come la classe `search-input-focused` sul body e CSS per `main { min-height: 100vh; }`
        }

    } // Fine setupEventListeners

    // --- ESECUZIONE INIZIALE ---
    initializeApp();

}); // Fine DOMContentLoaded wrapper