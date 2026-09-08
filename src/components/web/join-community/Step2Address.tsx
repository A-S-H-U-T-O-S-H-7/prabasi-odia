"use client";
import { useJoinFormSupport } from "./JoinFormSupport";

import { motion, AnimatePresence } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { ChevronDown, Loader2, MapPin, Home, Building, Globe, Users } from "lucide-react";
import { useState, useEffect, useMemo, useId } from "react";
import { toast } from "react-hot-toast";
import { useLocationData } from "@/hooks/useLocationData";
import { publicCommunityService, PublicCommunity } from "@/lib/services/publicCommunityService";
import { geocodeLocation } from "@/lib/utils/clientGeocode";
import CommunitySelect, { CANT_FIND_COMMUNITY } from "./Communityselect";

export { CANT_FIND_COMMUNITY }; 

interface Step2AddressProps {
  onNext: () => void;
  onBack: () => void;
  buttonLabel?: string;
  isSubmitting?: boolean;
}

const odishaDistricts = [
  "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
  "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur",
  "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha",
  "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada",
  "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
];

const isOdishaState = (name: string) => /^(odisha|orissa)$/i.test((name || "").trim());

// Odisha PIN codes: 6 digits, first digit 7, second digit 5/6/7 (covers 75x-77x ranges used across Odisha)
const sanitizeOdishaPin = (raw: string, previous: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  if (digits.length === 0) return "";
  if (digits[0] !== "7") return previous;
  if (digits.length >= 2 && !["5", "6", "7"].includes(digits[1])) return previous;
  return digits;
};

const sanitizeGenericPin = (raw: string): string => raw.replace(/\D/g, "").slice(0, 6);

interface SearchableSelectProps {
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  blockedMessage?: string;
  className: string;
  onChange: (value: string) => void;
}

