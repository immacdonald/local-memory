import type { Media, Coordinates, LocationData } from '@types';
import { FC, useEffect, useRef, useState } from 'react';
import { Button, capitalizeFirstLetter, FormInput, Heading, Page, Row, Section, Text, decimalPlaces } from 'phantom-library';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FacebookIcon, LocalMemoryFullIcon, TwitterIcon, YouTubeIcon } from '@icons';
import { USMap } from '@components/USMap';
import mediaSummary from '@data/media_heatmap.json';
import mediaData from '@data/media.json';
import zipcodeCoordinates from '@data/zipcode_coordinates.json';
import { haversineDistance } from '@utility';
import style from './Home.module.scss';
import { Link } from 'react-router-dom';

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
        console.log('Set search to', location, radius);
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

    return (
        <Page title="Local Memory Project">
            <Section>
                <Heading align="center" title={<LocalMemoryFullIcon size="full" />} subtitle="US Local Media Per County" />
                <Row>
                    <USMap heatmap={mediaSummary} mediaData={mediaData as any} search={search.current} updateSearchRadius={updateSearchRadius} />
                </Row>
                <Text>
                    This website returns a collection of <i>newspapers</i> and/or <i>TV</i> and/or <i>radio stations</i> in order of proximity to a zip code for US media, or a collection of newspapers
                    for a city for Non-US media.
                </Text>
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
                        <Button context="primary" label="Search" visual="filled" form="search" type="submit" />
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
                                    <th>Name</th>
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
                                                <Link to={organization.website} target="_blank" rel="noreferrer">{organization.name}</Link>
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
