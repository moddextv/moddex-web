interface SvgIconProps {
    name: string;
    size?: number;
    color?: string;
}

const AvatarIcon: React.FC<SvgIconProps> = ({ size = 32, color = 'var(--color-font-dark' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20">
        <path fill={color} d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"></path>
    </svg>
)

const ClockIcon: React.FC<SvgIconProps> = ({ size = 32, color = 'var(--color-font-medium)' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 512 512">
        <path fill={color} d="M329.372 374.628l-105.372-105.373v-141.255h64v114.745l86.628 86.627zM256 0c-141.385 0-256 114.615-256 256s114.615 256 256 256 256-114.615 256-256-114.615-256-256-256zM256 448c-106.039 0-192-85.961-192-192s85.961-192 192-192c106.039 0 192 85.961 192 192s-85.961 192-192 192z"></path>
    </svg>
);

const CopyIcon: React.FC<SvgIconProps> = ({ size = 32, color = 'var(--color-font-medium)' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 460 460">
        <path fill={color} d="M429.636,0H139.664c-15.655,0-28.346,12.691-28.346,28.347v34.529h209.018c43.2,0,78.347,35.146,78.347,78.347v205.901 h30.954c15.655,0,28.346-12.691,28.346-28.347V28.347C457.982,12.691,445.291,0,429.636,0z"/>
        <path fill={color} d="M320.336,112.876H30.364c-15.655,0-28.347,12.691-28.347,28.347v290.431C2.018,447.309,14.709,460,30.364,460h289.971 c15.655,0,28.347-12.691,28.347-28.347v-290.43C348.682,125.567,335.991,112.876,320.336,112.876z"/>
    </svg>
);

const DiscordIcon: React.FC<SvgIconProps> = ({ size = 32, color = 'var(--color-discord)' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 127.14 96.36">
        <path fill={color} d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
    </svg>
);

const LoadingIcon: React.FC<SvgIconProps> = ({ size = 32, color = 'currentColor' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 200 200">
        <circle strokeWidth="15" r="15" cx="40" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"/></circle>
        <circle strokeWidth="15" r="15" cx="100" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"/></circle>
        <circle strokeWidth="15" r="15" cx="160" cy="100"><animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"/></circle>
    </svg>
);

const SearchIcon: React.FC<SvgIconProps> = ({ size = 32, color = 'currentColor' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 50 50">
        <path fill={color} d="M 21 3 C 11.601563 3 4 10.601563 4 20 C 4 29.398438 11.601563 37 21 37 C 24.355469 37 27.460938 36.015625 30.09375 34.34375 L 42.375 46.625 L 46.625 42.375 L 34.5 30.28125 C 36.679688 27.421875 38 23.878906 38 20 C 38 10.601563 30.398438 3 21 3 Z M 21 7 C 28.199219 7 34 12.800781 34 20 C 34 27.199219 28.199219 33 21 33 C 13.800781 33 8 27.199219 8 20 C 8 12.800781 13.800781 7 21 7 Z"/>
    </svg>
);

const TwitchIcon: React.FC<SvgIconProps> = ({ size = 32, color = 'var(--color-twitch)' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
        <path fill={color} d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z" fillRule="evenodd" clipRule="evenodd"/>
    </svg>
);


const IconDictionary: { [key: string]: React.FC<SvgIconProps> } = {
    'avatar': AvatarIcon,
    'clock': ClockIcon,
    'copy': CopyIcon,
    'discord': DiscordIcon,
    'loading': LoadingIcon,
    'search': SearchIcon,
    'twitch': TwitchIcon
};

export const SvgIcon: React.FC<SvgIconProps> = (props: SvgIconProps) => {
    const SvgComponent = props.name ? IconDictionary[props.name.toLowerCase()] : null;
    return SvgComponent ? <SvgComponent {...props}/> : null;
};