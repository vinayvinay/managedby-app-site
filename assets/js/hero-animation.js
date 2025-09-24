// Hero Animation Module
// Now only handles privacy banner timing

const HeroAnimationManager = {
    init(onCompleteCallback) {
        // Show privacy banner after 2 seconds
        if (onCompleteCallback) {
            setTimeout(onCompleteCallback, 2000);
        }
    }
};

// Export for use in other modules
window.HeroAnimationManager = HeroAnimationManager;