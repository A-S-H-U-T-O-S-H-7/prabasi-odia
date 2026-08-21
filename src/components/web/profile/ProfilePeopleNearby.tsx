// components/web/profile/ProfilePeopleNearby.tsx
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { MapPin, Loader2, Navigation, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { mapService, MapMember } from "@/lib/services/mapService";
import { loadGoogleMapsScript } from "@/lib/utils/googleMapsLoader";

interface ProfilePeopleNearbyProps {
  profile: any;
}

export default function ProfilePeopleNearby({ profile }: ProfilePeopleNearbyProps) {
  const router = useRouter();
  const [members, setMembers] = useState<MapMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const isInitializedRef = useRef(false);

  // Get current user location from the profile prop
  const currentUserLocation = useMemo(() => {
    const lat = Number(profile?.currentLatitude ?? profile?.latitude ?? null);
    const lng = Number(profile?.currentLongitude ?? profile?.longitude ?? null);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
      return null;
    }

    return { lat, lng };
  }, [profile]);

  const currentUserName = profile?.displayName || "You";

  // Fetch nearby members
  useEffect(() => {
    const fetchNearbyMembers = async () => {
      setIsLoading(true);
      try {
        const data = await mapService.getVerifiedMembersWithCoordinates();
        const filtered = data
          .filter(m => m.displayName !== currentUserName)
          .slice(0, 15);
        setMembers(filtered);
      } catch (err) {
        setError("Failed to load nearby members");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUserName) {
      fetchNearbyMembers();
    }
  }, [currentUserName]);

  // Load Google Maps script
  useEffect(() => {
    let isMounted = true;

    const loadMap = async () => {
      try {
        await loadGoogleMapsScript();
        if (isMounted && window.google?.maps) {
          setIsMapLoaded(true);
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Failed to load map");
        }
      }
    };

    loadMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize map as soon as the script and container are ready.
  // Do not wait for member fetch — swapping the container later leaves Google Maps blank.
  const initializeMap = useCallback(() => {
    if (!mapRef.current || isInitializedRef.current || !window.google?.maps?.Map) {
      return;
    }

    if (mapRef.current.offsetWidth === 0 || mapRef.current.offsetHeight === 0) {
      return;
    }

    try {
      const mapOptions: google.maps.MapOptions = {
        center: currentUserLocation || { lat: 20.5937, lng: 78.9629 },
        zoom: currentUserLocation ? 10 : 5,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
      };

      if (window.google.maps.ControlPosition) {
        mapOptions.zoomControlOptions = {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM,
        };
      }

      const map = new window.google.maps.Map(mapRef.current, mapOptions);

      mapInstanceRef.current = map;
      isInitializedRef.current = true;
      setIsMapReady(true);

      window.setTimeout(() => {
        window.google?.maps?.event.trigger(map, "resize");
        if (currentUserLocation) {
          map.setCenter(currentUserLocation);
        }
      }, 150);
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Failed to initialize map");
    }
  }, [currentUserLocation]);

  useEffect(() => {
    if (!isMapLoaded) return;

    const frameId = window.requestAnimationFrame(() => {
      initializeMap();
    });
    const retryId = window.setTimeout(() => {
      initializeMap();
    }, 250);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(retryId);
    };
  }, [isMapLoaded, initializeMap]);

  // Add markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady || !isMapLoaded || !window.google?.maps) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());

    const newMarkers: google.maps.Marker[] = [];
    const newInfoWindows: google.maps.InfoWindow[] = [];

    const PIN_PATH =
      "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z";

    // Add current user marker
    if (currentUserLocation) {
      const userMarker = new window.google.maps.Marker({
        position: currentUserLocation,
        map,
        title: "Your location",
        icon: {
          path: PIN_PATH,
          scale: 1.6,
          fillColor: "#22c55e",
          fillOpacity: 1,
          strokeWeight: 1.5,
          strokeColor: "#FFFFFF",
          strokeOpacity: 1,
          anchor: new window.google.maps.Point(12, 22),
          labelOrigin: new window.google.maps.Point(12, 9),
        },
        animation: window.google.maps.Animation.DROP,
      });

      const userContent = `
        <div style="padding: 6px 10px; font-family: 'Georgia', serif;">
          <div style="font-weight: 700; color: #2A1636; font-size: 13px;">📍 ${currentUserName}</div>
          <div style="color: #6B5E5A; font-size: 11px;">You are here</div>
        </div>
      `;

      const userInfoWindow = new window.google.maps.InfoWindow({
        content: userContent,
        maxWidth: 200,
      });

      userMarker.addListener("click", () => {
        infoWindowsRef.current.forEach((iw) => iw.close());
        userInfoWindow.open(map, userMarker);
      });

      newMarkers.push(userMarker);
      newInfoWindows.push(userInfoWindow);
    }

    // Add member markers
    members.forEach((member) => {
      const marker = new window.google.maps.Marker({
        position: { lat: member.lat, lng: member.lng },
        map,
        title: member.displayName,
        icon: {
          path: PIN_PATH,
          scale: 1.3,
          fillColor: "#D9772B",
          fillOpacity: 1,
          strokeWeight: 1.5,
          strokeColor: "#FFFFFF",
          strokeOpacity: 1,
          anchor: new window.google.maps.Point(12, 22),
          labelOrigin: new window.google.maps.Point(12, 9),
        },
        animation: window.google.maps.Animation.DROP,
      });

      const content = `
        <div style="padding: 6px 10px; font-family: 'Georgia', serif; max-width: 180px;">
          <div style="font-weight: 700; color: #2A1636; font-size: 13px;">${member.displayName}</div>
          <div style="color: #6B5E5A; font-size: 11px; margin-top: 2px;">
            📍 ${member.currentCity}
          </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content,
        maxWidth: 180,
      });

      marker.addListener("click", () => {
        infoWindowsRef.current.forEach((iw) => iw.close());
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
      newInfoWindows.push(infoWindow);
    });

    markersRef.current = newMarkers;
    infoWindowsRef.current = newInfoWindows;

    // Fit bounds
    const allLocations = [];
    if (currentUserLocation) allLocations.push(currentUserLocation);
    members.forEach((m) => allLocations.push({ lat: m.lat, lng: m.lng }));

    if (allLocations.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      allLocations.forEach((loc) => {
        bounds.extend(loc);
      });
      map.fitBounds(bounds);
      
      const listener = window.google.maps.event.addListener(map, "bounds_changed", () => {
        const zoom = map.getZoom();
        if (zoom && zoom > 13) {
          map.setZoom(13);
        }
        window.google.maps.event.removeListener(listener);
      });
    } else if (allLocations.length === 1) {
      map.setCenter(allLocations[0]);
      map.setZoom(10);
    }

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
      newInfoWindows.forEach((infoWindow) => infoWindow.close());
    };
  }, [members, currentUserLocation, isMapLoaded, isMapReady, currentUserName]);

  const handleViewAll = () => {
    router.push("/map");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
      markersRef.current = [];
      infoWindowsRef.current = [];
      mapInstanceRef.current = null;
      isInitializedRef.current = false;
    };
  }, []);

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-[#6B1E5B]" />
          <h3 className="text-sm font-semibold text-[#2A1636]">People Nearby</h3>
        </div>
        <div className="text-center py-3">
          <MapPin className="w-8 h-8 text-[#6B5E5A]/30 mx-auto mb-1" />
          <p className="text-xs text-[#6B5E5A]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#6B1E5B]" />
          <h3 className="text-sm font-semibold text-[#2A1636]">People Nearby</h3>
        </div>
        <button
          onClick={handleViewAll}
          className="flex items-center gap-0.5 text-xs text-[#6B1E5B] hover:text-[#4A1942] transition-colors font-medium"
        >
          View All
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Map Container - Reduced height */}
      <div
        className="relative overflow-hidden rounded-xl border border-[#D4C8C0]/30 cursor-pointer"
        onClick={handleViewAll}
      >
        <div ref={mapRef} className="w-full h-[140px] sm:h-[160px]" />

        {(isLoading || !isMapLoaded || !isMapReady) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F7F1E3]/80">
            <Loader2 className="w-5 h-5 text-[#6B1E5B] animate-spin" />
          </div>
        )}

        {currentUserLocation && isMapReady && (
          <div className="absolute bottom-1.5 left-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-0.5 text-[9px] text-[#6B5E5A] border border-white/50 shadow-sm flex items-center gap-1">
            <Navigation className="w-2.5 h-2.5 text-green-500" />
            <span>You</span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/5 rounded-xl">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-[#6B1E5B] font-medium shadow-lg">
            Click to view full map
          </span>
        </div>
      </div>

      {/* Member count */}
      {members.length > 0 && isMapReady && (
        <div className="mt-1.5 text-[10px] text-[#6B5E5A]/70 text-center">
          <span className="font-semibold text-[#6B1E5B]">{members.length}</span> verified members nearby
        </div>
      )}

      {members.length === 0 && !isLoading && isMapReady && (
        <div className="mt-1.5 text-[10px] text-[#6B5E5A]/70 text-center">
          No nearby members found
        </div>
      )}
    </div>
  );
}