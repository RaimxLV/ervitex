/**
 * Native browser scrolling everywhere. JS wheel smoothing (Lenis) caused
 * jumpy, delayed scrolling whenever the main thread was busy (WebGL hero,
 * galleries, slow image decode), so the browser's own smooth wheel is used.
 */
const SmoothScroll = () => null;

export default SmoothScroll;
