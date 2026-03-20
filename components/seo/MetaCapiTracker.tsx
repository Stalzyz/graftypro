"use client";
import { useEffect } from 'react';

interface Props {
  eventName: string;
  customData?: any;
}

/**
 * Client-side trigger for Meta CAPI (Server-side tracking)
 * Ensures browser cookies (fbp/fbc) are sent with the request.
 */
export function MetaCapiTracker({ eventName, customData }: Props) {
  useEffect(() => {
    fetch('/api/meta/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        customData,
        sourceUrl: window.location.href
      })
    }).catch(err => console.error('[MetaCapiTracker] Failed to track event:', err));
  }, [eventName, JSON.stringify(customData)]);

  return null;
}
