import React, { FC, useState, useEffect, CSSProperties, useRef } from 'react';
import ReactDOM from 'react-dom';

export type TooltipProps = {
    content: string;
    children: React.ReactNode;
    placement?: 'top' | 'right' | 'bottom' | 'left';
};

export const Tooltip: FC<TooltipProps> = ({ content, children, placement = 'top' }) => {
    const [visible, setVisible] = useState(false);
    const childRef = useRef<HTMLDivElement|null>(null);
    const tooltipRef = useRef<HTMLDivElement|null>(null)

    useEffect(() => {
        if (!visible) return;

        const childRect = childRef.current?.getBoundingClientRect();
        const tooltipRect = tooltipRef.current?.getBoundingClientRect();

        if (!childRect || !tooltipRect) return;

        let top, left;

        const offset: number = 4;
        const centeredHorizontal = childRect.left + childRect.width / 2 - tooltipRect.width / 2;
        const centeredVertical = childRect.top + childRect.height / 2 - tooltipRect.height / 2;

        switch (placement) {
            case 'top':
                top = childRect.top - tooltipRect.height - offset;
                left = centeredHorizontal;
                break;
            case 'bottom':
                top = childRect.bottom + offset;
                left = centeredHorizontal;
                break;
            case 'left':
                top = centeredVertical;
                left = childRect.left - tooltipRect.width - offset;
                break;
            case 'right':
                top = centeredVertical;
                left = childRect.right + offset;
                break;
            default:
                break;
        }

        if (tooltipRef.current) {
            tooltipRef.current.style.top = `${top}px`;
            tooltipRef.current.style.left = `${left}px`;
        }
    }, [placement, visible]);

    const showTooltip = () => {
        setVisible(true);
    };

    const hideTooltip = () => {
        setVisible(false);
    };

    return (
        <div
            ref={childRef}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            {children}
            {visible && ReactDOM.createPortal(
                <div ref={tooltipRef} className={`tooltip ${placement}`}>
                    {content}
                </div>,
                document.body
            )}
        </div>
    );
};