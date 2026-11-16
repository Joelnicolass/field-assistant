import type { ReactNode } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { STROKE_WIDTH, VIEW_BOX } from './constants';
import { IconName } from './IconName';

type IconProps = { name: IconName; size: number; color: string };

function line(color: string) {
  return {
    stroke: color,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    fill: 'none',
  } as const;
}

function microphone(color: string): ReactNode {
  return (
    <>
      <Rect x={9} y={2.5} width={6} height={11.5} rx={3} fill={color} />
      <Path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5" {...line(color)} />
    </>
  );
}

const DRAWINGS: Record<IconName, (color: string) => ReactNode> = {
  [IconName.Microphone]: microphone,
  [IconName.MicrophoneOff]: (color) => (
    <>
      {microphone(color)}
      <Path d="M4 3.5l16 17" {...line(color)} />
    </>
  ),
  [IconName.Rain]: (color) => (
    <Path d="M12 3.2c3.2 3.9 5.6 7 5.6 10a5.6 5.6 0 0 1-11.2 0c0-3 2.4-6.1 5.6-10z" fill={color} />
  ),
  [IconName.Move]: (color) => <Path d="M4 12h15M13.5 6.5L19 12l-5.5 5.5" {...line(color)} />,
  [IconName.Check]: (color) => <Path d="M5 12.8l4.6 4.6L19 7.6" {...line(color)} />,
  [IconName.Question]: (color) => (
    <Path d="M9 9.2a3.1 3.1 0 1 1 4.6 2.7c-1 .6-1.6 1.2-1.6 2.5M12 18.2v.1" {...line(color)} />
  ),
  [IconName.Alert]: (color) => <Path d="M12 6v7.5M12 17.6v.1" {...line(color)} />,
  [IconName.Offline]: (color) => (
    <Path d="M5 19v-2.5M10 19v-6M15 19v-9.5M20 19V6M4 4.5l16 15" {...line(color)} />
  ),
  [IconName.Close]: (color) => <Path d="M6.5 6.5l11 11M17.5 6.5l-11 11" {...line(color)} />,
};

export function Icon({ name, size, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX}>
      {DRAWINGS[name](color)}
    </Svg>
  );
}
