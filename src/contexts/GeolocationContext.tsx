import { Coordinates, LocationData } from '@types';
import { createContext, FC, ReactElement, ReactNode, useState } from 'react';
import { Callback } from 'phantom-library';
import { findClosestZipcode } from '@utility';

interface GeolocationContextInterface {
    geolocation: LocationData;
    setGeolocation: Callback<Coordinates | null | string>;
}

const GeolocationContext = createContext<GeolocationContextInterface | null>(null);

interface GeolocationContextProviderProps {
    children: ReactNode;
}

const GeolocationContextProvider: FC<GeolocationContextProviderProps> = ({ children }): ReactElement => {
    const [geolocation, setGeolocationInternal] = useState<LocationData>({ loading: true, location: null, zipcode: null });

    const setGeolocation = (location: Coordinates | null | string) => {
        if (typeof location === 'string') {
            // Error
            console.warn(`Unable to get geolocation data due to: ${location}`);
            setGeolocationInternal({ loading: false, location: null, zipcode: null });
        } else {
            if (location) {
                const zipcode = findClosestZipcode(location);
                setGeolocationInternal({
                    loading: false,
                    location,
                    zipcode
                });
            } else {
                setGeolocationInternal({
                    loading: false,
                    location: null,
                    zipcode: null
                });
            }
        }
    };

    return <GeolocationContext.Provider value={{ geolocation, setGeolocation }}>{children}</GeolocationContext.Provider>;
};

export { GeolocationContext, GeolocationContextProvider };
export type { GeolocationContextInterface };
