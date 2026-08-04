// lib/utils/googleMapsLoader.ts
let isScriptLoaded = false;
let loadPromise: Promise<void> | null = null;
let loadCallbacks: (() => void)[] = [];

export const loadGoogleMapsScript = (): Promise<void> => {
  // If already loaded, resolve immediately
  if (typeof window !== "undefined" && window.google?.maps) {
    return Promise.resolve();
  }

  // If already loading, return the existing promise
  if (loadPromise) {
    return loadPromise;
  }

  // If script already exists but not loaded, wait for it
  const existingScript = document.querySelector(
    'script[src*="maps.googleapis.com/maps/api/js"]'
  );
  if (existingScript) {
    return new Promise((resolve) => {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
    });
  }

  // Create new promise to load script
  loadPromise = new Promise((resolve, reject) => {
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!API_KEY) {
      reject(new Error("Google Maps API key is missing"));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isScriptLoaded = true;
      loadPromise = null;
      resolve();
    };

    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

// Clean up function (optional, for testing)
export const resetGoogleMapsLoader = () => {
  isScriptLoaded = false;
  loadPromise = null;
  loadCallbacks = [];
};