import { withVectorIcon } from 'phantom-library';
import LocalMemoryIconSVG from './local_memory_icon.svg?react';
import LocalMemorySVG from './local_memory.svg?react';
import LocationPinSVG from './location_pin.svg?react';
import LocationPinFillSVG from './location_pin_fill.svg?react';
import LocationPinFillInline from './location_pin_fill.svg';
import FacebookSVG from './facebook.svg?react';
import TwitterSVG from './twitter.svg?react';
import YouTubeSVG from './youtube.svg?react';

export const LocalMemory = withVectorIcon(LocalMemorySVG);
export const LocalMemoryIcon = withVectorIcon(LocalMemoryIconSVG);
export const LocationPin = withVectorIcon(LocationPinSVG);
export const LocationPinFill = withVectorIcon(LocationPinFillSVG);
export { LocationPinFillInline }
export const Facebook = withVectorIcon(FacebookSVG);
export const Twitter = withVectorIcon(TwitterSVG);
export const YouTube = withVectorIcon(YouTubeSVG);
