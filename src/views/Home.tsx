import type { Media, Coordinates } from '@types';
import { FC, useEffect, useState } from 'react';
import { Button, capitalizeFirstLetter, Card, FormInput, Heading, Page, Row, Section, Text } from 'phantom-library';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LocalMemory } from '@icons';
import { USMap } from '@components/USMap';
import mediaSummary from '@data/media_summary.json';
import mediaData from '@data/media.json';
import zipcodeCoordinates from '@data/zipcode_coordinates.json';
import { haversineDistance } from '@utility';

interface SearchInput {
    country: string;
    zipcode: string;
    count: string;
}

function sortCitiesByProximity(cities: Media[], currentCoords: Coordinates, limit = 100): Media[] {
    cities.sort((a: Media, b: Media) => {
        const distA = haversineDistance(currentCoords, { lat: a.cityCountyLat, lon: a.cityCountyLong });
        const distB = haversineDistance(currentCoords, { lat: b.cityCountyLat, lon: b.cityCountyLong });
        return distA - distB;
    });

    return cities.slice(0, limit);
}

const Home: FC = () => {
    const zipcodes = zipcodeCoordinates as Record<string, Coordinates>;
    const media = mediaData as Media[];
    const [sorted, setSorted] = useState<Media[]>([]);
    const [searchTotals, setSearchTotals] = useState<{ fips: number; total: number }[]>([]);

    const {
        register,
        formState: { errors },
        handleSubmit
    } = useForm<SearchInput>({ mode: 'onSubmit', reValidateMode: 'onSubmit' });

    const onSubmit: SubmitHandler<SearchInput> = (data) => {
        const location = zipcodes[data.zipcode];
        if (location) {
            const sortedCities = sortCitiesByProximity(media, location, Number(data.count));

            let totals: { fips: number; total: number }[] = [];
            sortedCities.forEach((organization: Media) => {
                const exists = totals.find((value) => value.fips == organization.fips);
                if (exists) {
                    totals = [...totals, { fips: exists.fips, total: exists.total + 1 }];
                } else {
                    totals.push({ fips: organization.fips, total: 1 });
                }
            });
            setSearchTotals(totals);
            setSorted(sortedCities);
        } else {
            console.warn('Zipcode not found!');
        }
    };

    const [location, setLocation] = useState<{ latitude: number | null, longitude: number | null }>({ latitude: null, longitude: null });
    const [error, setError] = useState<string | null>(null);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setError(null);
                },
                (error) => {
                    setError(error.message);
                    setLocation({ latitude: null, longitude: null });
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    useEffect(() => {
        getLocation();
    }, [])

    return (
        <Page title="Local Memory Project">
            <Section>
                <Heading align='center' title={<LocalMemory size="full" />} subtitle='US Local Media Per County' bold={true}/>
                <Row>
                    <USMap data={mediaSummary} mediaData={mediaData as any} location={location} />
                </Row>
                <Text>
                    This website returns a collection of <i>newspapers</i> and/or <i>TV</i> and/or <i>radio stations</i> in order of proximity to a zip code for US media, or a collection of
                    newspapers for a city for Non-US media.
                </Text>
                <form id="search" onSubmit={handleSubmit(onSubmit)}>
                    <Row verticalAlign="start">
                        <FormInput name="zipcode" type="text" placeholder="Zip Code" register={register} validationSchema={{ required: true }} error={errors.zipcode} />
                        <FormInput name="count" type="number" placeholder="Media Count" defaultValue="100" register={register} validationSchema={{ required: true }} error={errors.count} />
                        <Button context="primary" label="Search" visual="filled" form="search" type="submit" />
                    </Row>
                </form>
                <br />
                {sorted.length > 0 && (
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '320px' }}>Location</th>
                                    <th>Media Organization</th>
                                    <th style={{ width: '240px' }}>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((organization: Media, index: number) => {
                                    return (
                                        <tr key={index}>
                                            <td>{organization['cityCountyName']}, {organization.usState}</td>
                                            <td>{organization.name}</td>
                                            <td>{capitalizeFirstLetter(organization.mediaSubclass!)} {capitalizeFirstLetter(organization.mediaClass!)}</td>
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
