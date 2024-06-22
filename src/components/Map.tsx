import * as d3 from 'd3';
import { FeatureCollection, GeoJsonProperties } from 'geojson';
import React, { useEffect, useRef } from 'react';
import * as topojson from 'topojson-client';
import { Objects, Topology } from 'topojson-specification';
import counties from './counties.json';

interface MapProps {
    data: {
        fips: number;
        total: number;
    }[];
}

const Map: React.FC<MapProps> = ({ data }) => {
    const ref = useRef<SVGSVGElement>(null);

    const us = counties as unknown as Topology<Objects<GeoJsonProperties>>;

    const width = 950;
    const height = 650;

    useEffect(() => {
        // Clear old SVGs
        d3.select(ref.current).select('svg').remove();

        // Create SVG element
        const svg = d3.select(ref.current).append('svg').attr('width', width).attr('height', height);

        // Create path generator
        const pathGenerator = d3.geoPath();

        const colors = ['#e3d9ff', '#bea9f8', '#9879ee', '#6e48e2', '#3700d4'];
        //const colors = ['white', '#d4d4d4', '#d2b1d7', '#ea83b7', '#fa4a75', '#eb1212'];

        // Create color scale
        const colorScale = d3
            .scaleQuantize()
            .domain([0, 5])
            //@ts-expect-error as range wants numbers rather than strings
            .range(colors);

        // Draw counties
        svg.selectAll('.county')
            .data((topojson.feature(us, us.objects.counties) as unknown as FeatureCollection).features)
            .enter()
            .append('path')
            .attr('class', 'county')
            .attr('d', pathGenerator)
            .attr('fill', (d) => {
                const county = data.find((e) => e.fips === d.id);
                //console.log(county!.bachelorsOrHigher)
                return colorScale(county?.total || 0);
            })
            //.attr("fill", "none")
            .attr('stroke', 'gray')
            .attr('data-fips', (d) => d.id!)
            .attr('data-media-total', (d) => {
                const county = data.find((e) => e.fips === d.id);
                return county?.total || 0;
            });

        // Draw states
        svg.selectAll('.state')
            .data((topojson.feature(us, us.objects.states) as unknown as FeatureCollection).features)
            .enter()
            .append('path')
            .attr('class', 'state')
            .attr('d', pathGenerator)
            .attr('fill', 'none')
            .attr('stroke', 'black');
    }, [data]);

    return <svg width={width} height={height} id="map" ref={ref} />;
};

export default Map;
