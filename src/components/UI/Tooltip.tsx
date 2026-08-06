'use client';

import { Tooltip as HeroUiTooltip } from '@heroui/react';
import { useState, useEffect } from 'react';
import type { ComponentProps } from 'react';

export const Tooltip = (props: ComponentProps<typeof HeroUiTooltip>) => {
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
      {/*
        color="foreground" meant bg-foreground/text-background -- #E7E7EA with
        #0B0B0C text, a white box with dark text floating over a near-black ui.
        it now sits on content1 like every other raised surface.
      */}
      <HeroUiTooltip
        {...props}
        closeDelay={200}
        classNames={{
          content:
            'bg-content1 text-primary-100 border border-primary-700 shadow-lg font-medium text-sm px-3 py-1.5'
        }}
        isOpen={isOpen}
        offset={8}
        placement={isMobile ? 'left' : 'top'}
      />
    </div>
  );
};
