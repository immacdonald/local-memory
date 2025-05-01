import type { FC } from 'react';
import { CircleFillIcon, SquareFillIcon } from '@icons';
import { orUndefined, Row, tokens } from 'phantom-library';
import { config } from '@config';
import styles from './MapLegend.module.scss';

interface MapLegendProps {
    minimum: string;
    maximum: string;
}

const MapLegend: FC<MapLegendProps> = ({ minimum, maximum }) => {
    return (
        <div className={styles.legend}>
            <Row block={false}>
                <CircleFillIcon inline color="gold" style={{ marginRight: tokens.space.sm }} /> Media Organization
            </Row>
            <Row block={false}>
                {minimum}
                {config.colors.map((scaleColor, index) => (
                    <SquareFillIcon
                        inline
                        color={scaleColor}
                        style={{
                            marginLeft: orUndefined(index == 0, tokens.space.sm),
                            marginRight: orUndefined(index == config.colors.length - 1, tokens.space.sm)
                        }}
                        key={index}
                    />
                ))}
                {maximum}
            </Row>
        </div>
    );
};

export { MapLegend };
