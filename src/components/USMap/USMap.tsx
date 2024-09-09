import type { FeatureCollection, GeoJsonProperties } from 'geojson';
import type { Objects, Topology } from 'topojson-specification';
import { Coordinates } from '@types';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Button, Callback, MultiCallback, RecenterIcon, ZoomInIcon, ZoomOutIcon } from 'phantom-library';
import { LocationPinFillInline } from '@icons';
import usTopology from '@data/us_topology.json';
import { getIconForMediaClass } from '@utility';
import style from './USMap.module.scss';

interface MapProps {
    heatmap: {
        fips: string;
        countyName: string;
        total: number;
        newspaper: number;
        broadcast: number;
        tv: number;
        radio: number;
    }[];
    mediaData: {
        name: string;
        cityCountyLat: number;
        cityCountyLong: number;
        fips: string;
        website: string;
        mediaClass: string;
    }[];
    search: {
        location: Coordinates;
        radius: number;
    } | null;
    updateSearchRadius: Callback<number>;
}

interface MapFunctions {
    setZoom: Callback<number>;
    zoomIn: Callback<void>;
    zoomOut: Callback<void>;
    center: Callback<void>;
    addCircle: MultiCallback<number, number>;
    addGeoCircle: MultiCallback<number, number, number>;
    addSVG: MultiCallback<number, number, string>;
    removeIndicators: Callback<void>;
}

