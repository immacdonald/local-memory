type BaseMedia = {
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
    wikipedia?: string;
    instagram?: string;
    youtube?: string;
};

type USMedia = BaseMedia & {
    usState: string;
    fips: string;
    stateAbbr: string;
};

type WorldMedia = BaseMedia & {
    country?: string;
    city?: string;
};

type Media = USMedia | WorldMedia;

type MediaWithDistance = Media & {
    distance?: number;
};

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
    countyName: string | null;
    state: string | null;
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

export type { Coordinates, LocationData, USMedia, WorldMedia, Media, MediaWithDistance, USHeatmapData, WorldHeatmapData };
