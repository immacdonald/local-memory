import type { Callback } from 'phantom-library';
import type { MapFunctions } from '../types';
import type { FC } from 'react';
import { FullscreenExitIcon, FullscreenIcon, SwipeIcon, TouchIcon } from '@icons';
import { Button, RecenterIcon, ZoomInIcon, ZoomOutIcon } from 'phantom-library';
import styles from './MapControls.module.scss';

interface MapControlsProps {
    mapFunctions: MapFunctions;
    interactionMode: boolean;
    toggleInteractionMode: Callback<void>;
    fullscreen: boolean;
    toggleFullscreen: Callback<void>;
}

const MapControls: FC<MapControlsProps> = ({ mapFunctions, interactionMode, toggleInteractionMode, fullscreen, toggleFullscreen }) => {
    return (
        <div className={styles.controls}>
            <Button
                onClick={() => toggleInteractionMode()}
                Icon={interactionMode ? TouchIcon : SwipeIcon}
                data-tooltip={interactionMode ? 'Interact to change search location' : 'Interact to pan/zoom'}
                rounded
            />
            <Button onClick={() => mapFunctions.zoomIn()} Icon={ZoomInIcon} rounded data-tooltip="Zoom in" />
            <Button onClick={() => mapFunctions.zoomOut()} Icon={ZoomOutIcon} rounded data-tooltip="Zoom out" />
            <Button onClick={() => mapFunctions.center(false)} Icon={RecenterIcon} rounded data-tooltip="Recenter" />
            <Button onClick={() => toggleFullscreen()} Icon={fullscreen ? FullscreenExitIcon : FullscreenIcon} rounded />
        </div>
    );
};

export { MapControls };
