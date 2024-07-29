import type { FeatureCollection, GeoJsonProperties } from 'geojson';
import type { Objects, Topology } from 'topojson-specification';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Button, Callback, Recenter, ZoomIn, ZoomOut, useResponsiveContext } from 'phantom-library';
import usTopology from '@data/us_topology.json';
import style from './USMap.module.scss';

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
}

interface MapFunctions {
    setZoom: Callback<number>;
    zoomIn: Callback<void>;
    zoomOut: Callback<void>;
    center: Callback<void>;
}

const USMap: React.FC<MapProps> = ({ data, mediaData }) => {
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
            .attr('stroke', 'gray')
            .attr('data-fips', (d) => d.id!)
            .attr('data-county-name', (d) => {
                const county = data.find((e) => e.fips == (d.id as string));
                return county?.countyName || 'Unknown';
            })
            .attr('data-media-total', (d) => {
                const county = data.find((e) => e.fips == (d.id as string));
                return county?.total || 0;
            })
            .on('mouseover', function(event, d) {
                const county = data.find((e) => e.fips == (d.id as string));
                tooltip.style('display', 'block')
                    .html(`${county?.countyName || 'Unknown County'}: ${county?.total || 0}`);
            })
            .on('mousemove', function(event) {
                tooltip.style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mouseout', function() {
                tooltip.style('display', 'none');
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
            .attr('stroke', 'gray')
            .attr('stroke-width', 0.25);

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
            zoomOut
        };

        svg.call(zoom);
    }, [data, usTopology, mediaData]);

    const { windowSize } = useResponsiveContext();

    useEffect(() => {
        if (windowSize.width < 980 && ref.current) {
            // Handle responsive zoom and centering
        }
    }, [windowSize.width]);

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
