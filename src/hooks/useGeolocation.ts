// Custom hook that requests the browser's GPS position
import { useState } from "react";

interface GeoPosition {
    latitude: number;
    longitude: number;
}

export function useGeolocation() {
    const [position, setPosition] = useState<GeoPosition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Called when the user explicitly clicks
    const requestLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation not supported");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setLoading(false);
            },
            (err) => {
                setError(err.message); //when user denied location
                setLoading(false);
            }
        );
    };

    return { position, error, loading, requestLocation };
}
