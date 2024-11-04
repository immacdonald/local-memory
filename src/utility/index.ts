import { Coordinates } from '@types';
import { ComponentType } from 'react';
import { BroadcastIcon, BroadcastIconInline, NewsIcon, NewsIconInline, RadioIcon, RadioIconInline, TVIcon, TVIconInline } from '@icons';
import { IconProps } from 'phantom-library';

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

type MediaClassSVG = { Icon: ComponentType<IconProps>; inline: string };

const svgForMediaClass: Record<string, MediaClassSVG> = {
    newspaper: {
        inline: NewsIconInline,
        Icon: NewsIcon
    },
    broadcast: {
        inline: BroadcastIconInline,
        Icon: BroadcastIcon
    },
    radio: {
        inline: RadioIconInline,
        Icon: RadioIcon
    },
    tv: {
        inline: TVIconInline,
        Icon: TVIcon
    }
};

const getIconForMediaClass = (mediaClass: string, inline: boolean = false): string | ComponentType<IconProps> => {
    return svgForMediaClass[mediaClass][inline ? 'inline' : 'Icon'];
};

export { haversineDistance, toRadians, getIconForMediaClass };
