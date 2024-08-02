import { StyledApp } from 'phantom-library';
import { Route, Routes } from 'react-router-dom';
import { FC, useEffect, useState } from 'react';
import { Footer, Header } from '@components/page';
import { About, Home, NotFound } from '@views';
import { LocationData } from '@types';

const App: FC = () => {
    const [locationData, setLocationData] = useState<LocationData>({loading: true, location: null});
    const [_, setError] = useState<string | null>(null);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationData({
                        loading: false,
                        location: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    });
                    setError(null);
                },
                (error) => {
                    setError(error.message);
                    setLocationData({
                        loading: false,
                        location: null
                    });
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
            setLocationData({
                loading: false,
                location: null
            });
        }
    };

    useEffect(() => {
        getLocation();
    }, [])

    return (
        <StyledApp anchors modals banners>
            <Header geolocation={locationData}/>
            <Routes>
                <Route path="/" element={<Home geolocation={locationData}/>} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </StyledApp>
    );
};

export { App };
