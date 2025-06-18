import React, { createContext, useState, useEffect, useMemo, useContext, ReactNode, useCallback } from 'react';
import type { UserLocation } from '../types';
import { useToast } from './ToastContext'; // Assuming ToastContext is available

interface LocationContextType {
  userLocation: UserLocation | null;
  manualLocation: UserLocation | null;
  isUsingManualLocation: boolean;
  locationPermissionDenied: boolean;
  effectiveLocation: UserLocation | null;
  setUserLocation: React.Dispatch<React.SetStateAction<UserLocation | null>>;
  setManualLocation: React.Dispatch<React.SetStateAction<UserLocation | null>>;
  setIsUsingManualLocation: React.Dispatch<React.SetStateAction<boolean>>;
  requestLocationPermission: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState<boolean>(false);
  const [manualLocation, setManualLocation] = useState<UserLocation | null>(() => {
    const savedManualLoc = localStorage.getItem('nightlifeFinderManualLocation');
    return savedManualLoc ? JSON.parse(savedManualLoc) : null;
  });
  const [isUsingManualLocation, setIsUsingManualLocation] = useState<boolean>(() => {
    const savedIsUsing = localStorage.getItem('nightlifeFinderIsUsingManualLocation');
    return savedIsUsing ? JSON.parse(savedIsUsing) : false;
  });

  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('nightlifeFinderManualLocation', JSON.stringify(manualLocation));
  }, [manualLocation]);

  useEffect(() => {
    localStorage.setItem('nightlifeFinderIsUsingManualLocation', JSON.stringify(isUsingManualLocation));
  }, [isUsingManualLocation]);

  const requestLocationPermission = useCallback(() => {
    if (!isUsingManualLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLocationPermissionDenied(false);
        },
        (error) => {
          console.error("Error getting user location:", error.message);
          setLocationPermissionDenied(true);
          if (error.code === error.PERMISSION_DENIED) {
            showToast("Location permission denied. Distance features require location or manual input.", "error");
          } else {
            showToast("Could not determine GPS location. Set location manually for distance features.", "error");
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else if (isUsingManualLocation) {
      setLocationPermissionDenied(false); // If manual is set, permission is not strictly denied for functionality
    } else if (!navigator.geolocation) {
        setLocationPermissionDenied(true);
        showToast("Geolocation is not supported by your browser.", "error");
    }
  }, [isUsingManualLocation, showToast]);

  useEffect(() => {
    requestLocationPermission(); // Initial attempt
  }, [requestLocationPermission]);


  const effectiveLocation = useMemo(() => {
    return isUsingManualLocation && manualLocation ? manualLocation : userLocation;
  }, [isUsingManualLocation, manualLocation, userLocation]);

  return (
    <LocationContext.Provider value={{
      userLocation,
      manualLocation,
      isUsingManualLocation,
      locationPermissionDenied,
      effectiveLocation,
      setUserLocation,
      setManualLocation,
      setIsUsingManualLocation,
      requestLocationPermission
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
