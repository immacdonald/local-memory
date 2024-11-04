import { Coordinates, Media } from '@types';
import { FC, ReactElement, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, LocalMemoryFullIcon, TwitterIcon, YouTubeIcon } from '@icons';
import { Button, capitalizeFirstLetter, decimalPlaces, Heading, Page, Row, Section, Typography } from 'phantom-library';
import { useGeolocationContext } from 'src/contexts/useGeolocationContext';
import { Header } from '@components/page';
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

    console.log(filteredCities);
    return filteredCities.slice(0, limit);
}

const DEFAULT_SEARCH_RADIUS = Number.MAX_SAFE_INTEGER;

const World: FC = () => {
    const { geolocation } = useGeolocationContext();

    const media = worldMediaData as unknown as Media[];
    const [sorted, setSorted] = useState<Media[]>([]);

    const onSearch = (location: Coordinates, radius: number): void => {
        //search.current = { location, radius };
        const sortedCities = sortCitiesByProximity(media, location, radius);
        setSorted(sortedCities);
    };

    useEffect(() => {
        console.log(geolocation.loading, geolocation.location);
        if (!geolocation.loading && geolocation.location) {
            onSearch(geolocation.location, DEFAULT_SEARCH_RADIUS);
        }
    }, [geolocation.loading, geolocation.location]);

    const tableIcon = (mediaClass: string): ReactElement => {
        const As = getIconForMediaClass(mediaClass);
        return <As />;
    };

    return (
        <Page
            title="Local Memory Project"
            header={<Header hasBackground inline dynamicSettings={{ enabled: true, scrollDistance: 1000, inline: false, hasBackground: true, pageSpace: 'pad' }} />}
            className={style.page}
        >
            <Section>
                <Heading align="center" subheading="Local Media Across the World">
                    <LocalMemoryFullIcon size="full" />
                </Heading>
                <Row>
                    <WorldMap mediaData={worldMediaData as any} />
                </Row>
                <Typography.Paragraph>
                    Local Memory provides data about the geographic distribution of local news organizations across the globe. This website displays an interactive map showing a collection of{' '}
                    <i>newspapers</i>, <i>TV broadcasts</i>, and <i>radio stations</i> on a per-country level around the world. The data is also sorted by proximity to your current location.
                </Typography.Paragraph>
                {sorted.length > 0 && (
                    <div>
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th style={{ width: '140px' }}>Distance (mi)</th>
                                    <th style={{ width: '200px' }}>Name</th>
                                    <th style={{ width: '320px' }}>Location</th>
                                    <th>Socials</th>
                                    <th style={{ width: '240px' }}>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((organization: MediaWithDistance, index: number) => {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}.</td>
                                            <td>{decimalPlaces(organization.distance!, 1)}</td>
                                            <td>
                                                <Link to={organization.website} target="_blank" rel="noreferrer">
                                                    {organization.name}
                                                </Link>
                                            </td>
                                            <td>
                                                {organization['cityCountyName']}, {(organization as any).country}
                                            </td>
                                            <td>
                                                <Row gap="0px" align="start">
                                                    {organization.twitter && <Button Icon={TwitterIcon} link={organization.twitter} variant="text" />}
                                                    {organization.facebook && <Button Icon={FacebookIcon} link={organization.facebook} variant="text" />}
                                                    {organization.video && <Button Icon={YouTubeIcon} link={organization.video} variant="text" />}
                                                </Row>
                                            </td>
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
        </Page>
    );
};

export { World };
