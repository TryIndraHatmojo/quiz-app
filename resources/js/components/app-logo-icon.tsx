import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className,
    src = "/images/Logo-SMP-Al-Falah-Terbaru-24-25.png",
    alt = "App Logo",
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src={src}
            alt={alt}
            {...props}
            className={`object-contain ${className || ''}`}
        />
    );
}
