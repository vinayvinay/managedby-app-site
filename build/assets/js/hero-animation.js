// Hero Animation Module
// Handles the hero section text reveal animation

const HeroAnimationManager = {
    init(onCompleteCallback) {
        if (!sessionStorage.getItem('heroAnimationPlayed')) {
            this.playFirstTimeAnimation(onCompleteCallback);
        } else {
            this.playReturnVisitAnimation(onCompleteCallback);
        }
    },

    playFirstTimeAnimation(onCompleteCallback) {
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
        if (onCompleteCallback) {
            setTimeout(onCompleteCallback, 4000);
        }
    },

    playReturnVisitAnimation(onCompleteCallback) {
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
        if (onCompleteCallback) {
            setTimeout(onCompleteCallback, 2500);
        }
    },

    resetAnimation() {
        sessionStorage.removeItem('heroAnimationPlayed');
        document.querySelectorAll('.word-reveal-js').forEach(word => {
            word.classList.remove('animate');
            word.style.opacity = '';
            word.style.transform = '';
        });
    }
};

// Export for use in other modules
window.HeroAnimationManager = HeroAnimationManager;