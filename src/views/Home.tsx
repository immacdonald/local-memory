import { Button, capitalizeFirstLetter, Card, Page, Row, Section } from '@imacdonald/phantom';
import Text from 'components/Text';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import FormInput from 'src/components/FormInput';
import Map from 'src/components/Map';
import { LocalMemory } from 'src/icons';
import { Media } from 'src/types';
import mediaData from './media.json';
import zipcodeCoordinates from './zipcode_coordinates.json';

interface SearchInput {
    country: string;
    zipcode: string;
    count: string;
}

type Coordinates = {
    lat: number;
    lon: number;
};

function haversineDistance(coords1: Coordinates, coords2: Coordinates) {
    const R = 6371; // Earth's radius in kilometers
    const lat1 = coords1.lat;
    const lon1 = coords1.lon;
    const lat2 = coords2.lat;
    const lon2 = coords2.lon;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees: number) {
    return (degrees * Math.PI) / 180;
}

function sortCitiesByProximity(cities: Media[], currentCoords: Coordinates, limit = 100) {
    cities.sort((a: Media, b: Media) => {
        const distA = haversineDistance(currentCoords, { lat: a.cityCountyLat, lon: a.cityCountyLong });
        const distB = haversineDistance(currentCoords, { lat: b.cityCountyLat, lon: b.cityCountyLong });
        return distA - distB;
    });

    return cities.slice(0, limit);
}

const Home = () => {
    const zipcodes = zipcodeCoordinates as Record<string, Coordinates>;
    const media = mediaData as Media[];
    const [sorted, setSorted] = useState<any[]>([]);

    const {
        register,
        formState: { errors },
        handleSubmit
    } = useForm<SearchInput>({ mode: 'onSubmit', reValidateMode: 'onSubmit' });

    const onSubmit: SubmitHandler<SearchInput> = (data) => {
        const location = zipcodes[data.zipcode];
        if (location) {
            const sortedCities = sortCitiesByProximity(media, location, Number(data.count));
            setSorted(sortedCities);
        } else {
            console.warn('Zipcode not found!');
        }
    };

    return (
        <Page title="Local Memory Project">
            <Section cssProperties={{ paddingTop: '0' }}>
                <LocalMemory size="full" />
                <Row>
                    <Map />
                </Row>
                <Text as="h4">Understanding Local News & Media</Text>
                <Text size="lg">
                    This website returns a collection of <i>newspapers</i> and/or <i>TV</i> and/or <i>radio stations</i> in order of proximity to a zip code for US media, or a collection of
                    newspapsers for a city for Non-US media.
                </Text>
                <form id="search" onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        {/*<Dropdown options={['USA']} placeholder='Country' />*/}
                        <FormInput name="country" type="text" placeholder="Country" defaultValue="USA" register={register} validationSchema={{ required: true }} error={errors.country} disabled />
                        <FormInput name="zipcode" type="text" placeholder="Zip Code" register={register} validationSchema={{ required: true }} error={errors.zipcode} />
                        <FormInput name="count" type="number" placeholder="Media Count" defaultValue="100" register={register} validationSchema={{ required: true }} error={errors.count} />
                    </Row>
                    <Row>
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

export default Home;
