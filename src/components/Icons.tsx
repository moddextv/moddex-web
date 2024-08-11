interface SvgIconProps {
  size?: number;
  color?: string;
}

import { FC } from 'react';

export const AvatarIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 20 20"
  >
    <path
      fill="currentColor"
      d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"
    ></path>
  </svg>
);

export const ClockIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 9.5 16" />
  </svg>
);

export const DiscordIcon: FC<SvgIconProps> = ({
  size = 32,
  color = 'text-discord'
}) => (
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

export const ExternalLinkIcon: FC<SvgIconProps> = ({
  size = 32,
  color = ''
}) => (
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

export const FilterIcon: FC<SvgIconProps> = ({
  size = 32,
  color = ''
}) => (
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
    <polygon stroke="currentColor" points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const HeartIcon: FC<SvgIconProps> = ({ size = 32, color = ''}) => (
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </g>
  </svg>
);

export const LoadingIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 200 200"
  >
    <g fill="currentColor">
      <circle strokeWidth="15" r="15" cx="40" cy="100">
        <animate
          attributeName="opacity"
          calcMode="spline"
          dur="2"
          values="1;0;1;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="-.4"
        />
      </circle>
      <circle strokeWidth="15" r="15" cx="100" cy="100">
        <animate
          attributeName="opacity"
          calcMode="spline"
          dur="2"
          values="1;0;1;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="-.2"
        />
      </circle>
      <circle strokeWidth="15" r="15" cx="160" cy="100">
        <animate
          attributeName="opacity"
          calcMode="spline"
          dur="2"
          values="1;0;1;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="0"
        />
      </circle>
    </g>
  </svg>
);

export const MenuIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </g>
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

export const SortAZIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <g stroke="currentColor">
      <path d="m3 16 4 4 4-4" />
      <path d="M7 20V4" />
      <path d="M20 8h-5" />
      <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10" />
      <path d="M15 14h5l-5 6h5" />
    </g>
  </svg>
);

export const SortZAIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <g stroke="currentColor">
      <path d="m3 8 4-4 4 4" />
      <path d="M7 4v16" />
      <path d="M15 4h5l-5 6h5" />
      <path d="M15 20v-3.5a2.5 2.5 0 0 1 5 0V20" />
      <path d="M20 18h-5" />
    </g>
  </svg>
);

export const Sort01Icon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <g stroke="currentColor">
      <path d="m3 16 4 4 4-4" />
      <path d="M7 20V4" />
      <rect x="15" y="4" width="4" height="6" ry="2" />
      <path d="M17 20v-6h-2" />
      <path d="M15 20h4" />
    </g>
  </svg>
);

export const Sort10Icon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <g stroke="currentColor">
      <path d="m3 8 4-4 4 4" />
      <path d="M7 4v16" />
      <path d="M17 10V4h-2" />
      <path d="M15 10h4" />
      <rect x="15" y="14" width="4" height="6" ry="2" />
    </g>
  </svg>
);

export const SortOldNewIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <g stroke="currentColor">
      <path d="m14 18 4-4 4 4" />
      <path d="M16 2v4" />
      <path d="M18 22v-8" />
      <path d="M21 11.343V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
    </g>
  </svg>
);

export const SortNewOldIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <g stroke="currentColor">
      <path d="m14 18 4 4 4-4" />
      <path d="M16 2v4" />
      <path d="M18 14v8" />
      <path d="M21 11.354V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7.343" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
    </g>
  </svg>
);

export const TwitchIcon: FC<SvgIconProps> = ({
  size = 32,
  color = 'text-twitch'
}) => (
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

export const UsersIcon: FC<SvgIconProps> = ({
  size = 32,
  color = ''
}) => (
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </g>
  </svg>
);
