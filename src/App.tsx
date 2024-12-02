import { FC, useEffect } from 'react';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { Column, Loading, StyledApp } from 'phantom-library';
import { About, Home, NotFound, World } from '@views';
import { GeolocationContextProvider } from './contexts/GeolocationContext';
import { useGeolocationContext } from './contexts/useGeolocationContext';
import { useAnalytics } from './hooks/useAnalytics';

const RoutedApp: FC = () => {
    useAnalytics('/tools/local-memory');

    const { geolocation, setGeolocation } = useGeolocationContext();

    const getLocation = (): void => {
        const geolocationTimeout = setTimeout(() => {
            console.log('Geolocation fetch timeout.');
            setGeolocation('Geolocation is not supported by this browser.');
        }, 10000);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setGeolocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    clearTimeout(geolocationTimeout);
                },
                (error) => {
                    setGeolocation(error.message);
                    clearTimeout(geolocationTimeout);
                }
            );
        } else {
            setGeolocation('Geolocation is not supported by this browser.');
            clearTimeout(geolocationTimeout);
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    return (
        <StyledApp>
            {geolocation.loading ? (
                <Column verticalAlign="center" style={{ height: '100vh' }}>
                    <Loading />
                </Column>
            ) : (
                <Outlet />
            )}
        </StyledApp>
    );
};

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <RoutedApp />,
            children: [
                {
                    path: '/',
                    element: <Home />
                },
                {
                    path: '/about',
                    element: <About />
                },
                {
                    path: '/world',
                    element: <World />
                },
                {
                    path: '*',
                    element: <NotFound />
                }
            ]
        }
    ],
    {
        basename: import.meta.env.BASE_URL
    }
);

const App: FC = () => {
    return (
        <GeolocationContextProvider>
            <RouterProvider router={router} />
        </GeolocationContextProvider>
    );
};

export { App };
