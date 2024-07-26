'use client';

import { Tooltip as NextUiTooltip } from '@nextui-org/react';
import { useState, useEffect } from 'react';
import type { ComponentProps } from 'react';

export const Tooltip = (props: ComponentProps<typeof NextUiTooltip>) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleToggleTooltip = () => {
    if (isMobile) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div
      onClick={handleToggleTooltip}
      onMouseEnter={!isMobile ? () => setIsOpen(true) : undefined}
      onMouseLeave={!isMobile ? () => setIsOpen(false) : undefined}
    >
      <NextUiTooltip
        {...props}
        color="foreground"
        closeDelay={200}
        className="font-medium"
        isOpen={isOpen}
        placement={isMobile ? 'left' : 'top'}
      />
    </div>
  );
};
