import type { FeatureCollection } from 'geojson';
import { Coordinates } from '@types';
import { FC, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FullscreenExitIcon, FullscreenIcon, LocationPinFillInline, SwipeIcon, TouchIcon } from '@icons';
import * as d3 from 'd3';
import { Button, Callback, MultiCallback, orUndefined, RecenterIcon, useNoScroll, useWindowSize, ZoomInIcon, ZoomOutIcon } from 'phantom-library';
import * as topojson from 'topojson-client';
import { mediaHeatmapWorld, mediaWorld, topologyWorld } from '@data';
import { getIconForMediaClass } from '@utility';
import { WorldMapLegend } from './WorldMapLegend';
import style from './WorldMap.module.scss';

interface MapFunctions {
    setZoom: Callback<number>;
    zoomIn: Callback<void>;
    zoomOut: Callback<void>;
    center: Callback<void>;
    addCircle: MultiCallback<number, number>;
    addGeoCircle: MultiCallback<number, number, number, string>;
    addSVG: MultiCallback<number, number, string>;
    removeIndicators: Callback<void>;
}

interface MapProps {
    search: {
        location: Coordinates;
        radius: number;
    } | null;
    updateSearch: MultiCallback<Coordinates | undefined, number | undefined>;
}

const defaultWidth = 960;
const defaultHeight = 660;

