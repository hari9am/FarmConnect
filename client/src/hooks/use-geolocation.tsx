import { useState, useCallback } from "react";

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

export function useGeolocation() {
  const [isSupported] = useState(() => 'geolocation' in navigator);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);

  const getCurrentPosition = useCallback((options?: PositionOptions): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        const error = {
          code: 0,
          message: "Geolocation is not supported by this browser"
        };
        setError(error);
        reject(error);
        return;
      }

      setIsLoading(true);
      setError(null);

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position: GeolocationPosition = {
            coords: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              altitude: pos.coords.altitude,
              altitudeAccuracy: pos.coords.altitudeAccuracy,
              heading: pos.coords.heading,
              speed: pos.coords.speed,
            },
            timestamp: pos.timestamp,
          };
          
          setPosition(position);
          setIsLoading(false);
          resolve(position);
        },
        (err) => {
          const error: GeolocationError = {
            code: err.code,
            message: err.message,
          };
          
          setError(error);
          setIsLoading(false);
          reject(error);
        },
        defaultOptions
      );
    });
  }, [isSupported]);

  const watchPosition = useCallback((
    callback: (position: GeolocationPosition) => void,
    errorCallback?: (error: GeolocationError) => void,
    options?: PositionOptions
  ): number | null => {
    if (!isSupported) {
      const error = {
        code: 0,
        message: "Geolocation is not supported by this browser"
      };
      if (errorCallback) errorCallback(error);
      return null;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const position: GeolocationPosition = {
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
          },
          timestamp: pos.timestamp,
        };
        
        setPosition(position);
        callback(position);
      },
      (err) => {
        const error: GeolocationError = {
          code: err.code,
          message: err.message,
        };
        
        setError(error);
        if (errorCallback) errorCallback(error);
      },
      defaultOptions
    );

    return watchId;
  }, [isSupported]);

  const clearWatch = useCallback((watchId: number) => {
    if (isSupported) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, [isSupported]);

  return {
    getCurrentPosition,
    watchPosition,
    clearWatch,
    isSupported,
    isLoading,
    error,
    position,
  };
}
