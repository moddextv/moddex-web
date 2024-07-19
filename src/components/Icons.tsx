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

export const CheckIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path stroke="currentColor" d="M20 6 9 17l-5-5" />
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
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 9.5 16" />
  </svg>
);

export const CloseIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
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
    className={`${color} ml-1 scale-80`}
    width={size}
    height={size}
    fill="none"
    shapeRendering="geometricPrecision"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
    ></path>
    <path stroke="currentColor" d="M15 3h6v6"></path>
    <path stroke="currentColor" d="M10 14L21 3"></path>
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
    strokeWidth="1"
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

export const MoonIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  >
    <path stroke="currentColor" d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
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

export const SunIcon: FC<SvgIconProps> = ({ size = 32, color = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={color}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
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
