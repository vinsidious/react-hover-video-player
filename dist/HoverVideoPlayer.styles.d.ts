import React from 'react';
interface SizingModeStyle {
    video: React.CSSProperties | null;
    overlay: React.CSSProperties | null;
    container: React.CSSProperties | null;
    manual: React.CSSProperties | null;
}
export declare const expandToFillContainerStyle: React.CSSProperties;
export declare const containerSizingStyles: SizingModeStyle;
export declare const pausedOverlayWrapperSizingStyles: SizingModeStyle;
export declare const videoSizingStyles: SizingModeStyle;
export declare const overlayTransitionDurationVar = "--hvp-overlay-transition-duration";
export declare const visibleOverlayStyles: React.CSSProperties;
export declare const hiddenOverlayStyles: React.CSSProperties;
export {};
