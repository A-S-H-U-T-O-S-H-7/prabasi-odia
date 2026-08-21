// lib/utils/googleMapsLoader.ts
let isScriptLoaded = false;
let loadPromise: Promise<void> | null = null;

async function waitForGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Google Maps can only load in the browser");
  }

  if (window.google?.maps?.importLibrary) {
    await window.google.maps.importLibrary("maps");
  }

  if (window.google?.maps?.Map) {
    isScriptLoaded = true;
    return;
  }

  await new Promise<void>((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50;
    const checkInterval = window.setInterval(() => {
      attempts += 1;
      if (window.google?.maps?.Map) {
        window.clearInterval(checkInterval);
        isScriptLoaded = true;
        resolve();
      } else if (attempts >= maxAttempts) {
        window.clearInterval(checkInterval);
        reject(new Error("Google Maps failed to initialize"));
      }
    }, 100);
  });
}

export const loadGoogleMapsScript = (): Promise<void> => {
  if (typeof window !== "undefined" && (isScriptLoaded || window.google?.maps?.Map)) {
    return waitForGoogleMaps();
  }

  if (loadPromise) {
    return loadPromise;
  }

  const existingScript = document.querySelector(
    'script[src*="/api/maps/script"]'
  );

  loadPromise = new Promise((resolve, reject) => {
    const startWaiting = () => {
      waitForGoogleMaps()
        .then(() => {
          loadPromise = null;
          resolve();
        })
        .catch((error) => {
          loadPromise = null;
          reject(error);
        });
    };

    if (existingScript) {
      startWaiting();
      return;
    }

    const script = document.createElement("script");
    script.src = `/api/maps/script?libraries=places,marker`;
    script.async = true;
    script.defer = true;
    script.onload = startWaiting;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};