const WorldMap: FC<MapProps> = ({ search, updateSearch = (): void => {} }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [width, setWidth] = useState<number>(defaultWidth);
    const [height, setHeight] = useState<number>(defaultHeight);

    const mapFunctions = useRef<MapFunctions | null>(null);

    const navigate = useNavigate();

    // Returns an <img/> using the svg as a source to display inline with D3
    const inlineSVG = (path: string): string => {
        return `<img src="${path}" style="width: 20px; display: inline-block; position: relative; top: 4px"/>`;
    };

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
        const projection = d3.geoNaturalEarth1().scale(200).translate([475, 300]);
        const pathGenerator = d3.geoPath().projection(projection);

        const countries = topojson.feature(topologyWorld, topologyWorld.objects.countries);

        const colors = ['#e3d9ff', '#bea9f8', '#9879ee', '#6e48e2', '#3700d4'];

        // Create color scale
        const colorScale = d3
            .scaleQuantize()
            .domain([0, 40])
            .range(colors as any);

        // Create tooltip
        const tooltip = d3.select('body').append('div').attr('class', style.tooltip);

        baseLayer
            .selectAll('path')
            .data((countries as unknown as FeatureCollection).features)
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('d', pathGenerator)
            .attr('data-country', (d) => d.properties!['name'])
            .attr('data-country-id', (d) => d.id!)
            .attr('fill', (d) => {
                if (d.properties!['name'] == 'United States of America') {
                    return `grey`;
                } else {
                    const county = mediaHeatmapWorld.find((e) => e.countryCode == d.id);
                    if (!county) {
                        //console.log('No country found for', d.id, d.properties!.name);
                    }
                    return colorScale(county?.total || 0);
                }
            })
            .attr('stroke', 'white')
            .attr('stroke-width', '0.25')
            .on('mouseover', function (_, d) {
                if (d.properties!['name'] != 'United States of America') {
                    const county = mediaHeatmapWorld.find((e) => e.countryCode == d.id);

                    tooltip.style('display', 'block').html(`
                    <i>${d.properties!.name}</i>
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
                }

                // Darken the county color
                const currentFill = d3.select(this).attr('fill');
                const darkerColor = d3.color(currentFill)!.darker(0.75);
                d3.select(this).attr('fill', darkerColor as any);
            })
            .on('mousemove', function (event) {
                tooltip.style('left', `${event.pageX + 10}px`).style('top', `${event.pageY + 10}px`);
            })
            .on('mouseout', function (_, d) {
                tooltip.style('display', 'none');
                if (d.properties!['name'] == 'United States of America') {
                    d3.select(this).attr('fill', 'grey');
                } else {
                    const county = mediaHeatmapWorld.find((e) => e.countryCode == d.id);
                    d3.select(this).attr('fill', colorScale(county?.total || 0));
                }
            })
            .on('mousedown', function (event, d) {
                if (d.properties!['name'] == 'United States of America') {
                    event.stopPropagation();
                    navigate('/');
                } else if (interactionMode.current) {
                    event.stopPropagation();
                    // Convert the pixel coordinates to geographic coordinates (latitude and longitude)
                    const [x, y] = d3.pointer(event);
                    const [longitude, latitude] = projection.invert!([x, y])!;

                    updateSearch({ latitude, longitude }, undefined);
                }
            });

        // Add circles for media objects in the media layer
        mediaLayer
            .selectAll('.media')
            .data(mediaWorld)
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
            .attr('r', 1.5)
            .attr('fill', 'gold')
            .attr('stroke', 'black')
            .attr('stroke-width', 0.25)
            .on('mouseover', function (_, d) {
                // @ts-expect-error id doesn't play nice?
                const county = mediaHeatmapWorld.find((e) => e.countryCode == d.id);

                tooltip.style('display', 'block').html(`
                    <b>${d.name} ${d.mediaClass && inlineSVG(getIconForMediaClass(d.mediaClass, true) as string)}</b>
                    <br>
                    <i>${d.city}, ${d.country}</i>
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
                const darkerColor = d3.color(currentFill)!.darker(0.75);
                d3.select(this).attr('fill', darkerColor as any);
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

        const center = () => {
            const containerWidth = ref.current?.clientWidth || width;
            const containerHeight = ref.current?.clientHeight || height;

            // Calculate bounding box of the map elements
            const bbox = group.node()!.getBBox();

            // Calculate offsets for centering the bounding box within the container
            const offsetX = containerWidth / 2 - (bbox.x + bbox.width / 2);
            const offsetY = containerHeight / 2 - (bbox.y + bbox.height / 2);

            // Apply centering translation
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity.translate(offsetX, offsetY).scale(1));
        };

        const zoomIn = () => {
            svg.transition().duration(500).call(zoom.scaleBy, 2);
        };

        const zoomOut = () => {
            svg.transition().duration(500).call(zoom.scaleBy, 0.5);
        };

        mapFunctions.current = {
            setZoom,
            center,
            zoomIn,
            zoomOut,
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
        mapFunctions.current!.center();
    }, [mapFunctions.current]);

    const [fullscreen, setFullscreen] = useState<boolean>(false);

    const noScroll = useNoScroll();
    const windowSize = useWindowSize();

    const toggleFullscreen = () => {
        const toggled = !fullscreen;
        setFullscreen(toggled);
        noScroll(toggled);

        const newHeight = toggled ? windowSize.height : defaultHeight;
        setWidth(toggled ? windowSize.width : defaultWidth);
        setHeight(newHeight);
        d3.select(ref.current).select('svg').attr('height', newHeight);

        setTimeout(() => {
            mapFunctions.current!.center();
        });
    };

    const interactionMode = useRef<boolean>(true);
    const [interactionModeInteral, setInteractionModeInternal] = useState<boolean>(true);

    const toggleInteractionMode = () => {
        const mode = !interactionMode.current;
        interactionMode.current = mode;
        setInteractionModeInternal(mode);
    };

    return (
        <div className={style.visualization} data-fullscreen={orUndefined(fullscreen, '')}>
            <div className={style.map}>
                <div ref={ref} />
                <div className={style.tools}>
                    <Button
                        onClick={() => toggleInteractionMode()}
                        Icon={interactionModeInteral ? TouchIcon : SwipeIcon}
                        data-tooltip={interactionModeInteral ? 'Interact to change search location' : 'Interact to pan/zoom'}
                    />
                    <Button onClick={() => mapFunctions.current!.zoomIn()} Icon={ZoomInIcon} rounded data-tooltip="Zoom in" />
                    <Button onClick={() => mapFunctions.current!.zoomOut()} Icon={ZoomOutIcon} rounded data-tooltip="Zoom out" />
                    <Button onClick={() => mapFunctions.current!.center()} Icon={RecenterIcon} rounded data-tooltip="Recenter" />
                    <Button onClick={() => toggleFullscreen()} Icon={fullscreen ? FullscreenExitIcon : FullscreenIcon} rounded />
                </div>
                <WorldMapLegend />
            </div>
        </div>
    );
};

export { WorldMap };
