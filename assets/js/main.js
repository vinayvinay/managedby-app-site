// Privacy & Analytics Management
const PrivacyManager = {
    loadAnalytics() {
        if (window.AnalyticsManager) {
            window.AnalyticsManager.init();
        }
    }
};



document.addEventListener('DOMContentLoaded', function() {
    // Privacy Banner Management
    const privacyBanner = document.getElementById('privacy-banner');
    
    function showPrivacyBanner() {
        if (privacyBanner && !localStorage.getItem('privacyBannerDismissed')) {
            privacyBanner.classList.add('show');
        }
    }
    
    function hidePrivacyBanner() {
        if (privacyBanner) {
            privacyBanner.classList.remove('show');
            privacyBanner.classList.add('hide');
            localStorage.setItem('privacyBannerDismissed', 'true');
        }
    }
    
    // Privacy banner button handlers
    const acceptBtn = document.querySelector('.privacy-btn-accept');
    const declineBtn = document.querySelector('.privacy-btn-decline');
    
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            PrivacyManager.loadAnalytics();
            hidePrivacyBanner();
        });
    }
    
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            hidePrivacyBanner();
        });
    }
    
    // Initialize hero text animation
    HeroAnimationManager.init(showPrivacyBanner);

    // Initialize stage selector
    StageSelector.init();

    // Modal functionality
    const ModalManager = {
        contactModal: document.getElementById('contact-modal'),
        privacyModal: document.getElementById('privacy-modal'),
        
        init() {
            // Contact modal
            document.getElementById('open-modal').addEventListener('click', () => this.openContact());
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