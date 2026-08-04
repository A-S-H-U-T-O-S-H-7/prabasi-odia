"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { MapPin, Home, Building, Globe, Users } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { useLocationData } from "@/hooks/useLocationData";
import { publicCommunityService, PublicCommunity } from "@/lib/services/publicCommunityService";
import { geocodeLocation } from "@/lib/utils/locationGeocode";

export const CANT_FIND_COMMUNITY = "__cant_find__";

interface Step2AddressProps {
  onNext: () => void;
  onBack: () => void;
}

const odishaDistricts = [
  "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
  "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur",
  "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha",
  "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada",
  "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
];

const isOdishaState = (name: string) =>
  /^(odisha|orissa)$/i.test((name || "").trim());

export default function Step2Address({ onNext, onBack }: Step2AddressProps) {
  const { register, watch, trigger, setValue, formState: { errors, touchedFields } } = useFormContext();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [communities, setCommunities] = useState<PublicCommunity[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  // ✅ FIX: Single watch() call for better performance
  const formData = watch();
  const nearbyCommunityId = formData.nearbyCommunityId || "";
  const currentState = formData.currentState;
  const currentCountry = formData.currentCountry;
  const currentCity = formData.currentCity;
  const currentLatitude = formData.currentLatitude;
  const currentLongitude = formData.currentLongitude;
  const showRequestedCommunity = nearbyCommunityId === CANT_FIND_COMMUNITY;

  const { countries, states, cities, loading } = useLocationData({
    country: formData.currentCountry || '',
    state: formData.currentState || ''
  });

  const availableStates = useMemo(
    () => states.filter((state) => !isOdishaState(state.name)),
    [states]
  );

  // Load communities
  useEffect(() => {
    let cancelled = false;
    const loadCommunities = async () => {
      setLoadingCommunities(true);
      try {
        const result = await publicCommunityService.getActiveCommunities();
        if (!cancelled) {
          setCommunities(result.communities || []);
        }
      } finally {
        if (!cancelled) {
          setLoadingCommunities(false);
        }
      }
    };

    loadCommunities();
    return () => {
      cancelled = true;
    };
  }, []);

  // Clear Odisha if selected
  useEffect(() => {
    if (currentState && isOdishaState(currentState)) {
      setValue("currentState", "", { shouldValidate: true });
      setValue("currentCity", "", { shouldValidate: true });
      setValue("currentLatitude", undefined);
      setValue("currentLongitude", undefined);
      toast.error("Odisha cannot be selected as current address state");
    }
  }, [currentState, setValue]);

  // Geocode when city/state/country changes
  useEffect(() => {
    const canGeocode = currentCity && currentState && currentCountry;
    if (!canGeocode) {
      setValue("currentLatitude", undefined);
      setValue("currentLongitude", undefined);
      setGeocodeError(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsGeocoding(true);
        setGeocodeError(null);
        const result = await geocodeLocation({
          city: currentCity,
          state: currentState,
          country: currentCountry,
        });

        if (result) {
          setValue("currentLatitude", result.lat, { shouldValidate: false });
          setValue("currentLongitude", result.lng, { shouldValidate: false });
        } else {
          setValue("currentLatitude", undefined);
          setValue("currentLongitude", undefined);
          setGeocodeError("Could not find coordinates for this location. Please check your address.");
        }
      } catch (error) {
        console.error("Geocoding failed:", error);
        setGeocodeError("Geocoding failed. Please try again.");
      } finally {
        setIsGeocoding(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [currentCity, currentState, currentCountry, setValue]);

  // Community name sync
  useEffect(() => {
    if (!nearbyCommunityId || nearbyCommunityId === CANT_FIND_COMMUNITY) {
      setValue("nearbyCommunityName", "", { shouldValidate: false });
      if (nearbyCommunityId === CANT_FIND_COMMUNITY) {
        setValue("requestedCommunityName", formData.requestedCommunityName || "", { shouldValidate: false });
      } else {
        setValue("requestedCommunityName", "", { shouldValidate: false });
      }
      return;
    }

    const selected = communities.find((community) => community.id === nearbyCommunityId);
    setValue("nearbyCommunityName", selected?.name || "", { shouldValidate: false });
    setValue("requestedCommunityName", "", { shouldValidate: false });
  }, [nearbyCommunityId, communities, setValue, formData.requestedCommunityName]);

  const fields = [
    "odishaHomeAddress", "odishaDistrict", "odishaCity", "odishaPinCode",
    "currentAddress", "currentCountry", "currentState", "currentCity", "currentPinCode",
    "nearbyCommunityId",
    ...(showRequestedCommunity ? ["requestedCommunityName"] : []),
  ];

  const shouldShowError = (name: string) =>
    Boolean((hasAttemptedSubmit || touchedFields[name]) && errors[name]);

  const inputClass = (name: string) => `
    w-full px-4 py-3 rounded-2xl border bg-white/50 focus:ring-2 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30
    ${shouldShowError(name)
      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
      : "border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20"
    }
  `;

  const ErrorMessage = ({ name }: { name: string }) => (
    <div className="min-h-6 mt-1" aria-live="polite">
      <AnimatePresence>
        {shouldShowError(name) && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-red-400 text-sm"
          >
            {errors[name]?.message as string}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  const handleNext = async () => {
    setHasAttemptedSubmit(true);
    if (await trigger(fields)) {
      onNext();
    } else {
      toast.error("Please fill all required address fields correctly");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-5 md:space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#6B1E5B]/10 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-4 h-4 text-[#6B1E5B]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#2A1636]">📍 Your Roots</h2>
          <p className="text-sm text-[#6B5E5A]">Where do you call home?</p>
        </div>
      </div>

      {/* Odisha Address Section */}
      <div className="bg-[#6B1E5B]/5 rounded-2xl p-4 border border-[#6B1E5B]/10">
        <h3 className="text-sm font-semibold text-[#2A1636] mb-3 flex items-center gap-2">
          <Home className="w-4 h-4 text-[#6B1E5B]" /> Odisha Home Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Home Address <span className="text-red-400">*</span>
            </label>
            <input {...register("odishaHomeAddress")} className={inputClass("odishaHomeAddress")} placeholder="House/Flat no., Street, Area" />
            <ErrorMessage name="odishaHomeAddress" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              District <span className="text-red-400">*</span>
            </label>
            <select {...register("odishaDistrict")} className={`${inputClass("odishaDistrict")} appearance-none cursor-pointer`}>
              <option value="">Select district</option>
              {odishaDistricts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            <ErrorMessage name="odishaDistrict" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              City <span className="text-red-400">*</span>
            </label>
            <input {...register("odishaCity")} className={inputClass("odishaCity")} placeholder="City name" />
            <ErrorMessage name="odishaCity" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Pin Code <span className="text-red-400">*</span>
            </label>
            <input {...register("odishaPinCode")} type="text" className={inputClass("odishaPinCode")} placeholder="6 digit pin" maxLength={6} />
            <ErrorMessage name="odishaPinCode" />
          </div>
        </div>
      </div>

      {/* Current Address Section */}
      <div className="bg-[#D9772B]/5 rounded-2xl p-4 border border-[#D9772B]/10">
        <h3 className="text-sm font-semibold text-[#2A1636] mb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-[#D9772B]" /> Current Address
        </h3>
        <p className="text-xs text-[#D9772B] mb-3">
          Current address must be outside Odisha (Prabasi living elsewhere).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Current Address <span className="text-red-400">*</span>
            </label>
            <input {...register("currentAddress")} className={inputClass("currentAddress")} placeholder="House/Flat no., Street, Area" />
            <ErrorMessage name="currentAddress" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Country <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
              <select
                {...register("currentCountry")}
                className={`${inputClass("currentCountry")} appearance-none cursor-pointer pl-12`}
                disabled={loading.countries}
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.iso2} value={country.name}>{country.name}</option>
                ))}
              </select>
            </div>
            {loading.countries && <p className="text-xs text-[#6B5E5A] mt-1">Loading countries...</p>}
            <ErrorMessage name="currentCountry" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              State <span className="text-red-400">*</span>
            </label>
            <select
              {...register("currentState")}
              className={`${inputClass("currentState")} appearance-none cursor-pointer`}
              disabled={!availableStates.length || loading.states}
            >
              <option value="">Select State</option>
              {availableStates.map((state) => (
                <option key={state.iso2} value={state.name}>{state.name}</option>
              ))}
            </select>
            {loading.states && <p className="text-xs text-[#6B5E5A] mt-1">Loading states...</p>}
            <ErrorMessage name="currentState" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              City <span className="text-red-400">*</span>
            </label>
            <select
              {...register("currentCity")}
              className={`${inputClass("currentCity")} appearance-none cursor-pointer`}
              disabled={!cities.length || loading.cities}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>{city.name}</option>
              ))}
            </select>
            {loading.cities && <p className="text-xs text-[#6B5E5A] mt-1">Loading cities...</p>}
            <ErrorMessage name="currentCity" />
            
            {/* ✅ FIX: Geocoding loading state */}
            {isGeocoding && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 border-2 border-[#6B1E5B] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-[#6B5E5A]">Fetching map coordinates...</p>
              </div>
            )}
            
            {/* ✅ FIX: Geocoding success state */}
            {!isGeocoding && currentLatitude && currentLongitude && !geocodeError && (
              <p className="text-xs text-emerald-700 mt-1">✅ Coordinates captured for map display</p>
            )}
            
            {/* ✅ FIX: Geocoding error state */}
            {geocodeError && (
              <p className="text-xs text-amber-600 mt-1">⚠️ {geocodeError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Pin Code <span className="text-red-400">*</span>
            </label>
            <input {...register("currentPinCode")} type="text" className={inputClass("currentPinCode")} placeholder="6 digit pin" maxLength={6} />
            <ErrorMessage name="currentPinCode" />
          </div>
        </div>
      </div>

      {/* Nearby Community Section */}
      <div className="bg-[#6B1E5B]/5 rounded-2xl p-4 border border-[#6B1E5B]/10">
        <h3 className="text-sm font-semibold text-[#2A1636] mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#6B1E5B]" /> Your Nearby Community
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Nearby Community <span className="text-red-400">*</span>
            </label>
            <select
              {...register("nearbyCommunityId")}
              className={`${inputClass("nearbyCommunityId")} appearance-none cursor-pointer`}
              disabled={loadingCommunities}
            >
              <option value="">
                {loadingCommunities ? "Loading communities..." : communities.length > 0 ? "Select your nearby community" : "No communities available"}
              </option>
              {communities.length > 0 && communities.map((community) => (
                <option key={community.id} value={community.id}>
                  {community.name}
                  {community.city ? ` — ${community.city}` : ""}
                  {community.state ? `, ${community.state}` : ""}
                </option>
              ))}
              <option value={CANT_FIND_COMMUNITY}>Can&apos;t find nearby community</option>
            </select>
            {!loadingCommunities && communities.length === 0 && (
              <p className="text-xs text-[#6B5E5A] mt-1">
                No communities are available yet. You can request a new one below.
              </p>
            )}
            <ErrorMessage name="nearbyCommunityId" />
            {!showRequestedCommunity && nearbyCommunityId && (
              <p className="text-xs text-[#6B1E5B] mt-1">
                You will be added as a member of this community after submission.
              </p>
            )}
          </div>

          <AnimatePresence>
            {showRequestedCommunity && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-sm font-medium text-[#2A1636] mb-2">
                  Suggest Community Name <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("requestedCommunityName")}
                  className={inputClass("requestedCommunityName")}
                  placeholder="Enter your community / city name"
                />
                <ErrorMessage name="requestedCommunityName" />
                <p className="text-xs text-[#D9772B] mt-1">
                  Your request will go to admin for verification. Admin will create the community manually.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <input type="hidden" {...register("currentLatitude", { valueAsNumber: true })} />
      <input type="hidden" {...register("currentLongitude", { valueAsNumber: true })} />
      
      <div className="flex justify-between pt-6 border-t border-[#D4C8C0]/20 mt-6">
        <button onClick={onBack} className="px-6 py-2.5 rounded-xl border border-[#D4C8C0]/30 text-[#6B5E5A] font-medium hover:bg-white/50 transition-all duration-300 cursor-pointer">
          ← Back
        </button>
        <button onClick={handleNext} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-medium shadow-lg shadow-[#6B1E5B]/20 hover:shadow-[#6B1E5B]/40 transition-all duration-300 hover:scale-[1.02] cursor-pointer">
          Next →
        </button>
      </div>
    </motion.div>
  );
}