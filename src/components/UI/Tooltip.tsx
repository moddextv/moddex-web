import { Tooltip as NextUiTooltip } from '@nextui-org/react';
import type { ComponentProps } from 'react';

export const Tooltip = (props: ComponentProps<typeof NextUiTooltip>) => (
  <NextUiTooltip
    {...props}
    color="foreground"
    closeDelay={200}
    className="font-medium"
    showArrow
  />
);
