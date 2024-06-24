import { FC } from 'react';
import { config } from '@config';
import style from './Footer.module.scss';

const Footer: FC = () => {
    return (
        <footer className={style.footer}>
            <div className={style.content}>
                <p>&copy; 2024 Ian MacDonald & Dr. Alexander Nwala</p>
                {config.mode == 'development' && (
                    <p>
                        <i>Development Version {config.version}</i>
                    </p>
                )}
            </div>
        </footer>
    );
};

export { Footer };
