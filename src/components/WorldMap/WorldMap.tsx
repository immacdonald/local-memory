import type { FeatureCollection, GeoJsonProperties } from 'geojson';
import type { Objects, Topology } from 'topojson-specification';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Button, Callback, RecenterIcon, ZoomInIcon, ZoomOutIcon } from 'phantom-library';
import * as topojson from 'topojson-client';
import heatmap from '@data/world_heatmap.json';
import worldTopology from '@data/world_topology.json';
import { getIconForMediaClass } from '@utility';
import style from './WorldMap.module.scss';

interface MapFunctions {
    setZoom: Callback<number>;
    zoomIn: Callback<void>;
    zoomOut: Callback<void>;
    center: Callback<void>;
}

interface WorldMapProps {
    mediaData: {
        name: string;
        cityCountyLat: number;
        cityCountyLong: number;
        fips: string;
        website: string;
        mediaClass: string;
        city: string;
        country: string;
    }[];
}

const WorldMap: React.FC<WorldMapProps> = ({ mediaData }) => {
    const ref = useRef<HTMLDivElement>(null);
    const world = worldTopology as unknown as Topology<Objects<GeoJsonProperties>>;

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
        const svg = d3.select(ref.current).append('svg').attr('width', '100%').attr('height', height);

        // Create groups for each layer
        const group = svg.append('g');
        const baseLayer = group.append('g').attr('class', 'base-layer');
        //const interactableLayer = group.append('g').attr('class', 'interactable-layer');
        const mediaLayer = group.append('g').attr('class', 'media-layer');

        // Create a projection
        const projection = d3.geoNaturalEarth1().scale(200).translate([475, 300]);
        const pathGenerator = d3.geoPath().projection(projection);

        const countries = topojson.feature(world, world.objects.countries);

        const colors = ['#e3d9ff', '#bea9f8', '#9879ee', '#6e48e2', '#3700d4'];

        // Create color scale
        const colorScale = d3
            .scaleQuantize()
            .domain([0, 40])
            .range(colors as any);

        /*baseLayer.append('path')
            .attr('class', 'sphere')
            .attr('d', pathGenerator({ type: 'Sphere' }))
            //.attr('fill', '#e3d9ff');*/

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
                    const county = heatmap.find((e) => e.countryCode == d.id);
                    if (!county) {
                        console.log('No country found for', d.id, d.properties!.name);
                    }
                    return colorScale(county?.total || 0);
                }
            })
            .attr('stroke', 'white')
            .attr('stroke-width', '0.25')
            .on('mouseover', function (_, d) {
                if (d.properties!['name'] == 'United States of America') {
                    d3.select(this).attr('fill', 'grey');

                    tooltip.style('display', 'block').html(`
                        <i>${d.properties!.name}</i>
                        <br>
                        <br>
                        <span>View the main page for a detailed US media map.</span>
                    `);
                } else {
                    const county = heatmap.find((e) => e.countryCode == d.id);

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
                    const county = heatmap.find((e) => e.countryCode == d.id);
                    d3.select(this).attr('fill', colorScale(county?.total || 0));
                }
            });

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
            .attr('r', 1.5)
            .attr('fill', 'gold')
            .attr('stroke', 'black')
            .attr('stroke-width', 0.25)
            .on('mouseover', function (_, d) {
                // @ts-expect-error id doesn't play nice?
                const county = heatmap.find((e) => e.countryCode == d.id);

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
            .on('mousedown', function (_, d) {
                window.open(d.website, '_blank');
            });

        //const colors = ['#e3d9ff', '#bea9f8', '#9879ee', '#6e48e2', '#3700d4'];

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
            //svg.transition().call(zoom.scaleTo, 1);
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
            zoomOut
        };

        svg.call(zoom);
    }, []);

    useEffect(() => {
        mapFunctions.current!.center();
    }, [mapFunctions.current]);

    return (
        <div className={style.visualization}>
            <div className={style.map}>
                <div ref={ref} />
                <div className={style.tools}>
                    <Button onClick={() => mapFunctions.current!.zoomIn()} Icon={ZoomInIcon} rounded />
                    <Button onClick={() => mapFunctions.current!.zoomOut()} Icon={ZoomOutIcon} rounded />
                    <Button onClick={() => mapFunctions.current!.center()} Icon={RecenterIcon} rounded />
                </div>
            </div>
        </div>
    );
};

export { WorldMap };
