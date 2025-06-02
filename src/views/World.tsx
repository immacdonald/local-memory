import type { NullablePrimitive } from 'phantom-library';
import type { Coordinates, MediaWithDistance, WorldMedia } from '@types';
import type { ChangeEvent, FC } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FacebookIcon, LocalMemoryFullIcon, TwitterIcon, YouTubeIcon } from '@icons';
import { Button, capitalizeFirstLetter, Column, decimalPlaces, tokens, Divider, Dropdown, Flex, Heading, Row, Section, StyledLink, Typography, useResponsiveContext } from 'phantom-library';
import { useGeolocationContext } from 'src/contexts/useGeolocationContext';
import { Layout } from 'src/layouts';
import { WorldMap } from '@components/maps';
import { mediaWorld } from '@data';
import { haversineDistance, tableIcon } from '@utility';
import style from './Views.module.scss';

type CityCoordinatesPair = {
    city: string;
    latitude: number;
    longitude: number;
};

function sortCitiesByProximity(cities: WorldMedia[], currentCoords: Coordinates, maxDistance: number, limit = 500): MediaWithDistance[] {
    cities.forEach((city: MediaWithDistance) => {
        city.distance = haversineDistance(currentCoords, { latitude: city.cityCountyLat, longitude: city.cityCountyLong });
    });

    const filteredCities = cities.filter((city: MediaWithDistance) => city.distance! <= maxDistance);

    filteredCities.sort((a: MediaWithDistance, b: MediaWithDistance) => a.distance! - b.distance!);

    return filteredCities.slice(0, limit);
}

const DEFAULT_SEARCH_RADIUS = 1000;

