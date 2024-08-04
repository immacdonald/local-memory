import type { FeatureCollection, GeoJsonProperties } from 'geojson';
import type { Objects, Topology } from 'topojson-specification';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Button, Callback, MultiCallback, Recenter, ZoomIn, ZoomOut, useResponsiveContext } from 'phantom-library';
import usTopology from '@data/us_topology.json';
import style from './USMap.module.scss';
import countyData from '@data/fips.json';
import { Coordinates } from '@types';

import { LocationPinFillInline } from '@icons';

interface MapProps {
    data: {
        fips: string;
        countyName: string;
        total: number;
    }[];
    mediaData: {
        cityCountyLat: number;
        cityCountyLong: number;
    }[];
    search: {
        location: Coordinates;
        radius: number;
    } | null;
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

const USMap: React.FC<MapProps> = ({ data, mediaData, search }) => {
    const ref = useRef<SVGSVGElement>(null);
    const us = usTopology as unknown as Topology<Objects<GeoJsonProperties>>;

    const width = 950;
    const height = 650;

    const mapFunctions = useRef<MapFunctions | null>(null);

    useEffect(() => {
        // Clear old SVGs
        d3.select(ref.current).select('svg').remove();

        // Create SVG element
        const svg = d3.select(ref.current).append('svg').attr('width', width).attr('height', height);

        // Create a group for zoomable content
        const g = svg.append('g');

        // Create a projection
        const projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);

        // Create path generator
        const pathGenerator = d3.geoPath();

        const colors = ['#e3d9ff', '#bea9f8', '#9879ee', '#6e48e2', '#3700d4'];

        const flatCounties = Object.values(countyData).flat();

        // Create color scale
        const colorScale = d3
            .scaleQuantize()
            .domain([0, 5])
            //@ts-expect-error as range wants numbers rather than strings
            .range(colors);

        // Create tooltip
        const tooltip = d3.select('body').append('div')
            .attr('class', style.tooltip)
            .style('position', 'absolute')
            .style('background', 'white')
            .style('border', '1px solid gray')
            .style('padding', '5px')
            .style('display', 'none');

        // Draw counties
        g.selectAll('.county')
            .data((topojson.feature(us, us.objects.counties) as unknown as FeatureCollection).features)
            .enter()
            .append('path')
            .attr('class', 'county')
            .attr('d', pathGenerator)
            .attr('fill', (d) => {
                const county = data.find((e) => e.fips == (d.id as string));
                return colorScale(county?.total || 0);
                //return 'white';
            })
            .attr('stroke', colors[4])
            .attr('stroke-width', 0.25)
            .attr('data-fips', (d) => d.id!)
            .attr('data-county-name', (d) => {
                const county = flatCounties.find((e) => e.fips == d.id);
                return county?.name || 'Unknown';
            })
            .attr('data-media-total', (d) => {
                const county = data.find((e) => e.fips == (d.id as string));
                return county?.total || 0;
            })
            .on('mouseover', function (event, d) {
                const county = data.find((e) => e.fips == (d.id as string));
                const countyData = flatCounties.find((e) => e.fips == d.id);
                tooltip.style('display', 'block')
                    .html(`${countyData?.name || 'Unknown County'}: ${county?.total || 0}`);

                // Darken the county color
                const currentFill = d3.select(this).attr('fill');
                const darkerColor = d3.color(currentFill)!.darker(0.75);
                d3.select(this).attr('fill', darkerColor as any);
            })
            .on('mousemove', function (event) {
                tooltip.style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mouseout', function (event, d) {
                tooltip.style('display', 'none');

                // Restore the original county color
                const county = data.find((e) => e.fips == (d.id as string));
                d3.select(this).attr('fill', colorScale(county?.total || 0));
            });

        // Draw states
        g.selectAll('.state')
            .data((topojson.feature(us, us.objects.states) as unknown as FeatureCollection).features)
            .enter()
            .append('path')
            .attr('class', 'state')
            .attr('d', pathGenerator)
            .attr('fill', 'none')
            .attr('stroke', 'black');

        // Add circles for media objects
        g.selectAll('.media')
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
            .attr('stroke-width', 0.25);
        //.style('pointer-events', 'none');

        // Function to add a circle at a given latitude and longitude
        const addCircle = (latitude: number, longitude: number, radius = 8, color = '#ff0000') => {
            const coords = projection([longitude, latitude]);
            if (coords) {
                g.append('circle')
                    .attr('cx', coords[0])
                    .attr('cy', coords[1])
                    .attr('r', radius)
                    .attr('fill', color)
                    .style('pointer-events', 'none');
            }
        };

        // Function to add a custom SVG at given latitude and longitude
        const addCustomSVG = (latitude: number, longitude: number, svgPath: string, width = 16, height = 16) => {
            const coords = projection([longitude, latitude]);
            if (coords) {
                g.append('image')
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
            const angle = distance / circumference * 360;
            const circle = d3.geoCircle().center([longitude, latitude]).radius(angle);
            const path = d3.geoPath().projection(projection)

            g.append('path')
                .attr('fill', color)
                .attr('d', path(circle()))
                .attr('class', 'indicator')
                .style('pointer-events', 'none');
        }

        const removeIndicators = () => {
            svg.selectAll(".indicator").remove()
        }

        // Add zoom functionality
        const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 8])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        const setZoom = (level: number) => {
            svg.transition().call(zoom.scaleTo, level);
        };

        const center = () => {
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
        }

        svg.call(zoom);
    }, [data, usTopology, mediaData]);

    const { windowSize } = useResponsiveContext();

    useEffect(() => {
        if (windowSize.width < 980 && ref.current) {
            // Handle responsive zoom and centering
        }
    }, [windowSize.width]);

    useEffect(() => {
        mapFunctions.current!.removeIndicators();
        if (search) {
            mapFunctions.current!.addSVG(search.location.latitude, search.location.longitude, LocationPinFillInline);
            mapFunctions.current!.addGeoCircle(search.location.latitude, search.location.longitude, search.radius)
        }
    }, [search]);

    return (
        <div className={style.map}>
            <svg width={width} height={height} ref={ref} />
            <div className={style.tools}>
                <Button onClick={() => mapFunctions.current!.zoomIn()} Icon={ZoomIn} rounded />
                <Button onClick={() => mapFunctions.current!.zoomOut()} Icon={ZoomOut} rounded />
                <Button onClick={() => mapFunctions.current!.center()} Icon={Recenter} rounded />
            </div>
        </div>
    );
}

export { USMap };
