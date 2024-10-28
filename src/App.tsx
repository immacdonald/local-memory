import { LocationData } from '@types';
import { StyleConfiguration, StyledApp } from 'phantom-library';
import { Route, Routes } from 'react-router-dom';
import { FC, useEffect, useState } from 'react';
import { Footer, Header } from '@components/page';
import { About, Home, NotFound, World } from '@views';
import { useAnalytics } from './hooks/useAnalytics';

const styleConfiguration: StyleConfiguration = {
    page: {
        defaultHeader: <Header hasBackground pageSpace="pad" />,
        defaultFooter: <Footer />
    }
};

const App: FC = () => {
    useAnalytics('/tools/local-memory');

    const [locationData, setLocationData] = useState<LocationData>({ loading: true, location: null });
    const [locationError, setError] = useState<string | null>(null);

    const getLocation = (): void => {
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
    }, []);

    useEffect(() => {
        if (locationError) {
            console.warn(locationError);
        }
    }, [locationError]);

    return (
        <StyledApp anchors modals banners configuration={styleConfiguration}>
            <Routes>
                <Route path="/" element={<Home geolocation={locationData} />} />
                <Route path="/about" element={<About />} />
                <Route path="/world" element={<World geolocation={locationData} />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </StyledApp>
    );
};

export { App };
