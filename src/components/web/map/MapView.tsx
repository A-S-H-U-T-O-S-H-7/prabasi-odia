"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { MapMember } from "@/lib/services/mapService";
import { Loader2, Users, MapPin } from "lucide-react";
import { useGoogleMaps } from "./MapScript";
import useAuthStore from "@/lib/store/authStore";

// ✅ Remove local declaration - use global types from types/global.d.ts

interface MapViewProps {
  members: MapMember[];
  isLoading?: boolean;
}

interface LocationCluster {
  key: string;
  lat: number;
  lng: number;
  count: number;
  isCurrentUser: boolean;
  label: string;
  city?: string;
  state?: string;
  members: Array<{ name: string; city?: string; state?: string }>;
}

const buildLocationClusters = (
  members: MapMember[],
  currentUserLocation: { lat: number; lng: number; city?: string; state?: string } | null
): LocationCluster[] => {
  const items: Array<{
    lat: number;
    lng: number;
    isCurrentUser: boolean;
    label: string;
    city?: string;
    state?: string;
    name: string;
  }> = [];

  if (currentUserLocation) {
    items.push({
      lat: currentUserLocation.lat,
      lng: currentUserLocation.lng,
      isCurrentUser: true,
      label: "You",
      name: "You",
      city: currentUserLocation.city,
      state: currentUserLocation.state,
    });
  }

  members.forEach((member) => {
    items.push({
      lat: member.lat,
      lng: member.lng,
      isCurrentUser: false,
      label: member.displayName,
      name: member.displayName,
      city: member.currentCity,
      state: member.currentState,
    });
  });

  const grouped = new Map<string, LocationCluster>();

  items.forEach((item) => {
    const key = `${item.lat.toFixed(2)}|${item.lng.toFixed(2)}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.count += 1;
      existing.members.push({ name: item.name, city: item.city, state: item.state });
    } else {
      grouped.set(key, {
        key,
        lat: item.lat,
        lng: item.lng,
        count: 1,
        isCurrentUser: item.isCurrentUser,
        label: item.label,
        city: item.city,
        state: item.state,
        members: [{ name: item.name, city: item.city, state: item.state }],
      });
    }
  });

  return Array.from(grouped.values());
};

export default function MapView({ members, isLoading = false }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const isInitializedRef = useRef(false);
  const { user } = useAuthStore();
  const { isLoaded: isMapLoaded, error: mapError } = useGoogleMaps();

  const currentUserLocation = useMemo(() => {
    const lat = Number(user?.currentLatitude ?? user?.latitude ?? null);
    const lng = Number(user?.currentLongitude ?? user?.longitude ?? null);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) {
      return null;
    }

    return {
      lat,
      lng,
      city: user?.currentCity || user?.odishaCity || "",
      state: user?.currentState || "",
    };
  }, [user]);

  const locationClusters = useMemo(
    () => buildLocationClusters(members, currentUserLocation),
    [members, currentUserLocation]
  );

  const initializeMap = useCallback(() => {
    if (!mapRef.current || isInitializedRef.current || !window.google?.maps) {
      return;
    }

    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = mapInstance;
      isInitializedRef.current = true;
      window.google.maps.event.trigger(mapInstance, "resize");
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, []);

  useEffect(() => {
    if (!isMapLoaded || isLoading) return;

    const frameId = window.requestAnimationFrame(() => {
      initializeMap();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isMapLoaded, isLoading, initializeMap]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapLoaded || !window.google?.maps) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());

    const newMarkers: google.maps.Marker[] = [];
    const newInfoWindows: google.maps.InfoWindow[] = [];

    const PIN_PATH =
      "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z";

    const createMarkerIcon = (cluster: LocationCluster) => {
      const fillColor = cluster.isCurrentUser ? "#22c55e" : cluster.count > 1 ? "#6B1E5B" : "#D9772B";

      if (cluster.count > 1) {
        return {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor,
          fillOpacity: 0.95,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
          strokeOpacity: 1,
        };
      }

      return {
        path: PIN_PATH,
        scale: 1.8,
        fillColor,
        fillOpacity: 1,
        strokeWeight: 1.5,
        strokeColor: "#FFFFFF",
        strokeOpacity: 1,
        anchor: new window.google.maps.Point(12, 22),
        labelOrigin: new window.google.maps.Point(12, 9),
      };
    };

    locationClusters.forEach((cluster) => {
      const position = { lat: cluster.lat, lng: cluster.lng };

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: cluster.isCurrentUser ? "Your location" : `${cluster.count} verified member${cluster.count > 1 ? "s" : ""} in this area`,
        icon: createMarkerIcon(cluster),
        animation: window.google.maps.Animation.DROP,
        label:
          cluster.count > 1
            ? {
                text: String(cluster.count),
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: "700",
              }
            : undefined,
      });

      const names = cluster.members.slice(0, 4).map((member) => member.name).join(", ");
      const content = `
        <div style="padding: 12px; max-width: 240px; font-family: 'Georgia', serif;">
          <div style="font-weight: 700; color: #2A1636; margin-bottom: 6px;">
            ${cluster.isCurrentUser ? "Your location" : `${cluster.count} verified member${cluster.count > 1 ? "s" : ""} in this area`}
          </div>
          <div style="color: #6B5E5A; font-size: 13px; line-height: 1.4;">
            <div style="display: flex; gap: 4px; margin-bottom: 4px;">
              <span>📍</span>
              <span>${cluster.city || "Unknown"}${cluster.city && cluster.state ? ", " : ""}${cluster.state || ""}</span>
            </div>
            <div style="margin-top: 6px; color: #6B1E5B; font-size: 12px;">
              ${names}
            </div>
          </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content,
        maxWidth: 240,
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

    if (locationClusters.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      locationClusters.forEach((cluster) => {
        bounds.extend({ lat: cluster.lat, lng: cluster.lng });
      });
      map.fitBounds(bounds);

      const listener = window.google.maps.event.addListener(map, "bounds_changed", () => {
        const zoom = map.getZoom();
        if (zoom && zoom > 14) {
          map.setZoom(14);
        }
        window.google.maps.event.removeListener(listener);
      });
    } else if (locationClusters.length === 1) {
      map.setCenter({ lat: locationClusters[0].lat, lng: locationClusters[0].lng });
      map.setZoom(10);
    } else {
      map.setCenter({ lat: 20.5937, lng: 78.9629 });
      map.setZoom(5);
    }

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
      newInfoWindows.forEach((infoWindow) => infoWindow.close());
    };
  }, [locationClusters, isMapLoaded]);

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

  if (mapError) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] md:h-[500px] bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 p-8">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-[#6B5E5A]/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#2A1636]">Map Unavailable</h3>
          <p className="text-sm text-[#6B5E5A] mt-2">{mapError.message}</p>
        </div>
      </div>
    );
  }

  if (!isMapLoaded || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] md:h-[500px] bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
        <Loader2 className="w-8 h-8 text-[#6B1E5B] animate-spin" />
        <p className="text-sm text-[#6B5E5A] mt-3">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/50 shadow-lg">
      <div ref={mapRef} className="w-full h-[400px] md:h-[500px]" />
      {locationClusters.length === 0 && (
        <div className="absolute inset-x-0 top-3 flex justify-center px-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs md:text-sm text-[#6B5E5A] border border-white/60 shadow-sm">
            No verified members with location data found yet.
          </div>
        </div>
      )}
      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-[#6B5E5A] border border-white/50 shadow-sm">
        <span className="font-semibold text-[#6B1E5B]">{locationClusters.length}</span> marked areas
      </div>
    </div>
  );
}