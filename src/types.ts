interface Media {
    video?: string;
    twitter: string;
    mediaClass: string;
    extractedFrom: string;
    cityCountyLong: number;
    mediaSubclass?: string;
    website: string;
    facebook?: string;
    cityCountyLat: number;
    name: string;
    openSearch?: unknown[];
    cityCountyName: string;
    rss?: string[];
    usState: string;
    wikipedia?: string;
    instagram?: string;
    youtube?: string;
    fips: number;
    stateAbbr: string;
    mediaType: string;
}

interface LocationData {
    loading: boolean;
    location: Coordinates | null;
}

type Coordinates = {
    latitude: number;
    longitude: number;
};

export type { Coordinates, LocationData, Media };
