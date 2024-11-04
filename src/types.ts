interface Media {
    video?: string;
    twitter: string;
    mediaClass: string;
    //extractedFrom: string;
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
    fips: string;
    stateAbbr: string;
    country?: string;
    city?: string;
}

interface LocationData {
    loading: boolean;
    location: Coordinates | null;
    zipcode: string | null;
}

type Coordinates = {
    latitude: number;
    longitude: number;
};

interface USHeatmapData {
    countyName: string;
    fips: string;
    total: number;
    newspaper: number;
    broadcast: number;
    tv: number;
    radio: number;
}

interface WorldHeatmapData {
    countryName: string;
    countryCode: number;
    newspaper: number;
    broadcast: number;
    radio: number;
    tv: number;
    total: number;
}

export type { Coordinates, LocationData, Media, USHeatmapData, WorldHeatmapData };
