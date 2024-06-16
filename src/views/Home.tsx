import { Button, Page, Row, Section, capitalizeFirstLetter, getAsync } from '@imacdonald/phantom';
import Text from 'components/Text';
import mediaData from './usa_2016_2024_pu5e.json';
import { XMLParser } from 'fast-xml-parser';
import { SubmitHandler, useForm } from 'react-hook-form';
import FormInput from 'src/components/FormInput';
import { useState } from 'react';
import { LocalMemory } from 'src/icons';
import Map from 'src/components/Map';

interface SearchInput {
    country: string;
    zipcode: string;
    count: string;
}

type Coordinates = {
    lat: number;
    lng: number;
}

function haversineDistance(coords1: Coordinates, coords2: Coordinates) {
    const R = 6371; // Earth's radius in kilometers
    const lat1 = coords1.lat;
    const lon1 = coords1.lng;
    const lat2 = coords2.lat;
    const lon2 = coords2.lng;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees: number) {
    return degrees * Math.PI / 180;
}

function sortCitiesByProximity(cities: any, currentCoords: Coordinates) {
    cities.sort((a: any, b: any) => {
        const distA = haversineDistance(currentCoords, { lat: a['city-county-lat'], lng: a['city-county-long'] });
        const distB = haversineDistance(currentCoords, { lat: b['city-county-lat'], lng: b['city-county-long'] });
        return distA - distB;
    });

    return cities;
}

const Home = () => {
    console.log(mediaData);
    const [sorted, setSorted] = useState<any[]>([]);

    const {
        register,
        formState: { errors },
        setError,
        handleSubmit
    } = useForm<SearchInput>({ mode: 'onSubmit', reValidateMode: 'onSubmit' });

    const onSubmit: SubmitHandler<SearchInput> = (data) => {
        console.log(data);

        const options = {
            ignoreAttributes: false,
            attributeNamePrefix: "", // if you want to access attributes without a prefix
        };

        getAsync('http://api.geonames.org', `/findNearbyPostalCodes?postalcode=${data.zipcode}&country=US&radius=10&username=imacdonald`, new Headers(), (result: any) => {
            const parser = new XMLParser(options);
            const dataObject = parser.parse(result);
            console.log(dataObject)
            const latitude = dataObject.geonames.code[0].lat;
            const longitude = dataObject.geonames.code[0].lng;
            const state = dataObject.geonames.code[0].adminCode1;

            ;

            const currentLocation = { lat: latitude, lng: longitude };
            const sortedCities = sortCitiesByProximity((mediaData as any)[state]['newspaper'], currentLocation);
            console.log(sortedCities);
            setSorted(sortedCities);
        }, () => console.log('Error'), false);
    }

    return (
        <Page title="Local Memory Project">
            <Section cssProperties={{ paddingTop: "0" }}>
                <LocalMemory size='full' />
                <Row>
                    <Map />
                </Row>
                <Text as='h4'>
                    Understanding Local News & Media
                </Text>
                <Text size="lg">
                    This website returns a collection of <i>newspapers</i> and/or <i>TV</i> and/or <i>radio stations</i> in order of proximity to a zip code for US media, or a collection of newspapsers for a city for Non-US media.
                </Text>
                <form id="search" onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        {/*<Dropdown options={['USA']} placeholder='Country' />*/}
                        <FormInput
                            name="country"
                            type="text"
                            placeholder="Country"
                            defaultValue='USA'
                            register={register}
                            validationSchema={{ required: true }}
                            error={errors.country}
                        />
                        <FormInput
                            name="zipcode"
                            type="text"
                            placeholder="Zip Code"
                            register={register}
                            validationSchema={{ required: true }}
                            error={errors.zipcode}
                        />
                        <FormInput
                            name="count"
                            type="text"
                            placeholder="Media Count"
                            defaultValue='100'
                            register={register}
                            validationSchema={{ required: true }}
                            error={errors.count}
                        />
                    </Row>
                    <Row>
                        <Button context="primary" label="Search" visual="filled" form="search" type="submit" />
                    </Row>
                </form>
                <br />
                <div>
                    {sorted && sorted.map((newspaper: any) => {
                        return (
                            <>
                                <h4>{newspaper.name}</h4>
                                <p>County: {newspaper['city-county-name']}</p>
                                <p>Type: {capitalizeFirstLetter(newspaper['media-subclass'])} {capitalizeFirstLetter(newspaper['media-class'])}</p>
                            </>
                        )
                    })}
                </div>
            </Section>
        </Page>
    );
};

export default Home;
