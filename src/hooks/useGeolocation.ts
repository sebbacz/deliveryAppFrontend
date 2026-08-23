//  browser's GPS position on demand rather, to avoid the permissionprompt on page load.
import { useState } from "react";

interface GeoPosition {
    latitude: number;
    longitude: number;
}

export function useGeolocation() {
    const [position, setPosition] = useState<GeoPosition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
                setError(err.message);
                setLoading(false);
            }
        );
    };

    return { position, error, loading, requestLocation };
}
