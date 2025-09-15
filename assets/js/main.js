// Privacy & Analytics Management
const PrivacyManager = {
    loadAnalytics() {
        if (window.loadGoogleAnalytics) {
            window.loadGoogleAnalytics();
        }
    }
};

function showPrivacyPolicy() {
    alert('Privacy Policy:\n\nWe use Google Analytics to:\n• Understand which sections users visit\n• Track button clicks on our CTAs\n• Improve our website experience\n\nWe do not:\n• Sell your data\n• Track you across other websites\n• Store personal information\n\nYou can decline cookies and still use our site normally.');
}


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
    
    // Hero text animation - only on first visit
    if (!sessionStorage.getItem('heroAnimationPlayed')) {
        const words = document.querySelectorAll('.word-reveal-js');
        
        words.forEach((word) => {
            const delay = parseFloat(word.dataset.delay) * 1000;
            setTimeout(() => {
                word.classList.add('animate');
            }, delay);
        });
        
        // Mark animation as played for this session
        sessionStorage.setItem('heroAnimationPlayed', 'true');
        
        // Show privacy banner after title animation completes (4 seconds)
        setTimeout(showPrivacyBanner, 4000);
    } else {
        // Show main title words immediately for subsequent visits
        document.querySelectorAll('.word-reveal-js').forEach(word => {
            const delay = parseFloat(word.dataset.delay);
            if (delay < 2) {
                // Show main title immediately
                word.style.opacity = '1';
                word.style.transform = 'translateY(0)';
            } else {
                // Show subtitle text after 1 second delay
                setTimeout(() => {
                    word.style.opacity = '1';
                    word.style.transform = 'translateY(0)';
                }, 1000);
            }
        });
        
        // Show privacy banner after shorter delay for repeat visits (2.5 seconds)
        setTimeout(showPrivacyBanner, 2500);
    }

    // Stage Selector Logic
    const stageButtons = document.querySelectorAll('.stage-selector-btn');
    const serviceColumns = document.getElementById('service-columns');
    const columns = document.querySelectorAll('.service-column');

    function showColumns(columnsToShow) {
        // Hide all columns first
        columns.forEach(column => {
            column.style.display = 'none';
        });

        // Show specified columns
        columnsToShow.forEach(columnNum => {
            const column = document.querySelector(`[data-column="${columnNum}"]`);
            if (column) {
                column.style.display = 'flex';
            }
        });

        // Update grid layout based on number of visible columns
        if (columnsToShow.length === 1) {
            serviceColumns.className = 'grid grid-cols-1 gap-8 lg:gap-12 max-w-md mx-auto';
        } else if (columnsToShow.length === 2) {
            serviceColumns.className = 'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto';
        } else {
            serviceColumns.className = 'grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12';
        }
    }

    function handleStageSelection(stage) {
        // Remove active class from all buttons
        stageButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to selected button
        const activeButton = document.querySelector(`[data-stage="${stage}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Show appropriate columns based on selection
        switch(stage) {
            case 1:
                // Show columns 1, 2, and 3
                showColumns([1, 2, 3]);
                break;
            case 2:
                // Show columns 2 and 3
                showColumns([2, 3]);
                break;
        }
    }

    // Add click event listeners to stage buttons
    stageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stage = parseInt(this.getAttribute('data-stage'));
            handleStageSelection(stage);
        });
    });

    // Initialize with stage 1 by default
    handleStageSelection(1);

    // Modal functionality
    const ModalManager = {
        modal: document.getElementById('contact-modal'),
        
        init() {
            document.getElementById('open-modal').addEventListener('click', () => this.open());
            document.getElementById('close-modal').addEventListener('click', () => this.close());
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.close();
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                    this.close();
                }
            });
        },
        
        open() {
            this.modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        },
        
        close() {
            this.modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    };
    
    ModalManager.init();
});