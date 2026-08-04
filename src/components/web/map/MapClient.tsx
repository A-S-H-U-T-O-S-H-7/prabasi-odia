// app/(web)/map/MapClient.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, MapPin, Shield, Search, Filter, X } from "lucide-react";
import MapView from "@/components/web/map/MapView";
import { mapService, MapMember, maskName } from "@/lib/services/mapService";

export default function MapClient() {
  const [members, setMembers] = useState<MapMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MapMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        const data = await mapService.getVerifiedMembersWithCoordinates();
        setMembers(data);
        setFilteredMembers(data);

        // Extract unique cities
        const uniqueCities = Array.from(
          new Set(data.map((m) => m.currentCity).filter((city) => city !== "Unknown"))
        );
        setCities(uniqueCities);
      } catch (err) {
        setError("Failed to load members");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    let filtered = [...members];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.displayName.toLowerCase().includes(query) ||
          m.currentCity.toLowerCase().includes(query) ||
          m.currentState.toLowerCase().includes(query) ||
          m.currentCountry.toLowerCase().includes(query)
      );
    }

    // City filter
    if (selectedCity !== "all") {
      filtered = filtered.filter((m) => m.currentCity === selectedCity);
    }

    setFilteredMembers(filtered);
  }, [searchQuery, selectedCity, members]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity("all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F2] via-white to-[#FFF0EB] py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 md:mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#6B1E5B]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#6B1E5B]" />
            </div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-[#2A1636]">
              Odia Community Map
            </h1>
          </div>
          <p className="text-sm md:text-base text-[#6B5E5A] max-w-2xl mx-auto">
            Find and connect with verified Odia community members around the world.
            <br className="hidden sm:block" />
            <span className="text-xs text-[#6B5E5A]/70">
              <Shield className="inline w-3 h-3 text-[#6B1E5B]" /> Only verified members are shown
            </span>
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-6"
        >
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border border-white/50 shadow-sm">
            <Users className="w-4 h-4 text-[#6B1E5B]" />
            <span className="text-sm font-medium text-[#2A1636]">
              {filteredMembers.length} members
            </span>
          </div>
          {cities.length > 0 && (
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border border-white/50 shadow-sm">
              <MapPin className="w-4 h-4 text-[#D9772B]" />
              <span className="text-sm font-medium text-[#2A1636]">
                {cities.length} cities
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-green-50/70 backdrop-blur-sm rounded-full px-4 py-2 border border-green-200/50 shadow-sm">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Verified Only</span>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-3 mb-6"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, city, or country..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#D4C8C0]/50 bg-white/70 backdrop-blur-sm focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-sm text-[#2A1636] placeholder:text-[#6B5E5A]/40"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 rounded-xl border border-[#D4C8C0]/50 bg-white/70 backdrop-blur-sm text-[#6B5E5A] hover:text-[#6B1E5B] hover:border-[#6B1E5B]/30 transition-all duration-200 flex items-center gap-2 text-sm whitespace-nowrap"
            >
              <Filter className="w-4 h-4" />
              Filters
              {(selectedCity !== "all" || searchQuery) && (
                <span className="w-2 h-2 rounded-full bg-[#6B1E5B]" />
              )}
            </button>

            {(selectedCity !== "all" || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2.5 rounded-xl border border-[#D4C8C0]/30 bg-white/70 backdrop-blur-sm text-[#6B5E5A] hover:text-red-500 hover:border-red-200 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* City Filter Dropdown */}
        {showFilters && cities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50">
              <button
                onClick={() => setSelectedCity("all")}
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  selectedCity === "all"
                    ? "bg-[#6B1E5B] text-white shadow-sm"
                    : "bg-white/50 text-[#6B5E5A] hover:bg-[#6B1E5B]/5"
                }`}
              >
                All Cities
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                    selectedCity === city
                      ? "bg-[#D9772B] text-white shadow-sm"
                      : "bg-white/50 text-[#6B5E5A] hover:bg-[#6B1E5B]/5"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <MapView members={filteredMembers} isLoading={isLoading} />
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xs text-[#6B5E5A]/60"
        >
          <p>
            <Shield className="inline w-3 h-3 text-[#6B1E5B]" /> Member identities are masked for privacy.
            Only verified members with location data are shown.
          </p>
          <p className="mt-1">
            Not on the map?{' '}
            <a href="/join-community" className="text-[#6B1E5B] hover:underline">
              Join the community
            </a>
            {' '}and get verified!
          </p>
        </motion.div>
      </div>
    </div>
  );
}