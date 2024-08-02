import { Coordinates } from '@types';

const haversineDistance = (coords1: Coordinates, coords2: Coordinates): number => {
    const R = 6371; // Earth's radius in kilometers
    const lat1 = coords1.latitude;
    const lon1 = coords1.longitude;
    const lat2 = coords2.latitude;
    const lon2 = coords2.longitude;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const toRadians = (degrees: number): number => {
    return (degrees * Math.PI) / 180;
};

export { haversineDistance, toRadians };
