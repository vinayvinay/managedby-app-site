// Analytics and Tracking Module
// Handles Google Analytics integration and event tracking

const AnalyticsManager = {
    config: {
        trackingId: 'G-XPDJ9JE23Z',
        conversionLabels: {
            lead_generation: 'lead_generation'
        }
    },

    isLoaded: false,

    // Initialize Google Analytics
    init() {
        if (this.isLoaded) return;
        
        // Set up dataLayer first
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        // Initialize with current timestamp
        gtag('js', new Date());
        gtag('config', this.config.trackingId, {
            page_title: document.title,
            page_location: window.location.href
        });
        
        // Load GA script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.trackingId}`;
        document.head.appendChild(script);
        
        this.isLoaded = true;
        this.setupEventTracking();
    },

    // Track custom events
    trackEvent(eventName, eventAction = 'cta_click', customParams = {}) {
        if (window.gtag && typeof window.gtag === 'function') {
            gtag('event', eventName, {
                'event_category': 'engagement',
                'action': eventAction,
                'user_type': UserDetection.getUserType(),
                'traffic_source': UserDetection.getTrafficSource(),
                ...customParams
            });
        }
    },

    // Track conversions for Google Ads
    trackConversion(conversionLabel, value = 1) {
        if (window.gtag && typeof window.gtag === 'function') {
            gtag('event', 'conversion', {
                'send_to': `${this.config.trackingId}/${conversionLabel}`,
                'value': value,
                'currency': 'GBP',
                'user_type': UserDetection.getUserType(),
                'traffic_source': UserDetection.getTrafficSource()
            });
        }
    },

    // Set up event tracking for CTA elements
    setupEventTracking() {
        const ctaSelectors = [
            { selector: 'a[href*="wa.me"]', label: 'whatsapp' },
            { selector: 'a[href*="calendly"]', label: 'calendly' },
            { selector: 'a[href*="mailto:"]', label: 'email' }
        ];

        ctaSelectors.forEach(cta => {
            document.querySelectorAll(cta.selector).forEach(element => {
                element.addEventListener('click', () => {
                    // Get location from data attribute or fallback to DOM lookup
                    const location = element.dataset.location || this.getLocation(element);
                    
                    // Track event with location as custom parameter
                    this.trackEvent(cta.label, 'click', { 
                        click_location: location 
                    });
                    
                    // Track conversion for lead generation
                    this.trackConversion(this.config.conversionLabels.lead_generation);
                });
            });
        });

        // Modal opens are tracked by CTA clicks in main.js

        this.setupSectionTracking();
    },

    // Simple location detection
    getLocation(element) {
        if (document.getElementById('hero-section')?.contains(element)) return 'hero';
        if (document.getElementById('how-we-are-different-section')?.contains(element)) return 'principles';
        if (document.getElementById('how-can-we-help-section')?.contains(element)) return 'pricing';
        if (document.getElementById('cta-section')?.contains(element)) return 'cta';
        if (document.querySelector('footer')?.contains(element)) return 'footer';
        return 'other';
    },

    // Track section engagement using Intersection Observer
    setupSectionTracking() {
        const sectionTimes = {};
        const self = this;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionId = entry.target.id;
                if (entry.isIntersecting) {
                    sectionTimes[sectionId] = Date.now();
                } else if (sectionTimes[sectionId]) {
                    const timeSpent = Date.now() - sectionTimes[sectionId];
                    if (timeSpent > 1000) { // Only track if spent more than 1 second
                        self.trackEvent('section_engagement', 'engagement', {
                            section_name: sectionId,
                            time_spent_seconds: Math.round(timeSpent / 1000)
                        });
                    }
                    delete sectionTimes[sectionId];
                }
            });
        }, { threshold: 0.5 });

        // Observe key sections
        const sectionsToTrack = [
            'hero-section', 
            'how-we-are-different-section', 
            'how-can-we-help-section', 
            'cta-section'
        ];
        
        sectionsToTrack.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                observer.observe(section);
            }
        });
    }
};

// Export for use in other modules
window.AnalyticsManager = AnalyticsManager;