const USMap: React.FC<MapProps> = ({ heatmap, mediaData, search, updateSearchRadius = () => {} }) => {
    const ref = useRef<SVGSVGElement>(null);
    const us = usTopology as unknown as Topology<Objects<GeoJsonProperties>>;

    const width = 950;
    const height = 650;

    const mapFunctions = useRef<MapFunctions | null>(null);

    // Returns an <img/> using the svg as a source to display inline with D3
    const inlineSVG = (path: string): string => {
        return `<img src="${path}" style="width: 20px; display: inline-block; position: relative; top: 4px"/>`;
    };

    useEffect(() => {
        // Clear old SVGs
        d3.select(ref.current).select('svg').remove();

        // Create SVG element
        const svg = d3.select(ref.current).append('svg').attr('width', width).attr('height', height);

        // Create groups for each layer
        const group = svg.append('g');
        const baseLayer = group.append('g').attr('class', 'base-layer');
        const interactableLayer = group.append('g').attr('class', 'interactable-layer');
        const mediaLayer = group.append('g').attr('class', 'media-layer');

        // Create a projection
        const projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);

        // Create path generator
        const pathGenerator = d3.geoPath();

        const colors = ['#e3d9ff', '#bea9f8', '#9879ee', '#6e48e2', '#3700d4'];

        // Create color scale
        const colorScale = d3
            .scaleQuantize()
            .domain([0, 5])
            .range(colors as any);

        // Create tooltip
        const tooltip = d3
            .select('body')
            .append('div')
            .attr('class', style.tooltip)
            .style('position', 'absolute')
            .style('min-width', '150px')
            .style('background', 'white')
            .style('border', '1px solid gray')
            .style('padding', '5px')
            .style('display', 'none');

        // Draw counties in the base layer
        baseLayer
            .selectAll('.county')
            .data((topojson.feature(us, us.objects.counties) as unknown as FeatureCollection).features)
            .enter()
            .append('path')
            .attr('class', 'county')
            .attr('d', pathGenerator)
            .attr('fill', (d) => {
                const county = heatmap.find((e) => e.fips == d.id);
                return colorScale(county?.total || 0);
            })
            .attr('stroke', colors[4])
            .attr('stroke-width', 0.25)
            .attr('data-fips', (d) => d.id!)
            .attr('data-county-name', (d) => {
                const county = heatmap.find((e) => e.fips == d.id);
                return county?.countyName || 'Unknown';
            })
            .attr('data-media-total', (d) => {
                const county = heatmap.find((e) => e.fips == d.id);
                return county?.total || 0;
            })
            .on('mouseover', function (_, d) {
                const county = heatmap.find((e) => e.fips == d.id);
                tooltip.style('display', 'block').html(`
                    <i>${`${county?.countyName || 'Unknown County'}`}</i>
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
            .on('mouseout', function (_, d) {
                tooltip.style('display', 'none');

                // Restore the original county color
                const county = heatmap.find((e) => e.fips == (d.id as string));
                d3.select(this).attr('fill', colorScale(county?.total || 0));
            });

        // Draw states in the base layer
        baseLayer
            .selectAll('.state')
            .data((topojson.feature(us, us.objects.states) as unknown as FeatureCollection).features)
            .enter()
            .append('path')
            .attr('class', 'state')
            .attr('d', pathGenerator)
            .attr('fill', 'none')
            .attr('stroke', 'black');

        // Add circles for media objects in the media layer
        mediaLayer
            .selectAll('.media')
            .data(mediaData)
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
                const county = heatmap.find((e) => e.fips == d.fips);
                tooltip.style('display', 'block').html(`
                    <b>${d.name} ${d.mediaClass && inlineSVG(getIconForMediaClass(d.mediaClass, true) as string)}</b>
                    <br>
                    <i>${`${county?.countyName || 'Unknown County'}`}</i>
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
            .on('mousedown', function (_, d) {
                window.open(d.website, '_blank');
            });

        // Function to add a circle at a given latitude and longitude in the interactable layer
        const addCircle = (latitude: number, longitude: number, radius = 8, color = '#ff0000') => {
            const coords = projection([longitude, latitude]);
            if (coords) {
                interactableLayer.append('circle').attr('cx', coords[0]).attr('cy', coords[1]).attr('r', radius).attr('fill', color).style('pointer-events', 'none');
            }
        };

        // Function to add a custom SVG at given latitude and longitude in the interactable layer
        const addCustomSVG = (latitude: number, longitude: number, svgPath: string, width = 16, height = 16) => {
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

        const addGeoCircle = (latitude: number, longitude: number, distance: number, color: string) => {
            const circumference = 3958 * Math.PI * 2;
            const initialAngle = (distance / circumference) * 360;
            let currentAngle = initialAngle;

            const circle = d3.geoCircle().center([longitude, latitude]).radius(currentAngle);
            const path = d3.geoPath().projection(projection);

            const dragBehavior = d3.drag().on('start', dragStarted).on('drag', dragged).on('end', dragEnded);

            let initialPosition = { x: 0, y: 0 };
            let currentPosition = { x: 0, y: 0 };

            let currentRadius = distance;

            function dragStarted(event: any) {
                initialPosition = { x: event.x, y: event.y };
                currentPosition = { x: event.x, y: event.y };
                /* @tslint:disable-next-line */
                currentRadius = Number(d3.select(event.target).attr('data-radius'));
            }

            function dragged(event: any) {
                currentPosition = { x: event.x, y: event.y };

                const dx = currentPosition.x - initialPosition.x;
                const dy = currentPosition.y - initialPosition.y;

                // Calculate the distance dragged
                const distanceDragged = Math.sqrt(dx * dx + dy * dy);

                // Determine direction of drag
                const direction = dx + dy > 0 ? 1 : -1;

                // Update the circle's radius based on the drag distance and direction
                currentRadius = currentRadius + direction * (distanceDragged / 10); // Adjust divisor to change sensitivity
                currentAngle = (currentRadius / circumference) * 360;

                // Ensure the radius does not go negative
                if (currentAngle < 0) currentAngle = 0;

                updateCircle();
            }

            function dragEnded() {
                //console.log('Drag ended');
                updateSearchRadius(currentRadius);
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
            .scaleExtent([1, 8])
            .on('zoom', (event) => {
                group.attr('transform', event.transform);
            });

        const setZoom = (level: number) => {
            svg.transition().call(zoom.scaleTo, level);
        };

        const center = () => {
            console.log(width, height);
            svg.transition().call(zoom.translateTo, 0.5 * width, 0.5 * height);
        };

        const zoomIn = () => {
            svg.transition().call(zoom.scaleBy, 2);
        };

        const zoomOut = () => {
            svg.transition().call(zoom.scaleBy, 0.5);
        };

        mapFunctions.current = {
            setZoom,
            center,
            zoomIn,
            zoomOut,
            addCircle: (latitude: number, longitude: number) => addCircle(latitude, longitude),
            addGeoCircle: (latitude: number, longitude: number, distance: number) => addGeoCircle(latitude, longitude, distance, '#ff000040'),
            addSVG: (latitude: number, longitude: number, svgPath: string) => addCustomSVG(latitude, longitude, svgPath),
            removeIndicators
        };

        svg.call(zoom);
    }, [heatmap, usTopology, mediaData]);

    useEffect(() => {
        mapFunctions.current!.removeIndicators();
        if (search) {
            mapFunctions.current!.addSVG(search.location.latitude, search.location.longitude, LocationPinFillInline);
            mapFunctions.current!.addGeoCircle(search.location.latitude, search.location.longitude, search.radius);
        }
    }, [search]);

    return (
        <div className={style.map}>
            <svg width={width} height={height} ref={ref} />
            <div className={style.tools}>
                <Button onClick={() => mapFunctions.current!.zoomIn()} Icon={ZoomInIcon} rounded />
                <Button onClick={() => mapFunctions.current!.zoomOut()} Icon={ZoomOutIcon} rounded />
                <Button onClick={() => mapFunctions.current!.center()} Icon={RecenterIcon} rounded />
            </div>
        </div>
    );
};

export { USMap };
