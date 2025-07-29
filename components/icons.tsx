import React from 'react';

// Common interface for icon components
interface IconProps {
    className?: string;
}

export const UploadIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['mx-auto h-12 w-12 text-gray-500', className].filter(Boolean).join(' ')} stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const LogoIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['h-8 w-8 text-blue-500', className].filter(Boolean).join(' ')} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z" />
        <path d="M3 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z" />
    </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['h-6 w-6', className].filter(Boolean).join(' ')} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
        <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
        <path d="M16 5l3 3" />
    </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['h-6 w-6', className].filter(Boolean).join(' ')} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M5 12l5 5l10 -10" />
    </svg>
);

export const AIGeneratedIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['h-6 w-6 text-purple-400 flex-shrink-0', className].filter(Boolean).join(' ')} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 12h1" />
        <path d="M19 12h1" />
        <path d="M12 4v1" />
        <path d="M12 19v1" />
        <path d="M17.657 6.343l-.707 .707" />
        <path d="M6.343 17.657l-.707 .707" />
        <path d="M17.657 17.657l-.707 -.707" />
        <path d="M6.343 6.343l-.707 -.707" />
        <path d="M9 16l-1 -1l-4 4" />
        <path d="M15 16l1 -1l4 4" />
    </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['h-6 w-6 text-blue-400 flex-shrink-0', className].filter(Boolean).join(' ')} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
        <path d="M21 21l-6 -6" />
    </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['h-6 w-6 text-white', className].filter(Boolean).join(' ')} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
);

export const PauseIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['h-6 w-6 text-white', className].filter(Boolean).join(' ')} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

export const ReplayIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['h-6 w-6 text-white', className].filter(Boolean).join(' ')} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
    </svg>
);

export const BackIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['h-6 w-6 text-white', className].filter(Boolean).join(' ')} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M9 11l-4 4l4 4m-4 -4h11a4 4 0 0 0 0 -8h-1" />
    </svg>
);

export const FlipIcon: React.FC<IconProps> = ({ className }) => <svg className={['h-5 w-5', className].filter(Boolean).join(' ')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l-6 6h12l-6-6zm0 18l-6-6h12l-6 6z"/><path d="M3 12h18"/></svg>;
export const RotateIcon: React.FC<IconProps> = ({ className }) => <svg className={['h-5 w-5', className].filter(Boolean).join(' ')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>;
export const ScaleIcon: React.FC<IconProps> = ({ className }) => <svg className={['h-5 w-5', className].filter(Boolean).join(' ')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/><path d="M10 10V3L3 3"/></svg>;
export const MoveIcon: React.FC<IconProps> = ({ className }) => <svg className={['h-5 w-5', className].filter(Boolean).join(' ')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12h14"/></svg>;

export const GenerateIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['h-6 w-6', className].filter(Boolean).join(' ')} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
       <path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7" />
       <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 1 -3" />
       <path d="M9.7 17.4l1.3 -1.4" />
       <path d="M13.7 17.4l-1.3 -1.4" />
    </svg>
);

export const TextIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={['h-6 w-6 text-green-400 flex-shrink-0', className].filter(Boolean).join(' ')} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
        <path d="M13.5 6.5l4 4" />
    </svg>
);
