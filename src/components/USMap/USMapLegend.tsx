import { FC } from 'react';
import { CircleFillIcon, SquareFillIcon } from '@icons';
import { Typography } from 'phantom-library';
import styles from './USMapLegend.module.scss';

const USMapLegend: FC = () => {
    return (
        <div className={styles.legend}>
            <Typography.Text newline>
                <CircleFillIcon inline style={{ color: 'gold' }} /> Media Organization
            </Typography.Text>
            <Typography.Text newline>
                0 Organizations <SquareFillIcon inline style={{ color: '#e3d9ff' }} />
                <SquareFillIcon inline style={{ color: '#bea9f8' }} />
                <SquareFillIcon inline style={{ color: '#9879ee' }} />
                <SquareFillIcon inline style={{ color: '#6e48e2' }} />
                <SquareFillIcon inline style={{ color: '#3700d4' }} /> 4+
            </Typography.Text>
        </div>
    );
};

export { USMapLegend };