function SearchableSelect({ value, options, placeholder, disabled = false, blockedMessage, className, onChange }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shownMessage, setShownMessage] = useState<string>();
  const messageId = useId();
  const showGuidance = Boolean(blockedMessage && shownMessage === blockedMessage);
  const query = value.toLowerCase();
  const matches = options.filter((option) => option.toLowerCase().includes(query));

  useEffect(() => {
    setShownMessage(undefined);
    setIsOpen(false);
  }, [blockedMessage]);

  const handleOpen = () => {
    if (blockedMessage) {
      setShownMessage(blockedMessage);
      setIsOpen(false);
      return;
    }
    if (!disabled) setIsOpen(true);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={(event) => {
            if (blockedMessage) return;
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onFocus={handleOpen}
          onClick={handleOpen}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled && !blockedMessage}
          readOnly={Boolean(blockedMessage)}
          aria-disabled={disabled || Boolean(blockedMessage)}
          aria-describedby={showGuidance ? messageId : undefined}
          className={`${className} pr-10`}
        />
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5E5A] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>
      {showGuidance && <p id={messageId} role="status" className="mt-1.5 text-xs text-amber-700">{blockedMessage}</p>}
      {isOpen && !disabled && !blockedMessage && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-[#D4C8C0]/60 bg-white p-1 shadow-lg">
          {matches.length ? matches.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#2A1636] hover:bg-[#6B1E5B]/10"
            >
              {option}
            </button>
          )) : (
            <p className="px-3 py-2 text-sm text-[#6B5E5A]">No matching options</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Step2Address({ onNext, onBack, buttonLabel = "Next", isSubmitting = false }: Step2AddressProps) {
  const support = useJoinFormSupport();
  const { register, watch, trigger, setValue, formState: { errors, touchedFields } } = useFormContext();
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [communities, setCommunities] = useState<PublicCommunity[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const formData = watch();
  const nearbyCommunityId = formData.nearbyCommunityId || "";
  const currentState = formData.currentState;
  const currentCountry = formData.currentCountry;
  const isIndianAddress = currentCountry === "India";
  const currentCity = formData.currentCity;
  const currentLatitude = formData.currentLatitude;
  const currentLongitude = formData.currentLongitude;
  const showRequestedCommunity = nearbyCommunityId === CANT_FIND_COMMUNITY;

  const { countries, states, cities, loading } = useLocationData({
    country: formData.currentCountry || "",
    state: formData.currentState || "",
  });

  const availableStates = useMemo(() => states.filter((state) => !isOdishaState(state.name)), [states]);
  const hasSelectedCountry = countries.some((country) => country.name === currentCountry);
  const hasSelectedState = availableStates.some((state) => state.name === currentState);

  useEffect(() => {
    let cancelled = false;
    const loadCommunities = async () => {
      setLoadingCommunities(true);
      try {
        const result = await publicCommunityService.getActiveCommunities();
        if (!cancelled) setCommunities(result.communities || []);
      } finally {
        if (!cancelled) setLoadingCommunities(false);
      }
    };
    loadCommunities();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (currentState && isOdishaState(currentState)) {
      setValue("currentState", "", { shouldValidate: true });
      setValue("currentCity", "", { shouldValidate: true });
      setValue("currentLatitude", undefined);
      setValue("currentLongitude", undefined);
      toast.error("Odisha cannot be selected as current address state");
    }
  }, [currentState, setValue]);

  useEffect(() => {
    let cancelled = false;
    setIsGeocoding(false);
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
        const result = await geocodeLocation({ city: currentCity, state: currentState, country: currentCountry });

        if (cancelled) return;
        if (result) {
          setValue("currentLatitude", result.lat, { shouldValidate: false });
          setValue("currentLongitude", result.lng, { shouldValidate: false });
        } else {
          setValue("currentLatitude", undefined);
          setValue("currentLongitude", undefined);
          setGeocodeError("Could not find coordinates for this location. Please check your address.");
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Geocoding failed:", error);
        setGeocodeError("Geocoding failed. Please try again.");
      } finally {
        if (!cancelled) setIsGeocoding(false);
      }
    }, 500);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [currentCity, currentState, currentCountry, setValue]);

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

  const shouldShowError = (name: string) => Boolean((hasAttemptedSubmit || touchedFields[name]) && errors[name]);

  const inputClass = (name: string) => `
    w-full px-4 py-2.5 rounded-xl border bg-white/50 focus:ring-2 transition-all duration-300 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30
    ${shouldShowError(name) ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20"}
  `;

  const currentAddressFeedbackClass = "mt-1 min-h-0 empty:mt-0 lg:mt-1 lg:min-h-5 lg:empty:mt-1";

  const ErrorMessage = ({ name, compactOnMobile = false }: { name: string; compactOnMobile?: boolean }) => (
    <div className={compactOnMobile ? currentAddressFeedbackClass : "min-h-5 mt-1"} aria-live="polite">
      <AnimatePresence mode="wait">
        {shouldShowError(name) && (
          <motion.p key="err" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-red-400 text-sm">
            {errors[name]?.message as string}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  const handleNext = async () => {
    setHasAttemptedSubmit(true);
    if (await trigger(fields)) {
      support.resetNextFailures();
      onNext();
    } else {
      support.recordNextFailure();
      toast.error("Please fill all required address fields correctly");
    }
  };

  const odishaPin = formData.odishaPinCode || "";
  const currentPin = formData.currentPinCode || "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 sm:space-y-6"
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
      <div className="bg-[#6B1E5B]/5 rounded-xl border border-[#6B1E5B]/10 p-2.5 sm:rounded-2xl sm:p-3">
        <h3 className="text-sm font-semibold text-[#2A1636] mb-3 flex items-center gap-2">
          <Home className="w-4 h-4 text-[#6B1E5B]" /> Odisha Home Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            <SearchableSelect
              value={formData.odishaDistrict || ""}
              options={odishaDistricts}
              placeholder="Select district"
              className={inputClass("odishaDistrict")}
              onChange={(value) => setValue("odishaDistrict", value, { shouldValidate: hasAttemptedSubmit || touchedFields.odishaDistrict })}
            />
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
            <input
              type="text"
              inputMode="numeric"
              value={odishaPin}
              className={inputClass("odishaPinCode")}
              placeholder="7XXXXX"
              maxLength={6}
              onChange={(e) => {
                const sanitized = sanitizeOdishaPin(e.target.value, odishaPin);
                setValue("odishaPinCode", sanitized, { shouldValidate: hasAttemptedSubmit || touchedFields.odishaPinCode });
              }}
              onBlur={() => trigger("odishaPinCode")}
            />
            <div className="min-h-5 mt-1">
              {!shouldShowError("odishaPinCode") && (
                <p className="text-[10px] text-[#6B5E5A]/60">Starts with 7, second digit 5-7 · 6 digits</p>
              )}
            </div>
            <ErrorMessage name="odishaPinCode" />
          </div>
        </div>
      </div>

      {/* Current Address Section */}
      <div className="bg-[#D9772B]/5 rounded-xl border border-[#D9772B]/10 p-2.5 sm:rounded-2xl sm:p-3">
        <h3 className="text-sm font-semibold text-[#2A1636] mb-1 flex items-center gap-2">
          <Building className="w-4 h-4 text-[#D9772B]" /> Current Address
        </h3>
        <p className="text-xs text-[#D9772B] mb-3">Current address must be outside Odisha (Prabasi living elsewhere).</p>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Current Address <span className="text-red-400">*</span>
            </label>
            <input {...register("currentAddress")} className={inputClass("currentAddress")} placeholder="House/Flat no., Street, Area" />
            <ErrorMessage name="currentAddress" compactOnMobile />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Country <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 hidden -translate-y-1/2 h-4 w-4 text-[#6B5E5A]/40 sm:block" />
              <SearchableSelect
                value={currentCountry || ""}
                options={countries.map((country) => country.name)}
                className={`${inputClass("currentCountry")} sm:pl-12`}
                disabled={loading.countries}
                placeholder={formData.residencyStatus === "NRI" ? "Select your current country" : "Type country"}
                onChange={(value) => {
                  setValue("currentCountry", value, { shouldDirty: true, shouldValidate: hasAttemptedSubmit || touchedFields.currentCountry });
                  ["currentState", "currentCity", "currentPinCode", "nearbyCommunityId", "nearbyCommunityName", "requestedCommunityName"].forEach((field) => setValue(field, "", { shouldDirty: true }));
                  setValue("currentLatitude", undefined);
                  setValue("currentLongitude", undefined);
                }}
              />
            </div>
            <div className={currentAddressFeedbackClass}>
              {loading.countries && <p className="text-xs text-[#6B5E5A]">Loading countries...</p>}
            </div>
            <ErrorMessage name="currentCountry" compactOnMobile />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              State <span className="text-red-400">*</span>
            </label>
            <SearchableSelect
              value={currentState || ""}
              options={availableStates.map((state) => state.name)}
              className={inputClass("currentState")}
              disabled={!availableStates.length || loading.states}
              blockedMessage={!hasSelectedCountry ? "Please select your country first to see the available states." : undefined}
              placeholder="Type state"
              onChange={(value) => {
                setValue("currentState", value, { shouldDirty: true, shouldValidate: hasAttemptedSubmit || touchedFields.currentState });
                setValue("currentCity", "", { shouldDirty: true });
                setValue("currentLatitude", undefined);
                setValue("currentLongitude", undefined);
              }}
            />
            <div className={currentAddressFeedbackClass}>
              {loading.states && <p className="text-xs text-[#6B5E5A]">Loading states...</p>}
            </div>
            <ErrorMessage name="currentState" compactOnMobile />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              City <span className="text-red-400">*</span>
            </label>
            <SearchableSelect
              value={currentCity || ""}
              options={cities.map((city) => city.name)}
              className={inputClass("currentCity")}
              disabled={!cities.length || loading.cities}
              blockedMessage={!hasSelectedCountry
                ? "Please select your country first, then your state, to see the available cities."
                : !hasSelectedState
                  ? "Please select your state first to see the available cities."
                  : undefined}
              placeholder="Type city"
              onChange={(value) => setValue("currentCity", value, { shouldValidate: hasAttemptedSubmit || touchedFields.currentCity })}
            />

            <div className={currentAddressFeedbackClass}>
              <AnimatePresence mode="wait">
                {loading.cities && (
                  <motion.p key="loading" className="text-xs text-[#6B5E5A]">Loading cities...</motion.p>
                )}
                {!loading.cities && isGeocoding && (
                  <motion.div key="geocoding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-[#6B1E5B] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-[#6B5E5A]">Fetching map coordinates...</p>
                  </motion.div>
                )}
                {!loading.cities && !isGeocoding && currentLatitude && currentLongitude && !geocodeError && (
                  <motion.p key="success" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-emerald-700">
                    ✅ Coordinates captured for map display
                  </motion.p>
                )}
                {!loading.cities && geocodeError && (
                  <motion.p key="error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-amber-600">
                    ⚠️ {geocodeError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <ErrorMessage name="currentCity" compactOnMobile />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              {isIndianAddress ? "Pin Code" : "Postal / ZIP Code"} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              inputMode={isIndianAddress ? "numeric" : "text"}
              value={currentPin}
              className={inputClass("currentPinCode")}
              placeholder={isIndianAddress ? "6 digit pin" : "Postal / ZIP code"}
              maxLength={isIndianAddress ? 6 : 16}
              onChange={(e) => {
                const sanitized = isIndianAddress ? sanitizeGenericPin(e.target.value) : e.target.value.toUpperCase();
                setValue("currentPinCode", sanitized, { shouldValidate: hasAttemptedSubmit || touchedFields.currentPinCode });
              }}
              onBlur={() => trigger("currentPinCode")}
            />
            <ErrorMessage name="currentPinCode" compactOnMobile />
          </div>
        </div>
      </div>

      {/* Nearby Community Section */}
      <div className="bg-[#6B1E5B]/5 rounded-xl border border-[#6B1E5B]/10 p-2.5 sm:rounded-2xl sm:p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#2A1636] sm:mb-4">
          <Users className="w-4 h-4 text-[#6B1E5B]" /> Your Nearby Community
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-2">
              Nearby Community <span className="text-red-400">*</span>
            </label>
            <CommunitySelect
              communities={communities}
              value={nearbyCommunityId}
              onChange={(id) => {
                setValue("nearbyCommunityId", id, { shouldValidate: true });
              }}
              loading={loadingCommunities}
              currentCity={currentCity}
              currentState={currentState}
              hasError={shouldShowError("nearbyCommunityId")}
            />
            {!loadingCommunities && communities.length === 0 && (
              <p className="text-xs text-[#6B5E5A] mt-1">No communities are available yet. You can request a new one below.</p>
            )}
            <ErrorMessage name="nearbyCommunityId" />
            {!showRequestedCommunity && nearbyCommunityId && (
              <p className="text-xs text-[#6B1E5B] mt-1">If approved, an administrator will add you to this community.</p>
            )}
          </div>

          <AnimatePresence>
            {showRequestedCommunity && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <label className="block text-sm font-medium text-[#2A1636] mb-2">
                  Suggest Community Name <span className="text-red-400">*</span>
                </label>
                <input {...register("requestedCommunityName")} className={inputClass("requestedCommunityName")} placeholder="Enter your community / city name" />
                <ErrorMessage name="requestedCommunityName" />
                <p className="text-xs text-[#D9772B] mt-1">Your request will go to admin for verification. Admin will create the community manually.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <input type="hidden" {...register("currentLatitude", { valueAsNumber: true })} />
      <input type="hidden" {...register("currentLongitude", { valueAsNumber: true })} />

      <div className="mt-4 flex justify-between border-t border-[#D4C8C0]/20 pt-4 sm:mt-6 sm:pt-6">
        <button onClick={onBack} disabled={isSubmitting} className="rounded-xl border border-[#D4C8C0]/30 px-4 py-2 text-sm font-medium text-[#6B5E5A] transition-all duration-300 hover:bg-white/50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-2.5 sm:text-base cursor-pointer">
          ← Back
        </button>
        <button onClick={handleNext} disabled={isSubmitting} className="flex min-w-36 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#6B1E5B]/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-[#6B1E5B]/40 disabled:cursor-not-allowed disabled:opacity-70 sm:px-6 sm:py-2.5 sm:text-base cursor-pointer">
          {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</> : <>{buttonLabel} →</>}
        </button>
      </div>
    </motion.div>
  );
}
