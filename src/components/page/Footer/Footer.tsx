import { FC } from 'react';
import { config } from '@config';
import style from './Footer.module.scss';
import { Link } from 'react-router-dom';
import { Text } from 'phantom-library'

const Footer: FC = () => {
    return (
        <footer className={style.footer}>
            <div className={style.content}>
                <Text as='span'>&copy; {new Date().getFullYear()}{' '}
                    <Link to="https://www.wm.edu" target="_blank">
                        Willam & Mary
                    </Link> <Link to="https://github.com/wm-newslab" target="_blank">
                        NEWS Lab
                    </Link>
                </Text>
                {config.mode == 'development' && (
                    <Text as='span' newline>
                        <i>Development Version {config.version}</i>
                    </Text>
                )}
            </div>
        </footer>
    );
};

export { Footer };
