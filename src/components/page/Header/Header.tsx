import { LocationData } from '@types';
import { FC } from 'react';
import { Button, Popover, SimpleDynamicHeader, Text } from 'phantom-library';
import { Link } from 'react-router-dom';
import { LocalMemoryIcon, LocationPinIcon } from '@icons';
import style from './Header.module.scss';

interface HeaderProps {
    geolocation: LocationData;
}

const Header: FC<HeaderProps> = ({ geolocation }) => {
    const locationPopover = geolocation.loading ? (
        <Text>Loading location data...</Text>
    ) : geolocation.location ? (
        <>
            <Text>
                <small>Current Location</small>
            </Text>
            <Text>{`(${geolocation.location.latitude}, ${geolocation.location.longitude})`}</Text>
        </>
    ) : (
        <Text>Unable to get location data. Please check your privacy settings.</Text>
    );

    return (
        <SimpleDynamicHeader hasBackground inline pageSpace="overlap" dynamicSettings={{ enabled: true, scrollDistance: 1000, inline: false, hasBackground: true, pageSpace: 'pad' }}>
            <div className={style.content}>
                <div className={style.logo}>
                    <Link to="/">
                        <LocalMemoryIcon size="large" />
                    </Link>
                </div>
                <div className={style.newslab}>
                    <span>A </span>
                    <b>
                        <Link to="https://newsresearch.lab.wm.edu" target="_blank">
                            NEWS Lab
                        </Link>
                    </b>
                    <span> Project</span>
                </div>
                <div className={style.navigation}>
                    <nav className={style.links}>
                        <Button link="/" label="Home" visual="text" />
                        <Button link="/about" label="About" visual="text" />
                        {false && (
                            <Popover content={locationPopover} customStyle={style.locationPopover} direction="bottom">
                                <Button rounded Icon={LocationPinIcon} visual="text" />
                            </Popover>
                        )}
                        {/*<Button rounded visual="text" onClick={() => toggleTheme()} Icon={theme == 'light' ? SunFilledIcon : MoonFilledIcon} />*/}
                    </nav>
                </div>
            </div>
        </SimpleDynamicHeader>
    );
};

export { Header };
