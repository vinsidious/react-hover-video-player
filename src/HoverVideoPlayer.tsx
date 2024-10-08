import React, {
  useRef,
  useImperativeHandle,
  useEffect,
  useState,
  useCallback,
} from "react";
import ReactPlayer from "react-player/youtube";

import {
  expandToFillContainerStyle,
  containerSizingStyles,
  pausedOverlayWrapperSizingStyles,
  videoSizingStyles,
  visibleOverlayStyles,
  hiddenOverlayStyles,
  overlayTransitionDurationVar,
} from "./HoverVideoPlayer.styles";

import { HoverVideoPlayerProps } from "./HoverVideoPlayer.types";

const isYouTubeUrl = (url: string) => {
  return url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/);
};

/**
 * @component HoverVideoPlayer
 * @license MIT
 *
 * @param {HoverVideoPlayerProps} props
 */
export default function HoverVideoPlayer({
  videoSrc,
  videoCaptions = null,
  focused = false,
  disableDefaultEventHandling = false,
  hoverTarget = null,
  onHoverStart = null,
  onHoverEnd = null,
  hoverOverlay = null,
  pausedOverlay = null,
  loadingOverlay = null,
  loadingStateTimeout = 200,
  overlayTransitionDuration = 400,
  playbackStartDelay = 0,
  restartOnPaused = false,
  unloadVideoOnPaused = false,
  playbackRangeStart = null,
  playbackRangeEnd = null,
  muted = true,
  volume = 1,
  loop = true,
  preload = undefined,
  crossOrigin = undefined,
  controls = false,
  controlsList = undefined,
  disableRemotePlayback = true,
  disablePictureInPicture = true,
  style = undefined,
  hoverOverlayWrapperClassName = undefined,
  hoverOverlayWrapperStyle = undefined,
  pausedOverlayWrapperClassName = undefined,
  pausedOverlayWrapperStyle = undefined,
  loadingOverlayWrapperClassName = undefined,
  loadingOverlayWrapperStyle = undefined,
  videoId = undefined,
  videoClassName = undefined,
  videoRef: forwardedVideoRef = null,
  videoStyle = undefined,
  sizingMode = "video",
  ...spreadableProps
}: HoverVideoPlayerProps): JSX.Element {
  // Element refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<ReactPlayer>(null);
  // Forward out local videoRef along to the videoRef prop
  useImperativeHandle(
    forwardedVideoRef,
    () => videoRef.current as HTMLVideoElement
  );

  const isYouTube = typeof videoSrc === "string" && isYouTubeUrl(videoSrc);

  // Effects set attributes on the video which can't be done via props
  useEffect(() => {
    // Manually setting the `muted` attribute on the video element via an effect in order
    // to avoid a know React issue with the `muted` prop not applying correctly on initial render
    // https://github.com/facebook/react/issues/10389
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);
  useEffect(() => {
    // Set the video's volume to match the `volume` prop
    // Note that this will have no effect if the `muted` prop is set to true
    if (videoRef.current) videoRef.current.volume = volume;
  }, [volume]);
  // React does not support directly setting disableRemotePlayback or disablePictureInPicture directly
  // via the video element's props, so we have to manually set them in an effect
  useEffect(() => {
    if (videoRef.current)
      videoRef.current.disableRemotePlayback = disableRemotePlayback;
  }, [disableRemotePlayback]);
  useEffect(() => {
    if (videoRef.current)
      videoRef.current.disablePictureInPicture = disablePictureInPicture;
  }, [disablePictureInPicture]);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement && playbackRangeStart) {
      videoElement.currentTime = playbackRangeStart;
    }
  }, [playbackRangeStart]);

  const [hoverTargetElement, setHoverTargetElement] = useState<Node | null>(
    null
  );

  useEffect(() => {
    // Default to the container element unless a hoverTarget prop is provided
    let element: Node | null = containerRef.current;

    if (hoverTarget) {
      // Get the hover target element from the hoverTarget prop, or default to the component's container div
      // A `hoverTarget` value could be a function, a DOM element, or a React ref, so
      // figure out which one it is and get the hover target element out of it accordingly
      if (typeof hoverTarget === "function") {
        element = hoverTarget();
      } else if (hoverTarget instanceof Node) {
        element = hoverTarget;
      } else if (hoverTarget && hoverTarget.hasOwnProperty("current")) {
        element = hoverTarget.current;
      } else {
        console.error(
          "HoverVideoPlayer was unable to get a usable hover target element. Please check your usage of the `hoverTarget` prop."
        );
      }
    }

    setHoverTargetElement(element);
  }, [hoverTarget]);

  // Keep a ref for the time which the video should be started from next time it is played
  // This is useful if the video gets unloaded and we want to restore it to the time it was
  // at before if the user tries playing it again
  const nextVideoStartTimeRef = useRef<number | null>(null);

  // Whether the user is hovering over the hover target, meaning we should be trying to play the video
  const [isHovering, setIsHovering] = useState(false);
  // Whether the video is currently in a loading state, meaning it's not ready to be played yet
  const [isLoading, setIsLoading] = useState(false);
  // Whether the video is currently playing or not
  const [isPlaying, setIsPlaying] = useState(false);

  const isHoveringRef = useRef<boolean>();
  isHoveringRef.current = isHovering;

  const playTimeoutRef = useRef<number | undefined>();
  const pauseTimeoutRef = useRef<number | undefined>();

  const cancelTimeouts = useCallback(() => {
    // Cancel any previously active pause or playback attempts
    window.clearTimeout(playTimeoutRef.current);
    window.clearTimeout(pauseTimeoutRef.current);
  }, []);

  const hasPausedOverlay = Boolean(pausedOverlay);
  const hasHoverOverlay = Boolean(hoverOverlay);

  // If we have a paused or hover overlay, the player should wait
  // for the overlay(s) to finish transitioning back in before we
  // pause the video
  const shouldWaitForOverlayTransitionBeforePausing =
    hasPausedOverlay || hasHoverOverlay;

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!hoverTargetElement || !videoElement) return undefined;

    const onHoverStart = () => {
      // Bail out if we're already hovering
      if (isHoveringRef.current) return;

      // Cancel any previously active pause or playback attempts
      cancelTimeouts();

      setIsHovering(true);
    };
    const onHoverEnd = () => {
      cancelTimeouts();

      setIsHovering(false);
    };

    hoverTargetElement.addEventListener("hvp:hoverStart", onHoverStart);
    hoverTargetElement.addEventListener("hvp:hoverEnd", onHoverEnd);

    return () => {
      hoverTargetElement.removeEventListener("hvp:hoverStart", onHoverStart);
      hoverTargetElement.removeEventListener("hvp:hoverEnd", onHoverEnd);
    };
  }, [
    cancelTimeouts,
    hoverTargetElement,
    overlayTransitionDuration,
    playbackRangeStart,
    restartOnPaused,
    shouldWaitForOverlayTransitionBeforePausing,
  ]);

  const playVideo = useCallback(() => {
    if (isYouTube) {
      playerRef.current?.seekTo(playbackRangeStart || 0);
      playerRef.current?.getInternalPlayer().playVideo();
    } else {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      videoElement.play().catch((error: DOMException) => {
        // Suppress logging for "AbortError" errors, which are thrown when the video is paused while it was trying to play.
        // These errors are expected and happen often, so they can be safely ignored.
        if (error.name === "AbortError") {
          return;
        }

        // Additional handling for when browsers block playback for unmuted videos.
        // This is unfortunately necessary because most modern browsers do not allow playing videos with audio
        //  until the user has "interacted" with the page by clicking somewhere at least once; mouseenter events
        //  don't count.
        // If the video isn't muted and playback failed with a `NotAllowedError`, this means the browser blocked
        // playing the video because the user hasn't clicked anywhere on the page yet.
        if (!videoElement.muted && error.name === "NotAllowedError") {
          console.warn(
            "HoverVideoPlayer: Playback with sound was blocked by the browser. Attempting to play again with the video muted; audio will be restored if the user clicks on the page."
          );
          // Mute the video and attempt to play again
          videoElement.muted = true;
          playVideo();

          // When the user clicks on the document, unmute the video since we should now
          // be free to play audio
          const onClickDocument = () => {
            videoElement.muted = false;

            // Clean up the event listener so it is only fired once
            document.removeEventListener("click", onClickDocument);
          };
          document.addEventListener("click", onClickDocument);
        } else {
          // Log any other playback errors with console.error
          console.error(`HoverVideoPlayer: ${error.message}`);
        }
      });
    }
  }, [isYouTube, playbackRangeStart]);

  // Effect attempts to start playing the video if the user is hovering over the hover target
  // and the video is loaded enough to be played
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isHovering && !isLoading && !isPlaying) {
      if (
        nextVideoStartTimeRef.current !== null &&
        videoElement.currentTime !== nextVideoStartTimeRef.current
      ) {
        videoElement.currentTime = nextVideoStartTimeRef.current;
      }

      if (playbackStartDelay) {
        playTimeoutRef.current = window.setTimeout(
          playVideo,
          playbackStartDelay
        );
      } else {
        playVideo();
      }
    }
  }, [isHovering, isLoading, isPlaying, playVideo, playbackStartDelay]);

  // Effect pauses the video if the user is no longer hovering over the hover target
  // and the video is currently playing
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (!isHovering && (isPlaying || isLoading)) {
      const pauseVideo = () => {
        if (isYouTube) {
          playerRef.current?.getInternalPlayer().pauseVideo();
        } else {
          videoElement.pause();
        }

        // Performing post-save cleanup tasks in here rather than the onPause listener
        // because onPause can also be called when the video reaches the end of a playback range
        // and it's just simpler to deal with that separately
        if (restartOnPaused) {
          if (isYouTube) {
            playerRef.current?.seekTo(playbackRangeStart || 0);
          } else {
            videoElement.currentTime = playbackRangeStart || 0;
          }
        }
        nextVideoStartTimeRef.current = isYouTube
          ? playerRef.current?.getCurrentTime()!
          : videoElement.currentTime;
      };

      if (shouldWaitForOverlayTransitionBeforePausing) {
        // If we have a paused overlay, the player should wait
        // for the overlay(s) to finish transitioning back in before we
        // pause the video
        pauseTimeoutRef.current = window.setTimeout(
          pauseVideo,
          overlayTransitionDuration
        );
      } else {
        pauseVideo();
      }
    }
  }, [
    isHovering,
    isLoading,
    isPlaying,
    overlayTransitionDuration,
    playbackRangeStart,
    restartOnPaused,
    shouldWaitForOverlayTransitionBeforePausing,
    isYouTube,
  ]);

  // Effect cancels any pending timeouts when the component unmounts
  useEffect(() => () => cancelTimeouts(), [cancelTimeouts]);

  // Keeping hover callbacks as refs because we want to be able to access them from within our
  // onHoverStart and onHoverEnd event listeners without needing to re-run the
  // event setup effect every time they change
  const onHoverStartCallbackRef = useRef<typeof onHoverStart>();
  onHoverStartCallbackRef.current = onHoverStart;

  const onHoverEndCallbackRef = useRef<typeof onHoverEnd>();
  onHoverEndCallbackRef.current = onHoverEnd;

  // Effect sets up event listeners for hover events on hover target
  useEffect(() => {
    // If default event handling is disabled, we shouldn't check for touch events outside of the player
    if (disableDefaultEventHandling || !hoverTargetElement) return undefined;

    const onHoverStart = () => {
      hoverTargetElement.dispatchEvent(new Event("hvp:hoverStart"));
      onHoverStartCallbackRef.current?.();
    };
    const onHoverEnd = () => {
      hoverTargetElement.dispatchEvent(new Event("hvp:hoverEnd"));
      onHoverEndCallbackRef.current?.();
    };

    // Mouse events
    hoverTargetElement.addEventListener("mouseenter", onHoverStart);
    hoverTargetElement.addEventListener("mouseleave", onHoverEnd);

    // Focus/blur
    hoverTargetElement.addEventListener("focus", onHoverStart);
    hoverTargetElement.addEventListener("blur", onHoverEnd);

    // Touch events
    const touchStartListenerOptions = { passive: true };

    hoverTargetElement.addEventListener(
      "touchstart",
      onHoverStart,
      touchStartListenerOptions
    );
    // Event listener pauses the video when the user touches somewhere outside of the player
    const onWindowTouchStart = (event: TouchEvent) => {
      if (
        !(event.target instanceof Node) ||
        !hoverTargetElement.contains(event.target)
      ) {
        onHoverEnd();
      }
    };

    window.addEventListener(
      "touchstart",
      onWindowTouchStart,
      touchStartListenerOptions
    );

    // Return a cleanup function that removes all event listeners
    return () => {
      hoverTargetElement.removeEventListener("mouseenter", onHoverStart);
      hoverTargetElement.removeEventListener("mouseleave", onHoverEnd);
      hoverTargetElement.removeEventListener("focus", onHoverStart);
      hoverTargetElement.removeEventListener("blur", onHoverEnd);
      hoverTargetElement.removeEventListener("touchstart", onHoverStart);
      window.removeEventListener("touchstart", onWindowTouchStart);
    };
  }, [disableDefaultEventHandling, hoverTargetElement]);

  // Defaulting the ref to false rather than the initial value of the focused prop because
  // if focused is true initially, we want to run the effect, but if it's false, we don't
  const previousFocusedRef = useRef<boolean>(false);

  // Effect dispatches hover start/end events on the target element when the focused prop changes
  useEffect(() => {
    if (!hoverTargetElement) return;

    if (previousFocusedRef.current !== focused) {
      previousFocusedRef.current = focused;

      if (focused) {
        hoverTargetElement.dispatchEvent(new Event("hvp:hoverStart"));
      } else {
        hoverTargetElement.dispatchEvent(new Event("hvp:hoverEnd"));
      }
    }
  }, [hoverTargetElement, focused]);

  const currentVideoSrc = useRef(videoSrc);
  let shouldReloadVideoSrc = false;
  if (videoSrc !== currentVideoSrc.current && !isHovering && !isPlaying) {
    currentVideoSrc.current = videoSrc;
    shouldReloadVideoSrc = true;
  }

  const hasStringSrc = typeof currentVideoSrc.current === "string";

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (shouldReloadVideoSrc) {
      // If the video element doesn't have a loaded source or the source has changed since the
      // last time we played the video, make sure to force the video to load the most up-to-date sources
      videoElement.load();
      // Reset the next start time to the start of the video
      nextVideoStartTimeRef.current = playbackRangeStart || 0;
    }
  }, [playbackRangeStart, shouldReloadVideoSrc]);

  // If the video's sources should be unloaded when it's paused and the video is not currently active, we can unload the video's sources.
  // We will remove the video's <source> tags in this render and then call video.load() in an effect to
  // fully unload the video
  const shouldUnloadVideo = unloadVideoOnPaused && !isHovering && !isPlaying;

  useEffect(() => {
    if (shouldUnloadVideo) {
      // Re-load the video with the sources removed so we unload everything from memory
      videoRef.current?.load();
    }
  }, [shouldUnloadVideo]);

  const shouldShowLoadingOverlay = isHovering && !isPlaying;
  // Show a paused overlay when the user isn't hovering or when the user is hovering
  // but the video is still loading
  const shouldShowPausedOverlay = !isHovering || (isHovering && !isPlaying);

  const isUsingPlaybackRange =
    playbackRangeStart !== null || playbackRangeEnd !== null;

  const hasLoadingOverlay = Boolean(loadingOverlay);

  return (
    <div
      ref={containerRef}
      style={{
        [overlayTransitionDurationVar as string]: `${overlayTransitionDuration}ms`,
        ...containerSizingStyles[sizingMode],
        position: "relative",
        ...style,
      }}
      {...spreadableProps}
    >
      {hasPausedOverlay ? (
        <div
          style={{
            ...pausedOverlayWrapperSizingStyles[sizingMode],
            zIndex: 1,
            ...(shouldShowPausedOverlay
              ? visibleOverlayStyles
              : hiddenOverlayStyles),
            ...pausedOverlayWrapperStyle,
          }}
          className={pausedOverlayWrapperClassName}
        >
          {pausedOverlay}
        </div>
      ) : null}
      {hasLoadingOverlay ? (
        <div
          style={{
            ...expandToFillContainerStyle,
            zIndex: 2,
            transitionDelay: loadingStateTimeout
              ? `${loadingStateTimeout}ms`
              : undefined,
            ...(shouldShowLoadingOverlay
              ? visibleOverlayStyles
              : hiddenOverlayStyles),
            ...loadingOverlayWrapperStyle,
          }}
          className={loadingOverlayWrapperClassName}
        >
          {loadingOverlay}
        </div>
      ) : null}
      {hasHoverOverlay ? (
        <div
          style={{
            ...expandToFillContainerStyle,
            zIndex: 3,
            // Show the hover overlay when the player is hovered/playing
            ...(isHovering ? visibleOverlayStyles : hiddenOverlayStyles),
            ...hoverOverlayWrapperStyle,
          }}
          className={hoverOverlayWrapperClassName}
        >
          {hoverOverlay}
        </div>
      ) : null}
      {isYouTube ? (
        <ReactPlayer
          ref={playerRef}
          url={videoSrc as string}
          width="100%"
          height="100%"
          playing={isPlaying}
          muted={muted}
          volume={volume}
          loop={loop}
          onReady={() => setIsLoading(false)}
          onBuffer={() => setIsLoading(true)}
          onBufferEnd={() => setIsLoading(false)}
          config={{ playerVars: { controls: controls ? 1 : 0 } }}
        />
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={
            hasStringSrc && !shouldUnloadVideo
              ? (currentVideoSrc.current as string)
              : undefined
          }
          // If a playback range is set, the loop attribute will not work correctly so there's no point in setting it here;
          // in that case, we will manually implement this behavior
          loop={isUsingPlaybackRange ? false : loop}
          playsInline
          preload={preload}
          crossOrigin={crossOrigin}
          ref={videoRef}
          style={{
            ...videoSizingStyles[sizingMode],
            objectFit: "cover",
            ...videoStyle,
          }}
          controls={controls}
          controlsList={controlsList}
          className={videoClassName}
          id={videoId}
          onPlaying={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          // Update state when the video starts loading
          onLoadStart={() => setIsLoading(true)}
          // Update that we're no longer loading when the video has suspended loading data
          onSuspend={() => setIsLoading(false)}
          // Update that we are loading if the video is waiting for data to continue playing
          onWaiting={() => setIsLoading(true)}
          onLoadedData={() => {
            // As video data is loaded, check if we've loaded enough data to start playing the video
            // and update state accordingly
            setIsLoading(
              (videoRef.current?.readyState || 0) <
                HTMLMediaElement.HAVE_ENOUGH_DATA
            );
          }}
          onAbort={() => {
            // If loading is aborted, update state
            setIsLoading(false);
          }}
          onTimeUpdate={
            // If there's a playback range set, the traditional `loop` video prop won't work correctly so
            // we'll need watch the video's time as it plays and manually keep it within the bounds of the range
            isUsingPlaybackRange
              ? () => {
                  const videoElement = videoRef.current;
                  if (!videoElement) return;

                  const maxVideoTime =
                    playbackRangeEnd || videoElement.duration;
                  const minVideoTime = playbackRangeStart || 0;

                  const { currentTime } = videoElement;

                  if (loop && currentTime >= maxVideoTime) {
                    // If the video should loop and is >= the max video time,
                    // loop it back around to the start
                    const startTime = playbackRangeStart || 0;
                    videoElement.currentTime = startTime;

                    // If the video is paused but the user is still hovering,
                    // meaning it should continue to play, call play() to keep it going
                    if (
                      isHovering &&
                      (videoElement.paused || videoElement.ended)
                    ) {
                      playVideo();
                    }
                  } else if (currentTime > maxVideoTime) {
                    // If the video shouldn't loop but we've exceeded the max video time,
                    // clamp it to the max time and pause it
                    videoElement.pause();
                    videoElement.currentTime = maxVideoTime;
                  } else if (currentTime < minVideoTime) {
                    // If the video's time somehow ended up before the min video time,
                    // clamp it to the min time
                    videoElement.currentTime = minVideoTime;
                  }
                }
              : undefined
          }
        >
          {shouldUnloadVideo || hasStringSrc ? null : currentVideoSrc.current}
          {videoCaptions}
        </video>
      )}
    </div>
  );
}
