"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  default: () => HoverVideoPlayer
});
module.exports = __toCommonJS(src_exports);

// src/HoverVideoPlayer.tsx
var import_react = __toESM(require("react"));
var import_youtube = __toESM(require("react-player/youtube"));

// src/HoverVideoPlayer.styles.ts
var expandToFillContainerStyle = {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
};
var containerMatchContentDimensionsStyle = {
  display: "inline-block"
};
var containerSizingStyles = {
  video: containerMatchContentDimensionsStyle,
  overlay: containerMatchContentDimensionsStyle,
  container: null,
  manual: null
};
var pausedOverlayWrapperSizingStyles = {
  // Sizing should be based on the video element, so make the overlay
  // expand to cover the player's container element
  video: expandToFillContainerStyle,
  // Sizing should be based on the paused overlay, so set position: relative
  // to make it occupy space in the document flow
  overlay: {
    position: "relative"
  },
  // Sizing should be based on the player's container element, so make the overlay
  // expand to cover it
  container: expandToFillContainerStyle,
  // Don't apply any preset styling to the overlay
  manual: null
};
var videoSizingStyles = {
  // Sizing should be based on the video element, so set display: block
  // to make sure it occupies space in the document flow
  video: {
    display: "block",
    // Ensure the video is sized relative to the container's width
    // rather than the video asset's native width
    width: "100%"
  },
  // Make the video element expand to cover the container if we're sizing
  // based on the overlay or container
  overlay: expandToFillContainerStyle,
  container: expandToFillContainerStyle,
  // Don't apply any preset styling to the video
  manual: null
};
var overlayTransitionDurationVar = "--hvp-overlay-transition-duration";
var visibleOverlayStyles = {
  visibility: "visible",
  opacity: 1,
  transitionProperty: "opacity",
  transitionDuration: `var(${overlayTransitionDurationVar})`
};
var hiddenOverlayStyles = {
  visibility: "hidden",
  opacity: 0,
  transitionProperty: "opacity, visibility",
  transitionDuration: `var(${overlayTransitionDurationVar}), 0s`,
  transitionDelay: `0s, var(${overlayTransitionDurationVar})`
};

