// components/web/map/MapScript.tsx
"use client";

import { useEffect, useState } from "react";

interface MapScriptProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!API_KEY) {
      setError(new Error("Google Maps API key is missing"));
      return;
    }

    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existingScript) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    // Load the script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setError(new Error("Failed to load Google Maps"));
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      const script = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );
      if (script) {
        script.remove();
      }
    };
  }, [API_KEY]);

  return { isLoaded, error };
}