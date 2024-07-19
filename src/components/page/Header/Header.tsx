import { FC } from 'react';
import { Button, MoonFilled, SunFilled, useResponsiveContext } from 'phantom-library';
import { Link } from 'react-router-dom';
import { LocalMemoryIcon } from '@icons';
import style from './Header.module.scss';

const Header: FC = () => {
    const { theme, toggleTheme } = useResponsiveContext();

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
                        <Button rounded visual="text" onClick={() => toggleTheme()} Icon={theme == 'light' ? SunFilled : MoonFilled} />
                    </nav>
                </div>
            </div>
        </header>
    );
};

export { Header };
