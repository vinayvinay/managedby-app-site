// User Detection Module
// Handles user type detection and traffic source identification

const UserDetection = {
    // Cache for performance
    _userType: null,
    _trafficSource: null,

    // Detect user type based on referrer and URL parameters
    getUserType() {
        if (this._userType !== null) {
            return this._userType;
        }

        const referrer = document.referrer.toLowerCase();
        const urlParams = window.location.search.toLowerCase();
        
        if (referrer.includes('google.co') && urlParams.includes('international')) {
            this._userType = 'international_landlord';
        } else if (referrer.includes('property')) {
            this._userType = 'existing_landlord';
        } else if (urlParams.includes('inherited')) {
            this._userType = 'accidental_landlord';
        } else {
            this._userType = 'unknown';
        }

        return this._userType;
    },

    // Get traffic source for analytics
    getTrafficSource() {
        if (this._trafficSource !== null) {
            return this._trafficSource;
        }

        const referrer = document.referrer.toLowerCase();
        
        if (referrer.includes('google.')) {
            this._trafficSource = 'google_ads';
        } else if (referrer.includes('facebook')) {
            this._trafficSource = 'facebook';
        } else if (referrer.includes('linkedin')) {
            this._trafficSource = 'linkedin';
        } else if (referrer) {
            this._trafficSource = 'referral';
        } else {
            this._trafficSource = 'direct';
        }

        return this._trafficSource;
    },

    // Reset cache (useful for testing)
    resetCache() {
        this._userType = null;
        this._trafficSource = null;
    },

    // Get user context for analytics
    getUserContext() {
        return {
            userType: this.getUserType(),
            trafficSource: this.getTrafficSource(),
            timestamp: Date.now(),
            url: window.location.href,
            referrer: document.referrer
        };
    }
};

// Export for use in other modules
window.UserDetection = UserDetection;