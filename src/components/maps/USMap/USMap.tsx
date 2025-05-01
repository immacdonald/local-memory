import type { FeatureCollection } from 'geojson';
import type { MultiCallback } from 'phantom-library';
import type { Coordinates } from '@types';
import type { MapFunctions } from '../types';
import React, { useEffect, useRef, useState } from 'react';
import { LocationPinFillInline } from '@icons';
import * as d3 from 'd3';
import { orUndefined, useNoScroll, useWindowSize } from 'phantom-library';
import * as topojson from 'topojson-client';
import { config } from '@config';
import { mediaHeatmapUS, mediaUS, topologyUS } from '@data';
import { getIconForMediaClass } from '@utility';
import { MapControls } from '../MapControls';
import { MapLegend } from '../MapLegend';
import style from './USMap.module.scss';

// Returns an <img/> using the svg as a source to display inline with D3
const inlineSVG = (path: string): string => {
    return `<img src="${path}" style="width: 20px; display: inline-block; position: relative; top: 4px"/>`;
};

interface MapProps {
    search: {
        location: Coordinates;
        radius: number;
    } | null;
    updateSearch: MultiCallback<Coordinates | undefined, number | undefined>;
}

const defaultWidth = 960;
const defaultHeight = 660;

const USMap: React.FC<MapProps> = ({ search, updateSearch = (): void => {} }) => {
    const ref = useRef<HTMLDivElement>(null);

    const windowSize = useWindowSize();

    const [width, setWidth] = useState<number>(defaultWidth);
    const [height, setHeight] = useState<number>(defaultHeight);

    const interactionMode = useRef<boolean>(true);

    const mapFunctions = useRef<MapFunctions | null>(null);

    useEffect(() => {
        // Clear old SVGs
        d3.select(ref.current).select('svg').remove();

        // Create SVG element
        const svg = d3.select(ref.current).append('svg').attr('width', '100%').attr('height', height);

        // Create groups for each layer
        const group = svg.append('g');
        const baseLayer = group.append('g').attr('class', 'base-layer');
        const interactableLayer = group.append('g').attr('class', 'interactable-layer');
        const mediaLayer = group.append('g').attr('class', 'media-layer');

        // Create a projection
        const projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);

        // Create path generator
        const pathGenerator = d3.geoPath();

        // Create color scale
        const colorScale = d3
            .scaleQuantize()
            .domain([0, 5])
            .range(config.colors as any);

        // Create tooltip
        const tooltip = d3.select('body').append('div').attr('class', style.tooltip);

        // Draw counties in the base layer
        baseLayer
            .selectAll('.county')
            .data((topojson.feature(topologyUS, topologyUS.objects.counties) as unknown as FeatureCollection).features)
            .enter()
            .append('path')
            .attr('class', 'county')
            .attr('d', pathGenerator)
            .attr('fill', (d) => {
                const county = mediaHeatmapUS.find((e) => e.fips == d.id);
                return colorScale(county?.total || 0);
            })
            .attr('stroke', config.colors[4])
            .attr('stroke-width', 0.25)
            .attr('data-fips', (d) => d.id!)
            .attr('data-county-name', (d) => {
                const county = mediaHeatmapUS.find((e) => e.fips == d.id);
                return county?.countyName || 'Unknown';
            })
            .attr('data-media-total', (d) => {
                const county = mediaHeatmapUS.find((e) => e.fips == d.id);
                return county?.total || 0;
            })
            .on('mouseover', function (_, d) {
                const county = mediaHeatmapUS.find((e) => e.fips == d.id);
                tooltip.style('display', 'block').html(`
                    <i>${`${county?.countyName || 'Unknown County'}`},</i>
                    <br>
                    <i>${`${county?.state || ''}`}</i>
                    <br>
                    <br>
                    ${
                        county?.total || 0 > 0
                            ? `
                        Total: ${county!.total}
                        <br>
                        Newspapers: ${county!.newspaper}
                        <br>
                        TV: ${county!.tv}
                        <br>
                        Broadcast: ${county!.broadcast}
                        <br>
                        Radio: ${county!.radio}
                    `
                            : 'No news organizations found'
                    }
                `);

                // Darken the county color
                const currentFill = d3.select(this).attr('fill');
                const darkerColor = d3.color(currentFill)!.darker(0.75) as unknown as string;
                d3.select(this).attr('fill', darkerColor);
            })
            .on('mousemove', function (event) {
                tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY + 10}px`);
            })
            .on('mouseout', function (_, d) {
                tooltip.style('display', 'none');

                // Restore the original county color
                const county = mediaHeatmapUS.find((e) => e.fips == (d.id as string));
                d3.select(this).attr('fill', colorScale(county?.total || 0));
            })
            .on('mousedown', function (event) {
                if (interactionMode.current) {
                    event.stopPropagation();

                    // Convert the pixel coordinates to geographic coordinates (latitude and longitude)
                    const [x, y] = d3.pointer(event);
                    const [longitude, latitude] = projection.invert!([x, y])!;

                    updateSearch({ latitude, longitude }, undefined);
                }
            });

        // Draw states in the base layer
        baseLayer
            .selectAll('.state')
            .data((topojson.feature(topologyUS, topologyUS.objects.states) as unknown as FeatureCollection).features)
            .enter()
            .append('path')
            .attr('class', 'state')
            .attr('d', pathGenerator)
            .attr('fill', 'none')
            .attr('stroke', 'black');

        // Add circles for media objects in the media layer
        mediaLayer
            .selectAll('.media')
            .data(mediaUS)
            .enter()
            .append('circle')
            .attr('class', 'media')
            .attr('cx', (d) => {
                const coords = projection([d.cityCountyLong, d.cityCountyLat]);
                return coords ? coords[0] : null;
            })
            .attr('cy', (d) => {
                const coords = projection([d.cityCountyLong, d.cityCountyLat]);
                return coords ? coords[1] : null;
            })
            .attr('r', 2)
            .attr('fill', 'gold')
            .attr('stroke', 'black')
            .attr('stroke-width', 0.25)
            .on('mouseover', function (_, d) {
                const county = mediaHeatmapUS.find((e) => e.fips == d.fips);
                tooltip.style('display', 'block').html(`
                    <b>${d.name} ${d.mediaClass && inlineSVG(getIconForMediaClass(d.mediaClass, true) as string)}</b>
                    <br>
                    <i>${`${county?.countyName || 'Unknown County'}`},</i>
                    <br>
                    <i>${`${county?.state || ''}`}</i>
                    <br>
                    <br>
                    ${
                        county?.total || 0 > 0
                            ? `
                        Total: ${county!.total}
                        <br>
                        Newspapers: ${county!.newspaper}
                        <br>
                        TV: ${county!.tv}
                        <br>
                        Broadcast: ${county!.broadcast}
                        <br>
                        Radio: ${county!.radio}
                    `
                            : 'No news organizations found'
                    }
                `);

                // Darken the county color
                const currentFill = d3.select(this).attr('fill');
                const darkerColor = d3.color(currentFill)!.darker(0.75) as unknown as string;
                d3.select(this).attr('fill', darkerColor);
            })
            .on('mousemove', function (event) {
                tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY + 10}px`);
            })
            .on('mouseout', function () {
                tooltip.style('display', 'none');

                // Restore the original media color
                d3.select(this).attr('fill', 'gold');
            })
            .on('mousedown', function (event) {
                if (interactionMode.current) {
                    event.stopPropagation();
                    // Convert the pixel coordinates to geographic coordinates (latitude and longitude)
                    const [x, y] = d3.pointer(event);
                    const [longitude, latitude] = projection.invert!([x, y])!;

                    updateSearch({ latitude, longitude }, undefined);
                }
            })
            .on('mouseup', function (event, d) {
                event.stopPropagation();
                window.open(d.website, '_blank');
            });

        // Function to add a circle at a given latitude and longitude in the interactable layer
        const addCircle = (latitude: number, longitude: number, radius = 8, color = '#ff0000'): void => {
            const coords = projection([longitude, latitude]);
            if (coords) {
                interactableLayer.append('circle').attr('cx', coords[0]).attr('cy', coords[1]).attr('r', radius).attr('fill', color).style('pointer-events', 'none');
            }
        };

        // Function to add a custom SVG at given latitude and longitude in the interactable layer
        const addSVG = (latitude: number, longitude: number, svgPath: string, width = 16, height = 16): void => {
            const coords = projection([longitude, latitude]);
            if (coords) {
                interactableLayer
                    .append('image')
                    .attr('xlink:href', svgPath)
                    .attr('x', coords[0] - width / 2)
                    .attr('y', coords[1] - height / 2)
                    .attr('width', width)
                    .attr('height', height)
                    .attr('class', 'indicator')
                    .style('pointer-events', 'none');
            }
        };

        const addGeoCircle = (latitude: number, longitude: number, distance: number, color: string): void => {
            const circumference = 3958 * Math.PI * 2;
            const initialAngle = (distance / circumference) * 360;
            let currentAngle = initialAngle;

            const centerCoords: [number, number] = projection([longitude, latitude])!;
            const circle = d3.geoCircle().center([longitude, latitude]).radius(currentAngle);
            const path = d3.geoPath().projection(projection);

            const dragBehavior = d3.drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded);

            let initialPosition = { x: 0, y: 0 };
            let initialDistanceFromCenter = 0;
            let currentPosition = { x: 0, y: 0 };

            let currentRadius = distance;

            function dragStarted(event: any) {
                initialPosition = { x: event.x, y: event.y };

                // Calculate the initial distance from the center of the circle to the mouse position
                const dx = initialPosition.x - centerCoords[0];
                const dy = initialPosition.y - centerCoords[1];
                initialDistanceFromCenter = Math.sqrt(dx * dx + dy * dy);

                /* @tslint:disable-next-line */
                currentRadius = Number(d3.select(event.target).attr('data-radius'));
            }

            function dragged(event: any) {
                currentPosition = { x: event.x, y: event.y };

                // Calculate the new distance from the center of the circle to the current mouse position
                const dx = currentPosition.x - centerCoords[0];
                const dy = currentPosition.y - centerCoords[1];
                const newDistanceFromCenter = Math.sqrt(dx * dx + dy * dy);

                // Adjust the radius by the difference between the initial and current distance
                const distanceChange = newDistanceFromCenter - initialDistanceFromCenter;
                currentRadius += distanceChange;

                // Ensure the radius does not go negative
                if (currentRadius < 0) currentRadius = 0;

                // Update the angle for the circle's radius
                currentAngle = (currentRadius / circumference) * 360;

                updateCircle();

                // Update the initial distance so that further drags adjust relative to the last position
                initialDistanceFromCenter = newDistanceFromCenter;
            }

            function dragEnded() {
                // Update the search radius or any other final actions
                updateSearch(undefined, currentRadius);
            }

            function updateCircle() {
                const updatedCircle = d3.geoCircle().center([longitude, latitude]).radius(currentAngle);
                circlePath.attr('d', path(updatedCircle()));
                circlePath.attr('data-radius', currentRadius);
            }

            const circlePath = interactableLayer
                .append('path')
                .attr('fill', color)
                .attr('d', path(circle()))
                .attr('class', 'indicator')
                .attr('data-radius', currentRadius)
                .call(dragBehavior as any)
                .style('pointer-events', 'all')
                .style('cursor', 'ew-resize')
                .lower();
        };

        const removeIndicators = () => {
            svg.selectAll('.indicator').remove();
        };

        // Add zoom functionality
        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .extent([
                [0, 0],
                [width, height]
            ])
            .scaleExtent([0.7, 8])
            .on('zoom', (event) => {
                group.attr('transform', event.transform);
            });

        const setZoom = (level: number) => {
            svg.transition().call(zoom.scaleTo, level);
        };

        const center = (instant: boolean = false) => {
            const containerWidth = ref.current?.clientWidth || width;
            const containerHeight = ref.current?.clientHeight || height;
            const bbox = group.node()!.getBBox();
            const scale = Math.min(containerWidth / bbox.width, containerHeight / bbox.height);
            const tx = containerWidth / 2 - (bbox.x + bbox.width / 2) * scale;
            const ty = containerHeight / 2 - (bbox.y + bbox.height / 2) * scale;
            const t = d3.zoomIdentity.translate(tx, ty).scale(scale);
            (instant ? svg : svg.transition().duration(750)).call(zoom.transform, t);
        };

        const zoomIn = () => {
            svg.transition().duration(500).call(zoom.scaleBy, 2);
        };

        const zoomOut = () => {
            svg.transition().duration(500).call(zoom.scaleBy, 0.5);
        };

        mapFunctions.current = {
            setZoom,
            zoomIn,
            zoomOut,
            center,
            addCircle: (latitude: number, longitude: number) => addCircle(latitude, longitude),
            addGeoCircle,
            addSVG,
            removeIndicators
        };

        svg.call(zoom);
    }, []);

    useEffect(() => {
        mapFunctions.current!.removeIndicators();
        if (search) {
            mapFunctions.current!.addSVG(search.location.latitude, search.location.longitude, LocationPinFillInline);
            mapFunctions.current!.addGeoCircle(search.location.latitude, search.location.longitude, search.radius, '#ff000040');
        }
    }, [search]);

    useEffect(() => {
        mapFunctions.current!.center(true);
    }, [mapFunctions.current, windowSize.width]);

    const [fullscreen, setFullscreen] = useState<boolean>(false);

    const noScroll = useNoScroll();

    const toggleFullscreen = () => {
        const toggled = !fullscreen;
        setFullscreen(toggled);
        noScroll(toggled);

        const newHeight = toggled ? windowSize.height : defaultHeight;
        setWidth(toggled ? windowSize.width : defaultWidth);
        setHeight(newHeight);
        d3.select(ref.current).select('svg').attr('height', newHeight);

        setTimeout(() => {
            mapFunctions.current!.center(true);
        });
    };

    const [interactionModeState, setInteractionModeState] = useState<boolean>(true);

    const toggleInteractionMode = () => {
        const mode = !interactionMode.current;
        interactionMode.current = mode;
        setInteractionModeState(mode);
    };

    return (
        <div className={style.visualization} data-fullscreen={orUndefined(fullscreen, '')}>
            <div className={style.map}>
                <div ref={ref} />
                <MapLegend minimum="0" maximum="4+" />
                {mapFunctions && (
                    <MapControls
                        mapFunctions={mapFunctions.current!}
                        interactionMode={interactionModeState}
                        toggleInteractionMode={toggleInteractionMode}
                        fullscreen={fullscreen}
                        toggleFullscreen={toggleFullscreen}
                    />
                )}
            </div>
        </div>
    );
};

export { USMap };
