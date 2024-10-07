import type { FeatureCollection, GeoJsonProperties } from 'geojson';
import type { Objects, Topology } from 'topojson-specification';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Button, Callback, RecenterIcon, ZoomInIcon, ZoomOutIcon } from 'phantom-library';
import worldTopology from '@data/world_topology.json';
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
            .attr('fill', '#3700d4')
            .attr('stroke', 'white')
            .attr('stroke-width', '0.25')
            .on('mouseover', function (_, d) {
                tooltip.style('display', 'block').html(`
                    <b>${d.properties!['name']}</b>
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
                d3.select(this).attr('fill', '#3700d4');
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
            .attr('r', 2)
            .attr('fill', 'gold')
            .attr('stroke', 'black')
            .attr('stroke-width', 0.25)
            .on('mouseover', function (_, d) {
                tooltip.style('display', 'block').html(`
                    <b>${d.name} ${d.mediaClass}</b>
                    <br/>
                    <i>${d.city}, ${d.country}</i>
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
