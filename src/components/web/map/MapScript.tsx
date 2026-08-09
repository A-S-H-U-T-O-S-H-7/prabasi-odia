"use client";

import { useEffect, useState } from "react";
import { loadGoogleMapsScript } from "@/lib/utils/googleMapsLoader";

// ✅ Remove local declarations - use global types from types/global.d.ts

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // ✅ Prevent the "initMap is not a function" error
    if (typeof window !== "undefined" && !window.initMap) {
      window.initMap = () => {
        console.log("Google Maps initialized");
      };
    }

    const loadMap = async () => {
      try {
        await loadGoogleMapsScript();
        setIsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load Google Maps"));
      }
    };

    loadMap();
  }, []);

  return { isLoaded, error };
}