import type { Media, Coordinates } from '@types';
import { FC, useState } from 'react';
import { Button, capitalizeFirstLetter, Card, FormInput, Page, Row, Section, Text } from 'phantom-library';
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

    return (
        <Page title="Local Memory Project">
            <Section>
                <LocalMemory size="full" />
                <Row>
                    <USMap data={sorted.length > 0 ? searchTotals : mediaSummary} mediaData={mediaData as any} />
                </Row>
                <Text as="h4">Understanding Local News & Media</Text>
                <Text size="lg">
                    This website returns a collection of <i>newspapers</i> and/or <i>TV</i> and/or <i>radio stations</i> in order of proximity to a zip code for US media, or a collection of
                    newspapsers for a city for Non-US media.
                </Text>
                <form id="search" onSubmit={handleSubmit(onSubmit)}>
                    <Row verticalAlign="start">
                        {/*<Dropdown options={['USA']} placeholder='Country' />*/}
                        {/*<FormInput name="country" type="text" placeholder="Country" defaultValue="USA" register={register} validationSchema={{ required: true }} error={errors.country} />*/}
                        <FormInput name="zipcode" type="text" placeholder="Zip Code" register={register} validationSchema={{ required: true }} error={errors.zipcode} />
                        <FormInput name="count" type="number" placeholder="Media Count" defaultValue="100" register={register} validationSchema={{ required: true }} error={errors.count} />
                        <Button context="primary" label="Search" visual="filled" form="search" type="submit" />
                    </Row>
                </form>
                <br />
                <div>
                    {sorted &&
                        sorted.map((organization: Media, index: number) => {
                            return (
                                <Card key={index} cssProperties={{ marginBottom: '16px' }}>
                                    <Card.Header title={`${organization.name}`} subtitle={`${capitalizeFirstLetter(organization.mediaType)}`} />
                                    <Card.Body>
                                        <p>
                                            County: {organization['cityCountyName']}, {organization.usState}
                                        </p>
                                        <p>
                                            Type: {capitalizeFirstLetter(organization.mediaSubclass!)} {capitalizeFirstLetter(organization.mediaClass!)}
                                        </p>
                                    </Card.Body>
                                </Card>
                            );
                        })}
                </div>
            </Section>
        </Page>
    );
};

export { Home };
