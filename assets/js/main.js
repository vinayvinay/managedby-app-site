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
    // Privacy Banner Management
    const privacyBanner = document.getElementById('privacy-banner');
    
    function showPrivacyBanner() {
        // Show banner if no consent choice has been made
        if (privacyBanner && !localStorage.getItem('cookieConsent')) {
            privacyBanner.classList.add('show');
        }
    }
    
    function hidePrivacyBanner() {
        if (privacyBanner) {
            privacyBanner.classList.remove('show');
            privacyBanner.classList.add('hide');
        }
    }
    
    // Privacy banner button handlers
    const acceptBtn = document.querySelector('.privacy-btn-accept');
    const declineBtn = document.querySelector('.privacy-btn-decline');
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            PrivacyManager.saveConsent('accepted');
            PrivacyManager.loadAnalytics();
            hidePrivacyBanner();
        });
    }
    
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            PrivacyManager.saveConsent('declined');
            hidePrivacyBanner();
        });
    }
    
    // Initialize privacy manager first
    PrivacyManager.init();
    
    // Initialize hero text animation
    HeroAnimationManager.init(showPrivacyBanner);

    // Initialize stage selector
    StageSelector.init();
    
    // Hide scroll indicator after 10 seconds
    setTimeout(() => {
        const scrollIndicator = document.getElementById('scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.opacity = '0';
            scrollIndicator.style.transition = 'opacity 1s ease-out';
            setTimeout(() => {
                scrollIndicator.style.display = 'none';
            }, 1000);
        }
    }, 15000);

    // Modal functionality
    const ModalManager = {
        contactModal: document.getElementById('contact-modal'),
        privacyModal: document.getElementById('privacy-modal'),
        
        init() {
            // Contact modal - handle both the original button and new CTA buttons
            document.getElementById('open-modal').addEventListener('click', () => this.openContact());
            
            // Handle all CTA buttons with class 'open-modal-btn'
            document.querySelectorAll('.open-modal-btn').forEach(btn => {
                btn.addEventListener('click', () => this.openContact());
            });
            
            document.getElementById('close-modal').addEventListener('click', () => this.closeContact());
            this.contactModal.addEventListener('click', (e) => {
                if (e.target === this.contactModal) this.closeContact();
            });
            
            // Privacy modal
            document.getElementById('open-privacy-modal').addEventListener('click', (e) => {
                e.preventDefault();
                this.openPrivacy();
            });
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
        
        openContact() {
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
});