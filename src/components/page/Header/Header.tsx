import { FC } from 'react';
import { Button, MoonFilled, Popover, SunFilled, useResponsiveContext, Text } from 'phantom-library';
import { Link } from 'react-router-dom';
import { LocalMemoryIcon, LocationPin } from '@icons';
import style from './Header.module.scss';
import { Coordinates, LocationData } from '@types';

interface HeaderProps {
    geolocation: LocationData;
}

const Header: FC<HeaderProps> = ({ geolocation }) => {
    const { theme, toggleTheme } = useResponsiveContext();

    const locationPopover = geolocation.loading ? (
        <Text>Loading location data...</Text>
    ) : geolocation.location ? (
        <>
            <Text><small>Current Location</small></Text>
            <Text>{`(${geolocation.location.latitude}, ${geolocation.location.longitude})`}</Text>
        </>
    ) : (
        <Text>Unable to get location data. Please check your privacy settings.</Text>
    )

    return (
        <header className={style.header}>
            <div className={style.content}>
                <h4 className={style.logo}>
                    <Link to="/">
                        <LocalMemoryIcon size="large" />
                    </Link>
                </h4>
                <div className={style.navigation}>
                    <nav className={style.links}>
                        <Button link="/" label="Home" visual="text" />
                        <Button link="/about" label="About" visual="text" />
                        <Popover content={locationPopover} customStyle={style.locationPopover} direction='bottom'>
                            <Button rounded Icon={LocationPin} visual="text" />
                        </Popover>
                        <Button rounded visual="text" onClick={() => toggleTheme()} Icon={theme == 'light' ? SunFilled : MoonFilled} />
                    </nav>
                </div>
            </div>
        </header>
    );
};

export { Header };
