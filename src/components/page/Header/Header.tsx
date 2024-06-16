import { Button } from '@imacdonald/phantom';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { LocalMemoryIcon } from 'src/icons';
import style from './Header.module.scss';

const Header: FC = () => {
    return (
        <header className={style.header}>
            <div className={style.content}>
                <h4 className={style.logo}>
                    <Link to="/">
                        <LocalMemoryIcon size="large" />
                    </Link>
                </h4>
                <div className={style.navigation}>
                    <nav className={style.navLinks}>
                        <Button link="/" label="Home" />
                    </nav>
                </div>
            </div>
        </header>
    );
};

export { Header };
