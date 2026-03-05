'use client';

import { useState, useEffect } from 'react';

export function useBranding() {
    const [branding, setBranding] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBranding() {
            try {
                // In actual deployment, Bearer token would be in storage or cookie
                // For this demo, we assume the API handles session via cookies or existing headers
                const res = await fetch('/api/branding');
                const json = await res.json();
                if (json.success) {
                    setBranding(json.data);
                }
            } catch (e) {
                console.error("Failed to load branding", e);
            } finally {
                setLoading(false);
            }
        }
        loadBranding();
    }, []);

    return { branding, loading };
}
