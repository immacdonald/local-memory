import type { GeoJsonProperties } from 'geojson';
import type { Objects, Topology } from 'topojson-specification';
import type { USHeatmapData, Coordinates, WorldHeatmapData, WorldMedia, USMedia } from '@types';
import mediaHeatmapUSData from './media_heatmap.json';
import mediaUSData from './media.json';
import topologyUSData from './us_topology.json';
import mediaHeatmapWorldData from './world_heatmap.json';
import mediaWorldData from './world_media.json';
import topologyWorldData from './world_topology.json';
import zipcodeData from './zipcode_coordinates.json';

const mediaUS = (mediaUSData as USMedia[]).filter((data) => data.fips !== null);
const mediaHeatmapUS = mediaHeatmapUSData as USHeatmapData[];
const topologyUS = topologyUSData as unknown as Topology<Objects<GeoJsonProperties>>;
const zipcodeMap = zipcodeData as Record<string, Coordinates>;

const mediaWorld = mediaWorldData as WorldMedia[];
const topologyWorld = topologyWorldData as unknown as Topology<Objects<GeoJsonProperties>>;
const mediaHeatmapWorld = mediaHeatmapWorldData as WorldHeatmapData[];

export { mediaUS, mediaHeatmapUS, mediaWorld, mediaHeatmapWorld, topologyUS, topologyWorld, zipcodeMap };
