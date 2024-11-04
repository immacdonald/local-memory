import type { Objects, Topology } from 'topojson-specification';
import type { USMediaData, USHeatmapData } from '@types';
import { GeoJsonProperties } from 'geojson';
import mediaHeatmapUSData from './media_heatmap.json';
import mediaUSData from './media.json';
import topologyUSData from './us_topology.json';

const mediaUS = mediaUSData as USMediaData[];
const mediaHeatmapUS = mediaHeatmapUSData as USHeatmapData[];
const topologyUS = topologyUSData as unknown as Topology<Objects<GeoJsonProperties>>;

export { mediaUS, mediaHeatmapUS, topologyUS };
