import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Text } from 'phantom-library';
import style from './Footer.module.scss';

const Footer: FC = () => {
    return (
        <footer className={style.footer}>
            <div className={style.content}>
                <Text as="span">
                    &copy; {new Date().getFullYear()}{' '}
                    <Link to="https://newsresearch.lab.wm.edu" target="_blank">
                        Willam & Mary NEWS Lab
                    </Link>
                </Text>
            </div>
        </footer>
    );
};

export { Footer };
