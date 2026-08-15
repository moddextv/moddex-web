interface SvgIconProps {
  size?: number;
  color?: string;
}

import { FC } from 'react';

export const DiscordIcon: FC<SvgIconProps> = ({ size = 32, color = 'text-discord' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z"
    />
  </svg>
);

export const ExternalLinkIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`${color} ml-1 scale-50 md:scale-80`}
    width={size}
    height={size}
    fill="none"
    shapeRendering="geometricPrecision"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <g stroke="currentColor">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
      <path d="M15 3h6v6"></path>
      <path d="M10 14L21 3"></path>
    </g>
  </svg>
);

export const ArrowRightIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2.25"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <g stroke="currentColor">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </g>
  </svg>
);

export const CopyIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.75"
  >
    <g stroke="currentColor">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </g>
  </svg>
);

export const CheckIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="currentColor" d="m5 13 4 4L19 7" />
  </svg>
);

export const ChevronDownIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="3"
    strokeLinecap="round"
  >
    <path stroke="currentColor" d="m6 9 6 6 6-6" />
  </svg>
);

export const ReloadIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.5"
  >
    <g stroke="currentColor">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </g>
  </svg>
);

export const SunIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.5"
    strokeLinecap="round"
  >
    <g stroke="currentColor">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </g>
  </svg>
);

export const MoonIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <g stroke="currentColor">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </g>
  </svg>
);

export const SearchIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <g stroke="currentColor">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </g>
  </svg>
);

export const TwitchIcon: FC<SvgIconProps> = ({ size = 32, color = 'text-twitch' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);