const World: FC = () => {
    const { geolocation } = useGeolocationContext();

    const [sorted, setSorted] = useState<WorldMedia[]>([]);

    const { atBreakpoint, windowSize } = useResponsiveContext();
    const isMobile = useMemo(() => atBreakpoint('xs'), [windowSize.width]);

    const [selectedCountry, setSelectedCountry] = useState<string | null>();
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const search = useRef<{ location: Coordinates; radius: number } | null>(null);

    useEffect(() => {
        if (geolocation.location) {
            onSearch(geolocation.location, DEFAULT_SEARCH_RADIUS);
        }
    }, [geolocation.loading, geolocation.location]);

    const onSearch = (location: Coordinates, radius: number): void => {
        search.current = { location, radius };

        const sortedCities = sortCitiesByProximity(mediaWorld, location, radius);
        setSorted(sortedCities);
    };

    const updateSearch = (coordinates?: Coordinates, radius?: number, shouldUpdateCountry = true): void => {
        if (radius) {
            onSearch(search.current!.location, Math.floor(radius));
        } else if (coordinates) {
            onSearch(coordinates, search.current?.radius || DEFAULT_SEARCH_RADIUS);
            if (shouldUpdateCountry) {
                const country = findClosestCountry(coordinates);
                setSelectedCountry(country);
                if (country) {
                    setSelectedCity(findClosestCity(country, coordinates));
                } else {
                    setSelectedCity(null);
                }
            }
        }
    };

    const countries: string[] = useMemo(() => [...new Set(mediaWorld.map((data: WorldMedia) => data.country!))].sort(), [mediaWorld]);

    const findClosestCountry = (location: Coordinates): string | null => {
        let nearest = sorted;
        if (nearest.length == 0 && location) {
            nearest = sortCitiesByProximity(mediaWorld, location, DEFAULT_SEARCH_RADIUS);
        }
        if (nearest.length > 0) {
            return (nearest[0] as WorldMedia).country!;
        }

        return null;
    };

    const findClosestCity = (country: string, location?: Coordinates): string | null => {
        const coordinates = location || geolocation.location;
        let nearest = sorted;
        if (nearest.length == 0 && coordinates) {
            nearest = sortCitiesByProximity(mediaWorld, coordinates, DEFAULT_SEARCH_RADIUS);
        }
        nearest = nearest.filter((m) => m.country == country);
        if (nearest.length > 0) {
            const nearestCity = nearest[0] as WorldMedia;
            return `${nearestCity.cityCountyLat}#${nearestCity.cityCountyLong}`;
        }

        return null;
    };

    const cities: CityCoordinatesPair[] = useMemo(() => {
        if (!selectedCountry) {
            return [];
        }

        // Use a Map to ensure uniqueness based on the city name
        const uniqueCitiesMap = new Map(
            mediaWorld
                .filter((data: WorldMedia) => data.country === selectedCountry)
                .map((data: WorldMedia) => [
                    data.city!,
                    {
                        city: data.city!,
                        latitude: data.cityCountyLat,
                        longitude: data.cityCountyLong
                    }
                ])
        );

        // Convert the Map back to an array and sort
        return Array.from(uniqueCitiesMap.values()).sort((a, b) => a.city.localeCompare(b.city));
    }, [selectedCountry, mediaWorld]);

    return (
        <Layout>
            <Section>
                <Heading align="center" subheading={<LocalMemoryFullIcon inline size={isMobile ? 'small' : undefined} />} style={{ marginBottom: tokens.space.md }}>
                    Local Media Across the Globe
                </Heading>
                <Column style={{ minHeight: '500px' }} verticalAlign="start">
                    {isMobile ? (
                        <Row style={{ height: '300px', border: tokens.border.soft, borderRadius: tokens.borderRadius, padding: tokens.space.md, marginBottom: tokens.space.md }}>
                            <Typography.Text>Please use a computer or tablet to view the interactive visualization.</Typography.Text>
                        </Row>
                    ) : (
                        <WorldMap search={search.current} updateSearch={updateSearch} />
                    )}
                    <Typography.Paragraph>
                        Local Memory provides data about the geographic distribution of local news organizations across the globe. This website displays an interactive map showing a collection of{' '}
                        <i>newspapers</i>, <i>TV broadcasts</i>, and <i>radio stations</i> on a per-country level around the world. The data is sorted by proximity to your current location.
                    </Typography.Paragraph>
                </Column>
                <Divider />
                <Flex flex={{ base: 'row', xs: 'column' }} gap={tokens.space.sm}>
                    <Dropdown
                        options={countries.map((country) => ({
                            value: country,
                            label: country
                        }))}
                        defaultValue={selectedCountry}
                        onChange={(value: NullablePrimitive) => {
                            setSelectedCity(null);
                            setSelectedCountry(value as string | null);
                        }}
                    />
                    <Dropdown
                        key={selectedCountry}
                        options={cities.map((city) => ({
                            value: `${city.latitude}#${city.longitude}`,
                            label: city.city
                        }))}
                        onChange={(value: NullablePrimitive) => {
                            if (value) {
                                const coordinates = (value as string).split('#');
                                updateSearch({ latitude: parseFloat(coordinates[0]), longitude: parseFloat(coordinates[1]) }, undefined, false);
                            }
                        }}
                        defaultValue={selectedCity}
                    />
                    <input
                        type="number"
                        placeholder="Radius (miles)"
                        value={search.current?.radius || DEFAULT_SEARCH_RADIUS}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => updateSearch(undefined, parseFloat(event.target.value))}
                    />
                </Flex>
                <br />
                {sorted.length > 0 && (
                    <div>
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    {!isMobile && <th>Rank</th>}
                                    <th style={{ width: '140px' }}>Distance (mi)</th>
                                    <th style={{ width: '200px' }}>Name</th>
                                    <th style={{ width: '320px' }}>Location</th>
                                    {!isMobile && <th>Socials</th>}
                                    <th style={{ width: '240px' }}>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((organization: MediaWithDistance, index: number) => {
                                    return (
                                        <tr key={index}>
                                            {!isMobile && <td>{index + 1}.</td>}
                                            <td>{decimalPlaces(organization.distance!, 1)}</td>
                                            <td>
                                                <StyledLink to={organization.website} external>
                                                    {organization.name}
                                                </StyledLink>
                                            </td>
                                            <td>
                                                {organization['cityCountyName']}, {(organization as any).country}
                                            </td>
                                            {!isMobile && (
                                                <td>
                                                    <Row gap="0px" align="start">
                                                        {organization.twitter && <Button Icon={TwitterIcon} link={organization.twitter} variant="text" />}
                                                        {organization.facebook && <Button Icon={FacebookIcon} link={organization.facebook} variant="text" />}
                                                        {organization.video && <Button Icon={YouTubeIcon} link={organization.video} variant="text" />}
                                                    </Row>
                                                </td>
                                            )}
                                            <td>
                                                {tableIcon(organization.mediaClass!)} {capitalizeFirstLetter(organization.mediaSubclass!)}{' '}
                                                {organization.mediaClass == 'tv' ? 'TV' : capitalizeFirstLetter(organization.mediaClass!)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>
        </Layout>
    );
};

export { World };
