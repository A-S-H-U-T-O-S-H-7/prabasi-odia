import { useState, useEffect } from 'react';
import { useCountries } from './useCountries';

export const useLocationData = (formData: { country: string; state: string }) => {
  const { countries, loading: loadingCountries } = useCountries();
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    states: false,
    cities: false
  });

  const API_KEY = process.env.NEXT_PUBLIC_LOCATION_API_KEY || '';

  // Fetch states when country changes
  useEffect(() => {
    let cancelled = false;
    setStates([]);
    setCities([]);
    setLoading(prev => ({ ...prev, states: false }));
    if (!formData.country) return;
    
    const selectedCountry = countries.find((c) => c.name === formData.country);
    if (!selectedCountry) return;

    setLoading(prev => ({ ...prev, states: true }));
    fetch(`https://api.countrystatecity.in/v1/countries/${selectedCountry.iso2}/states`, {
      headers: { "X-CSCAPI-KEY": API_KEY },
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setStates(Array.isArray(data) ? data : []);
        setLoading(prev => ({ ...prev, states: false }));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch states:", err);
        setStates([]);
        setLoading(prev => ({ ...prev, states: false }));
      });
    
    return () => { cancelled = true; };
  }, [formData.country, countries, API_KEY]);

  // Fetch cities when state changes
  useEffect(() => {
    let cancelled = false;
    setCities([]);
    setLoading(prev => ({ ...prev, cities: false }));
    if (!formData.state || !formData.country) return;
    
    const selectedCountry = countries.find((c) => c.name === formData.country);
    const selectedState = states.find((s) => s.name === formData.state);
    if (!selectedCountry || !selectedState) return;

    setLoading(prev => ({ ...prev, cities: true }));
    fetch(`https://api.countrystatecity.in/v1/countries/${selectedCountry.iso2}/states/${selectedState.iso2}/cities`, {
      headers: { "X-CSCAPI-KEY": API_KEY },
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setCities(Array.isArray(data) ? data : []);
        setLoading(prev => ({ ...prev, cities: false }));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to fetch cities:", err);
        setCities([]);
        setLoading(prev => ({ ...prev, cities: false }));
      });
    return () => { cancelled = true; };
  }, [formData.state, formData.country, countries, states, API_KEY]);

  return {
    countries,
    states,
    cities,
    loading: { ...loading, countries: loadingCountries }
  };
};
