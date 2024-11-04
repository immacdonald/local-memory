import { Coordinates, Media } from '@types';
import { FC, ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { FacebookIcon, LocalMemoryFullIcon, TwitterIcon, YouTubeIcon } from '@icons';
import { Button, capitalizeFirstLetter, Column, decimalPlaces, designTokens, Divider, Heading, Row, Section, StyledLink, Typography, useResponsiveContext } from 'phantom-library';
import { useGeolocationContext } from 'src/contexts/useGeolocationContext';
import { Layout } from 'src/layouts';
import { WorldMap } from '@components/WorldMap';
import worldMediaData from '@data/world_media.json';
import { getIconForMediaClass, haversineDistance } from '@utility';
import style from './Views.module.scss';

interface MediaWithDistance extends Media {
    distance?: number;
}

function sortCitiesByProximity(cities: Media[], currentCoords: Coordinates, maxDistance: number, limit = 100): MediaWithDistance[] {
    cities.forEach((city: MediaWithDistance) => {
        city.distance = haversineDistance(currentCoords, { latitude: city.cityCountyLat, longitude: city.cityCountyLong });
    });

    const filteredCities = cities.filter((city: MediaWithDistance) => city.distance! <= maxDistance);

    filteredCities.sort((a: MediaWithDistance, b: MediaWithDistance) => a.distance! - b.distance!);

    return filteredCities.slice(0, limit);
}

const DEFAULT_SEARCH_RADIUS = Number.MAX_SAFE_INTEGER;

const World: FC = () => {
    const { geolocation } = useGeolocationContext();

    const media = worldMediaData as unknown as Media[];
    const [sorted, setSorted] = useState<Media[]>([]);

    const { atBreakpoint, windowSize } = useResponsiveContext();
    const isMobile = useMemo(() => atBreakpoint('xs'), [windowSize.width]);

    useEffect(() => {
        if (geolocation.location) {
            onSearch(geolocation.location, DEFAULT_SEARCH_RADIUS);
        }
    }, [geolocation.loading, geolocation.location]);

    const tableIcon = (mediaClass: string): ReactElement => {
        const As = getIconForMediaClass(mediaClass);
        return <As />;
    };

    const search = useRef<{ location: Coordinates; radius: number } | null>(null);

    const onSearch = (location: Coordinates, radius: number): void => {
        search.current = { location, radius };

        const sortedCities = sortCitiesByProximity(media, location, radius);
        setSorted(sortedCities);
    };

    const updateSearch = (coordinates: Coordinates | undefined, radius: number | undefined): void => {
        if (radius) {
            onSearch(search.current!.location, radius);
        } else if (coordinates) {
            onSearch(coordinates, search.current!.radius);
        }
    };

    return (
        <Layout>
            <Section>
                <Heading align="center" subheading={<LocalMemoryFullIcon inline size={isMobile ? 'small' : undefined} />}>
                    Local Media Across the Globe
                </Heading>
                <Column style={{ minHeight: '500px' }} verticalAlign="start">
                    {isMobile ? (
                        <Row
                            style={{ height: '300px', border: designTokens.border.light, borderRadius: designTokens.borderRadius, padding: designTokens.space.md, marginBottom: designTokens.space.md }}
                        >
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
