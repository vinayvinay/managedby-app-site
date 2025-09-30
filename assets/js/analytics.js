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
        console.log('🔥 AnalyticsManager.init() called. isLoaded:', this.isLoaded);
        
        if (this.isLoaded) return;
        
        // Set up dataLayer first
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        
        console.log('🔥 Setting up gtag and dataLayer');
        
        // Initialize with current timestamp
        gtag('js', new Date());
        gtag('config', this.config.trackingId, {
            page_title: document.title,
            page_location: window.location.href
        });
        
        console.log('🔥 GA config sent');
        
        // Load GA script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.trackingId}`;
        
        console.log('🔥 Loading GA script:', script.src);
        
        // Wait for script to load before setting up event tracking
        script.onload = () => {
            console.log('🔥 GA script loaded, setting up event tracking');
            
            // Test basic event to verify GA4 is working
            setTimeout(() => {
                console.log('🔥 Sending test event to verify GA4');
                
                // Check if GA collect endpoint is reachable
                fetch('https://www.google-analytics.com/g/collect?v=2&tid=' + this.config.trackingId + '&t=pageview&dl=' + encodeURIComponent(location.href), {
                    method: 'GET',
                    mode: 'no-cors'
                }).then(() => {
                    console.log('🔥 GA collect endpoint reachable');
                }).catch(err => {
                    console.log('🔥 GA collect endpoint blocked or failed:', err);
                });
                
                gtag('event', 'page_view_test', {
                    'event_category': 'test',
                    'test_param': 'test_value'
                });
                console.log('🔥 Test event sent');
                
                // Also check what's in dataLayer after test event
                setTimeout(() => {
                    console.log('🔥 Full dataLayer:', window.dataLayer);
                }, 500);
            }, 1000);
            
            this.setupEventTracking();
        };
        
        script.onerror = () => {
            console.error('🔥 Failed to load GA script');
        };
        
        document.head.appendChild(script);
        this.isLoaded = true;
    },

    // Track custom events
    trackEvent(eventName, eventAction = 'cta_click', customParams = {}) {
        console.log('🔥 trackEvent called:', eventName, eventAction, customParams);
        console.log('🔥 gtag available:', !!window.gtag, typeof window.gtag);
        
        if (window.gtag && typeof window.gtag === 'function') {
            // Safely get user detection data with fallbacks
            const userType = window.UserDetection ? window.UserDetection.getUserType() : 'unknown';
            const trafficSource = window.UserDetection ? window.UserDetection.getTrafficSource() : 'unknown';
            
            // GA4 uses different parameter names
            const eventData = {
                'event_category': 'engagement',
                'custom_user_type': userType,
                'custom_traffic_source': trafficSource,
                ...customParams
            };
            
            console.log('🔥 Sending GA event:', eventName, eventData);
            
            // Also log the raw gtag call for debugging
            console.log('🔥 Raw gtag call:', 'event', eventName, eventData);
            
            gtag('event', eventName, eventData);
            
            // Log dataLayer to see what's actually being sent
            console.log('🔥 dataLayer after event:', window.dataLayer.slice(-3));
            
            // Check if GA script actually loaded by looking for specific GA functions
            console.log('🔥 GA functions available:', {
                gtag: typeof window.gtag,
                dataLayer: !!window.dataLayer,
                gtagLoaded: typeof window.gtagLoaded,
                ga: typeof window.ga
            });
        } else {
            console.log('🔥 gtag not available, event not sent');
        }
    },

    // Track conversions for Google Ads
    trackConversion(conversionLabel, value = 1) {
        if (window.gtag && typeof window.gtag === 'function') {
            // Safely get user detection data with fallbacks
            const userType = window.UserDetection ? window.UserDetection.getUserType() : 'unknown';
            const trafficSource = window.UserDetection ? window.UserDetection.getTrafficSource() : 'unknown';
            
            gtag('event', 'conversion', {
                'send_to': `${this.config.trackingId}/${conversionLabel}`,
                'value': value,
                'currency': 'GBP',
                'user_type': userType,
                'traffic_source': trafficSource
            });
        }
    },

    // Set up event tracking for CTA elements
    setupEventTracking() {
        console.log('🔥 Setting up event tracking...');
        
        const ctaSelectors = [
            { selector: 'a[href*="wa.me"]', label: 'whatsapp' },
            { selector: 'a[href*="calendly"]', label: 'calendly' },
            { selector: 'a[href*="mailto:"]', label: 'email' }
        ];

        ctaSelectors.forEach(cta => {
            const elements = document.querySelectorAll(cta.selector);
            console.log(`🔥 Found ${elements.length} elements for ${cta.selector}`);
            
            elements.forEach(element => {
                console.log('🔥 Adding click listener to:', element);
                element.addEventListener('click', () => {
                    console.log('🔥 CTA clicked:', cta.label, element);
                    
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