import type { Media, Coordinates } from '@types';
import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FacebookIcon, LocalMemoryFullIcon, TwitterIcon, YouTubeIcon } from '@icons';
import { Button, capitalizeFirstLetter, Heading, Row, Section, decimalPlaces, Typography, FormInput, ZoomInIcon, Divider, designTokens, Column } from 'phantom-library';
import { useGeolocationContext } from 'src/contexts/useGeolocationContext';
import { Layout } from 'src/layouts';
import { USMap } from '@components/USMap';
import mediaData from '@data/media.json';
import zipcodeCoordinates from '@data/zipcode_coordinates.json';
import { getIconForMediaClass, haversineDistance } from '@utility';
import style from './Views.module.scss';

interface MediaWithDistance extends Media {
    distance?: number;
}

function sortCitiesByProximity(cities: Media[], currentCoords: Coordinates, maxDistance: number, limit = 500): MediaWithDistance[] {
    cities.forEach((city: MediaWithDistance) => {
        city.distance = haversineDistance(currentCoords, { latitude: city.cityCountyLat, longitude: city.cityCountyLong });
    });

    const filteredCities = cities.filter((city: MediaWithDistance) => city.distance! <= maxDistance);

    filteredCities.sort((a: MediaWithDistance, b: MediaWithDistance) => a.distance! - b.distance!);

    return filteredCities.slice(0, limit);
}

function findClosestZipcode(zipcodes: Record<string, Coordinates>, target: Coordinates): string {
    let closestZipcode = '';
    let minDistance = Infinity;

    for (const [zipcode, coords] of Object.entries(zipcodes)) {
        const distance = haversineDistance(target, coords);
        if (distance < minDistance) {
            minDistance = distance;
            closestZipcode = zipcode;
        }
    }

    return closestZipcode;
}

interface SearchInput {
    country: string;
    zipcode: string;
    radius: number;
}

const DEFAULT_SEARCH_RADIUS = 100;

const Home: FC = () => {
    const { geolocation } = useGeolocationContext();

    const zipcodes = zipcodeCoordinates as Record<string, Coordinates>;
    const media = mediaData as Media[];
    const [sorted, setSorted] = useState<Media[]>([]);

    const search = useRef<{ location: Coordinates; radius: number } | null>(null);

    const {
        register,
        setValue,
        formState: { errors },
        handleSubmit
    } = useForm<SearchInput>({ mode: 'onSubmit', reValidateMode: 'onSubmit' });

    const onSubmit: SubmitHandler<SearchInput> = (data) => {
        const location = data.zipcode.includes('Current Location') ? geolocation.location! : zipcodes[data.zipcode];
        if (location) {
            onSearch(location, data.radius);
        } else {
            console.warn('Zipcode not found!');
            setSorted([]);
            search.current = null;
        }
    };

    const onSearch = (location: Coordinates, radius: number): void => {
        search.current = { location, radius };

        const sortedCities = sortCitiesByProximity(media, location, radius);
        setSorted(sortedCities);
    };

    useEffect(() => {
        if (!geolocation.loading && geolocation.location) {
            const zipcode = findClosestZipcode(zipcodes, geolocation.location);
            setValue('zipcode', `Current Location (${zipcode})`);
            onSearch(geolocation.location, DEFAULT_SEARCH_RADIUS);
        }
    }, [geolocation.loading, geolocation.location]);

    const updateSearchRadius = (radius: number): void => {
        setValue('radius', decimalPlaces(radius, 0));
        onSearch(search.current!.location, radius);
    };

    const tableIcon = (mediaClass: string): ReactElement => {
        const As = getIconForMediaClass(mediaClass);
        return <As inline />;
    };

    return (
        <Layout>
            <Section>
                <Row align='space-between'>
                    <LocalMemoryFullIcon size="full" />
                    <Typography.Text soft size='lg'>US Local Media Per County</Typography.Text>
                </Row>
                <Column style={{ minHeight: '720px' }} verticalAlign='start'>
                    <USMap search={search.current} updateSearchRadius={updateSearchRadius} />
                    <Typography.Paragraph>
                        Local Memory provides data about the geographic distribution of local news organizations across the United States. This website displays an interactive map showing a collection of{' '}
                        <i>newspapers</i>, <i>TV broadcasts</i>, and <i>radio stations</i> on a per-county level. This data is sorted by proximity to your current location (or any zip code).
                    </Typography.Paragraph>
                </Column>
                <Divider />
                <form id="search" onSubmit={handleSubmit(onSubmit)}>
                    <Row gap={designTokens.space.sm}>
                        <Button type="primary" Icon={ZoomInIcon} />
                        <FormInput type="text" {...register('zipcode', { required: true })} error={errors.zipcode?.message} />
                        <FormInput type="number" {...register('radius', { required: true })} placeholder="Radius (miles)" defaultValue={DEFAULT_SEARCH_RADIUS} error={errors.radius?.message} />
                        <Button type="primary" form="search" htmlType="submit">
                            Search
                        </Button>
                    </Row>
                </form>
                <br />
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
                                                {organization['cityCountyName']}, {organization.usState}
                                            </td>
                                            <td>
                                                <Row align="start">
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
        </Layout>
    );
};

export { Home };
