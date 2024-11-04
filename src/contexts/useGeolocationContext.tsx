import { useContext } from 'react';
import { GeolocationContext, GeolocationContextInterface } from './GeolocationContext';

const useGeolocationContext = (): GeolocationContextInterface => {
    const context = useContext(GeolocationContext);

    if (context === undefined) {
        throw new Error('useGeolocationContext was used outside of its Provider');
    } else if (!context) {
        throw new Error('useGeolocationContext is null');
    }

    return context;
};

export { useGeolocationContext };
