import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_MEASUREMENT_ID = 'G-DQTSBB55KE'; // Sostituisci con il tuo ID

export const useAnalytics = () => {
    const location = useLocation();

    useEffect(() => {
        // Controlla se l'utente ha dato il consenso
        const consent = localStorage.getItem('cookieConsent');
        if (consent) {
            const consentData = JSON.parse(consent);
            if (consentData.analytics && window.gtag) {
                // Configura GA solo se c'è il consenso
                window.gtag('config', GA_MEASUREMENT_ID, {
                    page_path: location.pathname + location.search,
                });
            }
        }
    }, [location]);

    // Funzione per tracciare eventi custom
    const trackEvent = (action, category, label, value) => {
        const consent = localStorage.getItem('cookieConsent');
        if (consent) {
            const consentData = JSON.parse(consent);
            if (consentData.analytics && window.gtag) {
                window.gtag('event', action, {
                    event_category: category,
                    event_label: label,
                    value: value,
                });
            }
        }
    };

    return { trackEvent };
};