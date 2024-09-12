import type { Media, Coordinates, LocationData } from '@types';
import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import { Button, capitalizeFirstLetter, FormInput, Heading, Page, Row, Section, decimalPlaces, Typography } from 'phantom-library';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { FacebookIcon, LocalMemoryFullIcon, TwitterIcon, YouTubeIcon } from '@icons';
import { USMap } from '@components/USMap';
import { Header } from '@components/page';
import mediaSummary from '@data/media_heatmap.json';
import mediaData from '@data/media.json';
import zipcodeCoordinates from '@data/zipcode_coordinates.json';
import { getIconForMediaClass, haversineDistance } from '@utility';
import style from './Home.module.scss';

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

interface HomeProps {
    geolocation: LocationData;
}

interface SearchInput {
    country: string;
    zipcode: string;
    radius: number;
}

const DEFAULT_SEARCH_RADIUS = 100;

const Home: FC<HomeProps> = ({ geolocation }) => {
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
        return <As />;
    };

    return (
        <Page title="Local Memory Project" header={<Header hasBackground inline dynamicSettings={{ enabled: true, scrollDistance: 1000, inline: false, hasBackground: true, pageSpace: 'pad'}}/>} className={style.page}>
            <Section>
                <Heading align="center" subtitle="US Local Media Per County"><LocalMemoryFullIcon size="full" /></Heading>
                <Row>
                    <USMap heatmap={mediaSummary} mediaData={mediaData as any} search={search.current} updateSearchRadius={updateSearchRadius} />
                </Row>
                <Typography.Paragraph>
                    Local Memory provides data about the geographic distribution of local news organizations across the United States. This website displays an interactive map showing a collection of{' '}
                    <i>newspapers</i>, <i>TV broadcasts</i>, and <i>radio stations</i> on a per-county level. This data is also sorted by proximity to your location (or any zip code).
                </Typography.Paragraph>
                <hr/>
                <form id="search" onSubmit={handleSubmit(onSubmit)}>
                    <Row verticalAlign="start">
                        <FormInput name="zipcode" type="text" placeholder="Zip Code" register={register} validationSchema={{ required: true }} error={errors.zipcode} />
                        <FormInput
                            name="radius"
                            type="number"
                            placeholder="Radius (miles)"
                            defaultValue={DEFAULT_SEARCH_RADIUS}
                            register={register}
                            validationSchema={{ required: true }}
                            error={errors.radius}
                        />
                        <Button context="primary" visual="filled" form="search" type="submit">Search</Button>
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
                                                <Row gap="0px" align="start">
                                                    {organization.twitter && <Button Icon={TwitterIcon} link={organization.twitter} visual="text" />}
                                                    {organization.facebook && <Button Icon={FacebookIcon} link={organization.facebook} visual="text" />}
                                                    {organization.video && <Button Icon={YouTubeIcon} link={organization.video} visual="text" />}
                                                </Row>
                                            </td>
                                            <td>
                                                {tableIcon(organization.mediaClass!)}{' '}
                                                {capitalizeFirstLetter(organization.mediaSubclass!)} {organization.mediaClass == 'tv' ? 'TV' : capitalizeFirstLetter(organization.mediaClass!)}
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

export { Home };
