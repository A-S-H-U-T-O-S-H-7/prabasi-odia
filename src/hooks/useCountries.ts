import { useEffect, useState } from 'react';

export interface Country {
  id: string | number;
  name: string;
  iso2: string;
  phonecode?: string | number;
}

let cachedCountries: Country[] | null = null;
let countriesRequest: Promise<Country[]> | null = null;

function fetchCountries(): Promise<Country[]> {
  if (cachedCountries) return Promise.resolve(cachedCountries);
  if (countriesRequest) return countriesRequest;

  countriesRequest = fetch('/api/location')
    .then(async (response) => {
      if (!response.ok) throw new Error('Unable to load countries. Please try again.');
      const data = await response.json();
      if (!Array.isArray(data) || !data.length) {
        throw new Error('Unable to load countries. Please try again.');
      }
      cachedCountries = data;
      return data as Country[];
    })
    .finally(() => {
      countriesRequest = null;
    });

  return countriesRequest;
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>(cachedCountries || []);
  const [loading, setLoading] = useState(!cachedCountries);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCountries()
      .then((data) => {
        if (!cancelled) setCountries(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load countries. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [attempt]);

  return { countries, loading, error, retry: () => setAttempt((value) => value + 1) };
}