// src/HoverVideoPlayer.tsx
var isYouTubeUrl = (url) => {
  return url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/);
};
function HoverVideoPlayer(_a) {
  var _b = _a, {
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
    preload = void 0,
    crossOrigin = void 0,
    controls = false,
    controlsList = void 0,
    disableRemotePlayback = true,
    disablePictureInPicture = true,
    style = void 0,
    hoverOverlayWrapperClassName = void 0,
    hoverOverlayWrapperStyle = void 0,
    pausedOverlayWrapperClassName = void 0,
    pausedOverlayWrapperStyle = void 0,
    loadingOverlayWrapperClassName = void 0,
    loadingOverlayWrapperStyle = void 0,
    videoId = void 0,
    videoClassName = void 0,
    videoRef: forwardedVideoRef = null,
    videoStyle = void 0,
    sizingMode = "video"
  } = _b, spreadableProps = __objRest(_b, [
    "videoSrc",
    "videoCaptions",
    "focused",
    "disableDefaultEventHandling",
    "hoverTarget",
    "onHoverStart",
    "onHoverEnd",
    "hoverOverlay",
    "pausedOverlay",
    "loadingOverlay",
    "loadingStateTimeout",
    "overlayTransitionDuration",
    "playbackStartDelay",
    "restartOnPaused",
    "unloadVideoOnPaused",
    "playbackRangeStart",
    "playbackRangeEnd",
    "muted",
    "volume",
    "loop",
    "preload",
    "crossOrigin",
    "controls",
    "controlsList",
    "disableRemotePlayback",
    "disablePictureInPicture",
    "style",
    "hoverOverlayWrapperClassName",
    "hoverOverlayWrapperStyle",
    "pausedOverlayWrapperClassName",
    "pausedOverlayWrapperStyle",
    "loadingOverlayWrapperClassName",
    "loadingOverlayWrapperStyle",
    "videoId",
    "videoClassName",
    "videoRef",
    "videoStyle",
    "sizingMode"
  ]);
  const containerRef = (0, import_react.useRef)(null);
  const videoRef = (0, import_react.useRef)(null);
  const playerRef = (0, import_react.useRef)(null);
  (0, import_react.useImperativeHandle)(
    forwardedVideoRef,
    () => videoRef.current
  );
  const isYouTube = typeof videoSrc === "string" && isYouTubeUrl(videoSrc);
  (0, import_react.useEffect)(() => {
    if (videoRef.current)
      videoRef.current.muted = muted;
  }, [muted]);
  (0, import_react.useEffect)(() => {
    if (videoRef.current)
      videoRef.current.volume = volume;
  }, [volume]);
  (0, import_react.useEffect)(() => {
    if (videoRef.current)
      videoRef.current.disableRemotePlayback = disableRemotePlayback;
  }, [disableRemotePlayback]);
  (0, import_react.useEffect)(() => {
    if (videoRef.current)
      videoRef.current.disablePictureInPicture = disablePictureInPicture;
  }, [disablePictureInPicture]);
  (0, import_react.useEffect)(() => {
    const videoElement = videoRef.current;
    if (videoElement && playbackRangeStart) {
      videoElement.currentTime = playbackRangeStart;
    }
  }, [playbackRangeStart]);
  const [hoverTargetElement, setHoverTargetElement] = (0, import_react.useState)(
    null
  );
  (0, import_react.useEffect)(() => {
    let element = containerRef.current;
    if (hoverTarget) {
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
  const nextVideoStartTimeRef = (0, import_react.useRef)(null);
  const [isHovering, setIsHovering] = (0, import_react.useState)(false);
  const [isLoading, setIsLoading] = (0, import_react.useState)(false);
  const [isPlaying, setIsPlaying] = (0, import_react.useState)(false);
  const isHoveringRef = (0, import_react.useRef)();
  isHoveringRef.current = isHovering;
  const playTimeoutRef = (0, import_react.useRef)();
  const pauseTimeoutRef = (0, import_react.useRef)();
  const cancelTimeouts = (0, import_react.useCallback)(() => {
    window.clearTimeout(playTimeoutRef.current);
    window.clearTimeout(pauseTimeoutRef.current);
  }, []);
  const hasPausedOverlay = Boolean(pausedOverlay);
  const hasHoverOverlay = Boolean(hoverOverlay);
  const shouldWaitForOverlayTransitionBeforePausing = hasPausedOverlay || hasHoverOverlay;
  (0, import_react.useEffect)(() => {
    const videoElement = videoRef.current;
    if (!hoverTargetElement || !videoElement)
      return void 0;
    const onHoverStart2 = () => {
      if (isHoveringRef.current)
        return;
      cancelTimeouts();
      setIsHovering(true);
    };
    const onHoverEnd2 = () => {
      cancelTimeouts();
      setIsHovering(false);
    };
    hoverTargetElement.addEventListener("hvp:hoverStart", onHoverStart2);
    hoverTargetElement.addEventListener("hvp:hoverEnd", onHoverEnd2);
    return () => {
      hoverTargetElement.removeEventListener("hvp:hoverStart", onHoverStart2);
      hoverTargetElement.removeEventListener("hvp:hoverEnd", onHoverEnd2);
    };
  }, [
    cancelTimeouts,
    hoverTargetElement,
    overlayTransitionDuration,
    playbackRangeStart,
    restartOnPaused,
    shouldWaitForOverlayTransitionBeforePausing
  ]);
  const playVideo = (0, import_react.useCallback)(() => {
    var _a2, _b2;
    if (isYouTube) {
      (_a2 = playerRef.current) == null ? void 0 : _a2.seekTo(playbackRangeStart || 0);
      (_b2 = playerRef.current) == null ? void 0 : _b2.getInternalPlayer().playVideo();
    } else {
      const videoElement = videoRef.current;
      if (!videoElement)
        return;
      videoElement.play().catch((error) => {
        if (error.name === "AbortError") {
          return;
        }
        if (!videoElement.muted && error.name === "NotAllowedError") {
          console.warn(
            "HoverVideoPlayer: Playback with sound was blocked by the browser. Attempting to play again with the video muted; audio will be restored if the user clicks on the page."
          );
          videoElement.muted = true;
          playVideo();
          const onClickDocument = () => {
            videoElement.muted = false;
            document.removeEventListener("click", onClickDocument);
          };
          document.addEventListener("click", onClickDocument);
        } else {
          console.error(`HoverVideoPlayer: ${error.message}`);
        }
      });
    }
  }, [isYouTube, playbackRangeStart]);
  (0, import_react.useEffect)(() => {
    const videoElement = videoRef.current;
    if (!videoElement)
      return;
    if (isHovering && !isLoading && !isPlaying) {
      if (nextVideoStartTimeRef.current !== null && videoElement.currentTime !== nextVideoStartTimeRef.current) {
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
  (0, import_react.useEffect)(() => {
    const videoElement = videoRef.current;
    if (!videoElement)
      return;
    if (!isHovering && (isPlaying || isLoading)) {
      const pauseVideo = () => {
        var _a2, _b2, _c;
        if (isYouTube) {
          (_a2 = playerRef.current) == null ? void 0 : _a2.getInternalPlayer().pauseVideo();
        } else {
          videoElement.pause();
        }
        if (restartOnPaused) {
          if (isYouTube) {
            (_b2 = playerRef.current) == null ? void 0 : _b2.seekTo(playbackRangeStart || 0);
          } else {
            videoElement.currentTime = playbackRangeStart || 0;
          }
        }
        nextVideoStartTimeRef.current = isYouTube ? (_c = playerRef.current) == null ? void 0 : _c.getCurrentTime() : videoElement.currentTime;
      };
      if (shouldWaitForOverlayTransitionBeforePausing) {
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
    isYouTube
  ]);
  (0, import_react.useEffect)(() => () => cancelTimeouts(), [cancelTimeouts]);
  const onHoverStartCallbackRef = (0, import_react.useRef)();
  onHoverStartCallbackRef.current = onHoverStart;
  const onHoverEndCallbackRef = (0, import_react.useRef)();
  onHoverEndCallbackRef.current = onHoverEnd;
  (0, import_react.useEffect)(() => {
    if (disableDefaultEventHandling || !hoverTargetElement)
      return void 0;
    const onHoverStart2 = () => {
      var _a2;
      hoverTargetElement.dispatchEvent(new Event("hvp:hoverStart"));
      (_a2 = onHoverStartCallbackRef.current) == null ? void 0 : _a2.call(onHoverStartCallbackRef);
    };
    const onHoverEnd2 = () => {
      var _a2;
      hoverTargetElement.dispatchEvent(new Event("hvp:hoverEnd"));
      (_a2 = onHoverEndCallbackRef.current) == null ? void 0 : _a2.call(onHoverEndCallbackRef);
    };
    hoverTargetElement.addEventListener("mouseenter", onHoverStart2);
    hoverTargetElement.addEventListener("mouseleave", onHoverEnd2);
    hoverTargetElement.addEventListener("focus", onHoverStart2);
    hoverTargetElement.addEventListener("blur", onHoverEnd2);
    const touchStartListenerOptions = { passive: true };
    hoverTargetElement.addEventListener(
      "touchstart",
      onHoverStart2,
      touchStartListenerOptions
    );
    const onWindowTouchStart = (event) => {
      if (!(event.target instanceof Node) || !hoverTargetElement.contains(event.target)) {
        onHoverEnd2();
      }
    };
    window.addEventListener(
      "touchstart",
      onWindowTouchStart,
      touchStartListenerOptions
    );
    return () => {
      hoverTargetElement.removeEventListener("mouseenter", onHoverStart2);
      hoverTargetElement.removeEventListener("mouseleave", onHoverEnd2);
      hoverTargetElement.removeEventListener("focus", onHoverStart2);
      hoverTargetElement.removeEventListener("blur", onHoverEnd2);
      hoverTargetElement.removeEventListener("touchstart", onHoverStart2);
      window.removeEventListener("touchstart", onWindowTouchStart);
    };
  }, [disableDefaultEventHandling, hoverTargetElement]);
  const previousFocusedRef = (0, import_react.useRef)(false);
  (0, import_react.useEffect)(() => {
    if (!hoverTargetElement)
      return;
    if (previousFocusedRef.current !== focused) {
      previousFocusedRef.current = focused;
      if (focused) {
        hoverTargetElement.dispatchEvent(new Event("hvp:hoverStart"));
      } else {
        hoverTargetElement.dispatchEvent(new Event("hvp:hoverEnd"));
      }
    }
  }, [hoverTargetElement, focused]);
  const currentVideoSrc = (0, import_react.useRef)(videoSrc);
  let shouldReloadVideoSrc = false;
  if (videoSrc !== currentVideoSrc.current && !isHovering && !isPlaying) {
    currentVideoSrc.current = videoSrc;
    shouldReloadVideoSrc = true;
  }
  const hasStringSrc = typeof currentVideoSrc.current === "string";
  (0, import_react.useEffect)(() => {
    const videoElement = videoRef.current;
    if (!videoElement)
      return;
    if (shouldReloadVideoSrc) {
      videoElement.load();
      nextVideoStartTimeRef.current = playbackRangeStart || 0;
    }
  }, [playbackRangeStart, shouldReloadVideoSrc]);
  const shouldUnloadVideo = unloadVideoOnPaused && !isHovering && !isPlaying;
  (0, import_react.useEffect)(() => {
    var _a2;
    if (shouldUnloadVideo) {
      (_a2 = videoRef.current) == null ? void 0 : _a2.load();
    }
  }, [shouldUnloadVideo]);
  const shouldShowLoadingOverlay = isHovering && !isPlaying;
  const shouldShowPausedOverlay = !isHovering || isHovering && !isPlaying;
  const isUsingPlaybackRange = playbackRangeStart !== null || playbackRangeEnd !== null;
  const hasLoadingOverlay = Boolean(loadingOverlay);
  return /* @__PURE__ */ import_react.default.createElement(
    "div",
    __spreadValues({
      ref: containerRef,
      style: __spreadValues(__spreadProps(__spreadValues({
        [overlayTransitionDurationVar]: `${overlayTransitionDuration}ms`
      }, containerSizingStyles[sizingMode]), {
        position: "relative"
      }), style)
    }, spreadableProps),
    hasPausedOverlay ? /* @__PURE__ */ import_react.default.createElement(
      "div",
      {
        style: __spreadValues(__spreadValues(__spreadProps(__spreadValues({}, pausedOverlayWrapperSizingStyles[sizingMode]), {
          zIndex: 1
        }), shouldShowPausedOverlay ? visibleOverlayStyles : hiddenOverlayStyles), pausedOverlayWrapperStyle),
        className: pausedOverlayWrapperClassName
      },
      pausedOverlay
    ) : null,
    hasLoadingOverlay ? /* @__PURE__ */ import_react.default.createElement(
      "div",
      {
        style: __spreadValues(__spreadValues(__spreadProps(__spreadValues({}, expandToFillContainerStyle), {
          zIndex: 2,
          transitionDelay: loadingStateTimeout ? `${loadingStateTimeout}ms` : void 0
        }), shouldShowLoadingOverlay ? visibleOverlayStyles : hiddenOverlayStyles), loadingOverlayWrapperStyle),
        className: loadingOverlayWrapperClassName
      },
      loadingOverlay
    ) : null,
    hasHoverOverlay ? /* @__PURE__ */ import_react.default.createElement(
      "div",
      {
        style: __spreadValues(__spreadValues(__spreadProps(__spreadValues({}, expandToFillContainerStyle), {
          zIndex: 3
        }), isHovering ? visibleOverlayStyles : hiddenOverlayStyles), hoverOverlayWrapperStyle),
        className: hoverOverlayWrapperClassName
      },
      hoverOverlay
    ) : null,
    isYouTube ? /* @__PURE__ */ import_react.default.createElement(
      import_youtube.default,
      {
        ref: playerRef,
        url: videoSrc,
        width: "100%",
        height: "100%",
        playing: isPlaying,
        muted,
        volume,
        loop,
        onReady: () => setIsLoading(false),
        onBuffer: () => setIsLoading(true),
        onBufferEnd: () => setIsLoading(false),
        config: { playerVars: { controls: controls ? 1 : 0 } }
      }
    ) : (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      /* @__PURE__ */ import_react.default.createElement(
        "video",
        {
          src: hasStringSrc && !shouldUnloadVideo ? currentVideoSrc.current : void 0,
          loop: isUsingPlaybackRange ? false : loop,
          playsInline: true,
          preload,
          crossOrigin,
          ref: videoRef,
          style: __spreadValues(__spreadProps(__spreadValues({}, videoSizingStyles[sizingMode]), {
            objectFit: "cover"
          }), videoStyle),
          controls,
          controlsList,
          className: videoClassName,
          id: videoId,
          onPlaying: () => setIsPlaying(true),
          onPause: () => setIsPlaying(false),
          onEnded: () => setIsPlaying(false),
          onLoadStart: () => setIsLoading(true),
          onSuspend: () => setIsLoading(false),
          onWaiting: () => setIsLoading(true),
          onLoadedData: () => {
            var _a2;
            setIsLoading(
              (((_a2 = videoRef.current) == null ? void 0 : _a2.readyState) || 0) < HTMLMediaElement.HAVE_ENOUGH_DATA
            );
          },
          onAbort: () => {
            setIsLoading(false);
          },
          onTimeUpdate: (
            // If there's a playback range set, the traditional `loop` video prop won't work correctly so
            // we'll need watch the video's time as it plays and manually keep it within the bounds of the range
            isUsingPlaybackRange ? () => {
              const videoElement = videoRef.current;
              if (!videoElement)
                return;
              const maxVideoTime = playbackRangeEnd || videoElement.duration;
              const minVideoTime = playbackRangeStart || 0;
              const { currentTime } = videoElement;
              if (loop && currentTime >= maxVideoTime) {
                const startTime = playbackRangeStart || 0;
                videoElement.currentTime = startTime;
                if (isHovering && (videoElement.paused || videoElement.ended)) {
                  playVideo();
                }
              } else if (currentTime > maxVideoTime) {
                videoElement.pause();
                videoElement.currentTime = maxVideoTime;
              } else if (currentTime < minVideoTime) {
                videoElement.currentTime = minVideoTime;
              }
            } : void 0
          )
        },
        shouldUnloadVideo || hasStringSrc ? null : currentVideoSrc.current,
        videoCaptions
      )
    )
  );
}
/**
 * @component HoverVideoPlayer
 * @license MIT
 *
 * @param {HoverVideoPlayerProps} props
 */
//# sourceMappingURL=index.cjs.map
