import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Salva la visita in localStorage (per demo)
        const visits = JSON.parse(localStorage.getItem('pageVisits') || '[]');
        visits.push({
            path: location.pathname,
            timestamp: new Date().toISOString(),
            referrer: document.referrer
        });

        // Mantieni solo le ultime 1000 visite
        if (visits.length > 1000) {
            visits.shift();
        }

        localStorage.setItem('pageVisits', JSON.stringify(visits));
    }, [location]);
};