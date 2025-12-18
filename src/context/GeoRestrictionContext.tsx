import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

interface LocationInfo {
  city?: string;
  region?: string;
  country?: string;
}

interface GeoRestrictionState {
  isChecking: boolean;
  isRestricted: boolean;
  location: LocationInfo;
  reason?: string;
  error?: string;
  refresh: () => Promise<void>;
}

interface CachedLocation {
  timestamp: number;
  location: LocationInfo;
  isRestricted: boolean;
  reason?: string;
}

const CACHE_KEY = 'salcedo-geo-restriction';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

const GeoRestrictionContext = createContext<GeoRestrictionState | undefined>(undefined);

const normalize = (value?: string) => value?.toLowerCase().trim() || '';

const isPimentelRestricted = (city?: string, region?: string, country?: string) => {
  const cityName = normalize(city);
  const regionName = normalize(region);
  const countryName = normalize(country);

  // Solo bloquear si la ciudad reportada es Pimentel y el país es Perú.
  if (!cityName.includes('pimentel')) return false;
  if (!(countryName === 'peru' || countryName === 'pe')) return false;

  // Si existe región y no es Lambayeque, no bloquear.
  if (regionName && !regionName.includes('lambayeque')) return false;

  return true;
};

const evaluateRestriction = (location: LocationInfo) => {
  const restricted = isPimentelRestricted(location.city, location.region, location.country);
  return {
    restricted,
    reason: restricted ? 'Catálogo limitado en Pimentel (Lambayeque, Perú).' : undefined
  };
};

const readCache = (): CachedLocation | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedLocation;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed;
  } catch (error) {
    console.warn('No se pudo leer la caché de geolocalización', error);
    return null;
  }
};

const writeCache = (payload: CachedLocation) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('No se pudo guardar la caché de geolocalización', error);
  }
};

const fetchLocation = async (): Promise<LocationInfo> => {
  const response = await fetch('https://ipapi.co/json/');
  if (!response.ok) {
    throw new Error('Fallo la consulta de geolocalización');
  }
  const data = await response.json();
  return {
    city: data.city,
    region: data.region,
    country: data.country_name || data.country
  };
};

export const GeoRestrictionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<Omit<GeoRestrictionState, 'refresh'>>({
    isChecking: true,
    isRestricted: false,
    location: {},
    reason: undefined,
    error: undefined
  });

  const runCheck = useCallback(async (forceRefresh = false) => {
    setState(prev => ({ ...prev, isChecking: true, error: undefined }));

    try {
      if (!forceRefresh) {
        const cached = readCache();
        if (cached) {
          setState({
            isChecking: false,
            isRestricted: cached.isRestricted,
            location: cached.location,
            reason: cached.reason,
            error: undefined
          });
          return;
        }
      }

      const location = await fetchLocation();
      const { restricted, reason } = evaluateRestriction(location);

      setState({
        isChecking: false,
        isRestricted: restricted,
        location,
        reason,
        error: undefined
      });

      writeCache({
        timestamp: Date.now(),
        location,
        isRestricted: restricted,
        reason
      });
    } catch (error) {
      console.error('Error verificando la geolocalización', error);
      setState(prev => ({
        ...prev,
        isChecking: false,
        isRestricted: false,
        error: 'No se pudo confirmar la ubicación. Se muestra el sitio completo.'
      }));
    }
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  const value = useMemo<GeoRestrictionState>(() => ({
    ...state,
    refresh: () => runCheck(true)
  }), [state, runCheck]);

  return (
    <GeoRestrictionContext.Provider value={value}>
      {children}
    </GeoRestrictionContext.Provider>
  );
};

export const useGeoRestriction = () => {
  const context = useContext(GeoRestrictionContext);
  if (!context) {
    throw new Error('useGeoRestriction debe usarse dentro de GeoRestrictionProvider');
  }
  return context;
};
