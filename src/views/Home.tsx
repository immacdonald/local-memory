import type { Media, Coordinates, MediaWithDistance, USMedia } from '@types';
import type { FC, ReactElement, KeyboardEvent } from 'react';
import { useEffect, useRef, useState, useMemo } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { FacebookIcon, LocalMemoryFullIcon, LocationPinIcon, TwitterIcon, YouTubeIcon } from '@icons';
import { Button, capitalizeFirstLetter, Row, Section, decimalPlaces, Typography, FormInput, Divider, tokens, Column, Heading, StyledLink, Flex, useResponsiveContext } from 'phantom-library';
import { useGeolocationContext } from 'src/contexts/useGeolocationContext';
import { Layout } from 'src/layouts';
import { USMap } from '@components/maps';
import { zipcodeMap } from '@data';
import mediaData from '@data/media.json';
import { findClosestZipcode, getIconForMediaClass, haversineDistance } from '@utility';
import style from './Views.module.scss';

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

    const { atBreakpoint, windowSize } = useResponsiveContext();
    const isMobile = useMemo(() => atBreakpoint('xs'), [windowSize.width]);

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

    const updateSearch = (coordinates?: Coordinates, radius?: number): void => {
        if (radius) {
            setValue('radius', decimalPlaces(radius, 0));
            onSearch(search.current!.location, radius);
        } else if (coordinates) {
            setValue('zipcode', findClosestZipcode(coordinates));
            onSearch(coordinates, search.current?.radius || DEFAULT_SEARCH_RADIUS);
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
                <Heading align="center" subheading={<LocalMemoryFullIcon inline size={isMobile ? 'small' : undefined} />} style={{ marginBottom: tokens.space.md }}>
                    US Local Media by County
                </Heading>
                <Column style={{ minHeight: '500px' }} verticalAlign="start">
                    {isMobile ? (
                        <Row style={{ height: '300px', border: tokens.border.soft, borderRadius: tokens.borderRadius, padding: tokens.space.md, marginBottom: tokens.space.md }}>
                            <Typography.Text>Please use a computer or tablet to view the interactive visualization.</Typography.Text>
                        </Row>
                    ) : (
                        <USMap search={search.current} updateSearch={updateSearch} />
                    )}
                    <Typography.Paragraph>
                        Local Memory provides data about the geographic distribution of local news organizations across the United States. This website displays an interactive map showing a collection
                        of <i>newspapers</i>, <i>TV broadcasts</i>, and <i>radio stations</i> on a per-county level. This data is sorted by proximity to your current location (or any zip code).
                    </Typography.Paragraph>
                </Column>
                <Divider />
                <form id="search" onSubmit={handleSubmit(onSubmit)}>
                    <Flex flex={{ base: 'row', xs: 'column' }} gap={tokens.space.sm}>
                        <div className={style.currentLocationSearch}>
                            <FormInput type="text" {...register('zipcode', { required: true })} placeholder="Zipcode" error={errors.zipcode?.message} onKeyDown={handleFullDelete} />
                            <Button
                                Icon={LocationPinIcon}
                                disabled={!geolocation.zipcode}
                                onClick={() => {
                                    setValue('zipcode', `Current Location (${geolocation.zipcode})`);
                                    onSearch(geolocation.location!, search.current!.radius);
                                }}
                                htmlType="button"
                                variant="text"
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
                    </Flex>
                </form>
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
                                                {organization['cityCountyName']}, {(organization as USMedia).usState}
                                            </td>
                                            {!isMobile && (
                                                <td>
                                                    <Row align="start">
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

export { Home };
