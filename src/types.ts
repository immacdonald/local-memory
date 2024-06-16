interface LocalMemoryData {
    [state: string]: StateData;
}

interface StateData {
    broadcast: Media[];
    newspaper: Media[];
    radio: Media[];
    tv: Media[];

}

interface Media {
    name: string;
    "media-class": string;
    "us-state": string
;    "city-county-lat": number;
    "city-county-long": number;
    "city-county-name": string;
    "extracted-from": string;
    "open-search": [];
    website: string;
    wikipedia: string;
    twitter: string;
    facebook: string;
    video: string;
    rss: string[];
}   