// Privacy & Analytics Management
const PrivacyManager = {
    // Check if analytics consent was given
    hasAnalyticsConsent() {
        const consent = localStorage.getItem('cookieConsent');
        return consent === 'accepted';
    },
    
    // Save user's consent choice
    saveConsent(choice) {
        localStorage.setItem('cookieConsent', choice);
        localStorage.setItem('consentTimestamp', Date.now().toString());
    },
    
    // Load analytics only if consent given
    loadAnalytics() {
        if (this.hasAnalyticsConsent() && window.AnalyticsManager) {
            window.AnalyticsManager.init();
        }
    },
    
    // Initialize - load analytics if previously consented
    init() {
        if (this.hasAnalyticsConsent()) {
            this.loadAnalytics();
        }
    }
};



document.addEventListener('DOMContentLoaded', function() {
    // Privacy Consent Modal Management
    const privacyConsentModal = document.getElementById('privacy-consent-modal');
    
    function showPrivacyConsentModal() {
        // Show modal if no consent choice has been made
        if (privacyConsentModal && !localStorage.getItem('cookieConsent')) {
            privacyConsentModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function hidePrivacyConsentModal() {
        if (privacyConsentModal) {
            privacyConsentModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Privacy consent button handlers
    const acceptBtn = document.querySelector('.privacy-btn-accept');
    const declineBtn = document.querySelector('.privacy-btn-decline');
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            PrivacyManager.saveConsent('accepted');
            PrivacyManager.loadAnalytics();
            hidePrivacyConsentModal();
        });
    }
    
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            PrivacyManager.saveConsent('declined');
            hidePrivacyConsentModal();
        });
    }
    
    // Initialize privacy manager first
    PrivacyManager.init();
    
    // Initialize hero text animation
    HeroAnimationManager.init(showPrivacyConsentModal);

    // Initialize stage selector
    StageSelector.init();

    // Modal functionality
    const ModalManager = {
        contactModal: document.getElementById('contact-modal'),
        privacyModal: document.getElementById('privacy-modal'),
        
        init() {
            // Contact modal - handle both the original button and new CTA buttons
            document.getElementById('open-modal').addEventListener('click', () => {
                // Track the main CTA click
                if (window.AnalyticsManager) {
                    window.AnalyticsManager.trackEvent('cta_click', 'click', { 
                        click_location: 'get_started' 
                    });
                }
                this.openContact('get_started');
            });
            
            // Handle all CTA buttons with class 'open-modal-btn'
            document.querySelectorAll('.open-modal-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    // Track which CTA was clicked based on its location
                    let ctaLocation = 'unknown';
                    const heroSection = document.getElementById('hero-section');
                    const differentSection = document.getElementById('how-we-are-different-section');
                    const helpSection = document.getElementById('how-can-we-help-section');
                    
                    if (heroSection && heroSection.contains(btn)) {
                        ctaLocation = 'hero';
                    } else if (differentSection && differentSection.contains(btn)) {
                        ctaLocation = 'principles';
                    } else if (helpSection && helpSection.contains(btn)) {
                        ctaLocation = 'pricing';
                    }
                    
                    // Track the specific CTA click
                    if (window.AnalyticsManager) {
                        window.AnalyticsManager.trackEvent('cta_click', 'click', { 
                            click_location: ctaLocation 
                        });
                    }
                    
                    this.openContact(ctaLocation);
                });
            });
            
            document.getElementById('close-modal').addEventListener('click', () => this.closeContact());
            this.contactModal.addEventListener('click', (e) => {
                if (e.target === this.contactModal) this.closeContact();
            });
            
            // Privacy modal (only if element exists)
            const openPrivacyModal = document.getElementById('open-privacy-modal');
            if (openPrivacyModal) {
                openPrivacyModal.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openPrivacy();
                });
            }
            
            document.getElementById('close-privacy-modal').addEventListener('click', () => this.closePrivacy());
            this.privacyModal.addEventListener('click', (e) => {
                if (e.target === this.privacyModal) this.closePrivacy();
            });
            
            // Escape key handling for both modals
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (!this.contactModal.classList.contains('hidden')) {
                        this.closeContact();
                    }
                    if (!this.privacyModal.classList.contains('hidden')) {
                        this.closePrivacy();
                    }
                }
            });
        },
        
        openContact(location = 'modal') {
            // Update modal links with the location of the CTA that opened it
            const modalWhatsApp = this.contactModal.querySelector('a[href*="wa.me"]');
            const modalEmail = this.contactModal.querySelector('a[href*="mailto:"]');
            const modalCalendly = this.contactModal.querySelector('a[href*="calendly"]');
            
            if (modalWhatsApp) modalWhatsApp.setAttribute('data-location', location);
            if (modalEmail) modalEmail.setAttribute('data-location', location);
            if (modalCalendly) modalCalendly.setAttribute('data-location', location);
            
            this.contactModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        },
        
        closeContact() {
            this.contactModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        },
        
        openPrivacy() {
            this.privacyModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        },
        
        closePrivacy() {
            this.privacyModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    };
    
    ModalManager.init();
    
    // Rent Slider Calculator
    const rentSlider = document.getElementById('rent-slider');
    const rentValue = document.getElementById('rent-value');
    const ourPrice = document.getElementById('our-price');
    const traditionalPrice = document.getElementById('traditional-price');
    const annualSaving = document.getElementById('annual-saving');
    
    function updatePrices(rentAmount) {
        // Update rent display
        if (rentValue) {
            rentValue.textContent = `£${rentAmount.toLocaleString()}`;
        }
        
        // Calculate our price (3.6% including VAT)
        const ourMonthlyPrice = Math.round(rentAmount * 0.036);
        if (ourPrice) {
            ourPrice.textContent = `£${ourMonthlyPrice}`;
        }
        
        // Calculate traditional range (10-15%)
        const traditionalMin = Math.round(rentAmount * 0.10);
        const traditionalMax = Math.round(rentAmount * 0.15);
        if (traditionalPrice) {
            traditionalPrice.textContent = `£${traditionalMin}-£${traditionalMax}`;
        }
        
        // Calculate annual savings range
        const annualSavingsMin = (traditionalMin - ourMonthlyPrice) * 12;
        const annualSavingsMax = (traditionalMax - ourMonthlyPrice) * 12;
        if (annualSaving) {
            annualSaving.textContent = `Your annual saving: £${annualSavingsMin.toLocaleString()}-£${annualSavingsMax.toLocaleString()}.`;
        }
    }
    
    if (rentSlider) {
        // Initialize with default value
        updatePrices(parseInt(rentSlider.value));
        
        // Update on slider change
        rentSlider.addEventListener('input', function() {
            updatePrices(parseInt(this.value));
        });
    }
});