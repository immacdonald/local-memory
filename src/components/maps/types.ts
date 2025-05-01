import type { Callback, MultiCallback } from 'phantom-library';

interface MapFunctions {
    setZoom: Callback<number>;
    zoomIn: Callback<void>;
    zoomOut: Callback<void>;
    center: Callback<boolean>;
    addCircle: MultiCallback<number, number>;
    addGeoCircle: MultiCallback<number, number, number, string>;
    addSVG: MultiCallback<number, number, string>;
    removeIndicators: Callback<void>;
}

export type { MapFunctions };
