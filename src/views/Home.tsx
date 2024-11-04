import type { Media, Coordinates } from '@types';
import { FC, ReactElement, useEffect, useRef, useState, KeyboardEvent } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FacebookIcon, LocalMemoryFullIcon, LocationPinIcon, TwitterIcon, YouTubeIcon } from '@icons';
import { Button, capitalizeFirstLetter, Row, Section, decimalPlaces, Typography, FormInput, Divider, designTokens, Column, Heading, StyledLink } from 'phantom-library';
import { useGeolocationContext } from 'src/contexts/useGeolocationContext';
import { Layout } from 'src/layouts';
import { USMap } from '@components/USMap';
import { zipcodeMap } from '@data';
import mediaData from '@data/media.json';
import { findClosestZipcode, getIconForMediaClass, haversineDistance } from '@utility';
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

interface SearchInput {
    country: string;
    zipcode: string;
    radius: number;
}

const DEFAULT_SEARCH_RADIUS = 100;

const Home: FC = () => {
    const { geolocation } = useGeolocationContext();

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
        const location = data.zipcode.includes('Current Location') ? geolocation.location! : zipcodeMap[data.zipcode];
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
        if (geolocation.location && geolocation.zipcode) {
            setValue('zipcode', `Current Location (${geolocation.zipcode})`);
            onSearch(geolocation.location, DEFAULT_SEARCH_RADIUS);
        }
    }, [geolocation.loading, geolocation.location]);

    const updateSearch = (coordinates: Coordinates | undefined, radius: number | undefined): void => {
        if (radius) {
            setValue('radius', decimalPlaces(radius, 0));
            onSearch(search.current!.location, radius);
        } else if (coordinates) {
            setValue('zipcode', findClosestZipcode(coordinates));
            onSearch(coordinates, search.current!.radius);
        }
    };

    const tableIcon = (mediaClass: string): ReactElement => {
        const As = getIconForMediaClass(mediaClass);
        return <As inline />;
    };

    const handleFullDelete = (event: KeyboardEvent<HTMLInputElement>) => {
        // Check if the key pressed is backspace or delete
        if (event.key === 'Backspace' || event.key === 'Delete') {
            (event.target as HTMLInputElement).value = '';
        }
    };

    return (
        <Layout>
            <Section>
                <Heading align="center" subheading={<LocalMemoryFullIcon inline />}>
                    US Local Media by County
                </Heading>
                <Column style={{ minHeight: '720px' }} verticalAlign="start">
                    <USMap search={search.current} updateSearch={updateSearch} />
                    <Typography.Paragraph>
                        Local Memory provides data about the geographic distribution of local news organizations across the United States. This website displays an interactive map showing a collection
                        of <i>newspapers</i>, <i>TV broadcasts</i>, and <i>radio stations</i> on a per-county level. This data is sorted by proximity to your current location (or any zip code).
                    </Typography.Paragraph>
                </Column>
                <Divider />
                <form id="search" onSubmit={handleSubmit(onSubmit)}>
                    <Row gap={designTokens.space.sm}>
                        <div className={style.currentLocationSearch}>
                            <FormInput type="text" {...register('zipcode', { required: true })} placeholder="Zipcode" error={errors.zipcode?.message} onKeyDown={handleFullDelete} />
                            <Button
                                Icon={LocationPinIcon}
                                disabled={!geolocation.zipcode}
                                onClick={() => {
                                    setValue('zipcode', `Current Location (${geolocation.zipcode})`);
                                }}
                                htmlType="button"
                            />
                        </div>
                        <FormInput
                            type="number"
                            {...register('radius', { required: true })}
                            placeholder="Radius (miles)"
                            defaultValue={DEFAULT_SEARCH_RADIUS}
                            error={errors.radius?.message}
                            onKeyDown={handleFullDelete}
                        />
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
                                                <StyledLink to={organization.website} external>
                                                    {organization.name}
                                                </StyledLink>
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
