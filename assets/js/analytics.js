// Analytics and Tracking Module
// Handles Google Analytics integration and event tracking

const AnalyticsManager = {
    config: {
        trackingId: 'G-26Q381MZD0',
        conversionLabels: {
            lead_generation: 'lead_generation'
        }
    },

    isLoaded: false,

    // Initialize Google Analytics
    init() {
        if (this.isLoaded) return;
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', this.config.trackingId);
        
        // Load GA script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.trackingId}`;
        document.head.appendChild(script);
        
        this.isLoaded = true;
        this.setupEventTracking();
    },

    // Track custom events
    trackEvent(eventLabel, eventAction = 'cta_click', eventValue = 1) {
        if (window.gtag && typeof window.gtag === 'function') {
            gtag('event', eventAction, {
                'event_category': 'engagement',
                'event_label': eventLabel,
                'value': eventValue,
                'user_type': UserDetection.getUserType(),
                'traffic_source': UserDetection.getTrafficSource()
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
                    this.trackEvent(cta.label);
                    // Track conversion for lead generation
                    if (['whatsapp', 'calendly', 'email'].includes(cta.label)) {
                        this.trackConversion(this.config.conversionLabels.lead_generation);
                    }
                });
            });
        });

        // Track modal opens
        const modalTrigger = document.getElementById('open-modal');
        if (modalTrigger) {
            modalTrigger.addEventListener('click', () => {
                this.trackEvent('modal_open');
            });
        }

        this.setupSectionTracking();
    },

    // Track section engagement using Intersection Observer
    setupSectionTracking() {
        const sectionTimes = {};
        
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const sectionId = entry.target.id;
                if (entry.isIntersecting) {
                    sectionTimes[sectionId] = Date.now();
                } else if (sectionTimes[sectionId]) {
                    const timeSpent = Date.now() - sectionTimes[sectionId];
                    if (timeSpent > 1000) { // Only track if spent more than 1 second
                        if (window.gtag && typeof window.gtag === 'function') {
                            gtag('event', 'section_engagement', {
                                'event_category': 'engagement',
                                'event_label': sectionId,
                                'value': Math.round(timeSpent / 1000)
                            });
                        }
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