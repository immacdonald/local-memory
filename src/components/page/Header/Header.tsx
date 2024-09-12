import { LocationData } from '@types';
import { FC } from 'react';
import { Button, DynamicHeaderProps, Popover, SimpleDynamicHeader, Typography } from 'phantom-library';
import { Link } from 'react-router-dom';
import { LocalMemoryIcon, LocationPinIcon } from '@icons';
import style from './Header.module.scss';

interface HeaderProps extends DynamicHeaderProps {
    geolocation?: LocationData;
}

const Header: FC<HeaderProps> = ({ geolocation, ...props }) => {
    const locationPopover = !geolocation || geolocation?.loading ? (
        < Typography.Text>Loading location data...</ Typography.Text>
    ) : geolocation!.location ? (
        <>
            < Typography.Text>
                <small>Current Location</small>
            </ Typography.Text>
            < Typography.Text>{`(${geolocation!.location.latitude}, ${geolocation!.location.longitude})`}</ Typography.Text>
        </>
    ) : (
        < Typography.Text>Unable to get location data. Please check your privacy settings.</ Typography.Text>
    );

    return (
        <SimpleDynamicHeader {...props}>
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
                        <Button link="/" visual="text">Home</Button>
                        <Button link="/about" visual="text">About</Button>
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
