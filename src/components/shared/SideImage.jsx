import { useId } from "react";

const leftImages = [
  "/images/side/pi-removed-bg.webp",
  "/images/side/led-removed-bg.webp",
  "/images/side/screwdriver.webp",
];
const rightImages = [
  "/images/side/robocar-removed-bg.webp",
  "/images/side/esp32-removed-bg.webp",
  "/images/side/breadbord.webp",
];

const SCALE = [
  [/esp32|robocar/, 1.35],
  [/breadbord|pi-/, 1.3],
];

/**
 * Decorative hardware drifting in the page margins.
 *
 * Which image appears is derived from React's own instance id rather than a
 * module-level counter: the counter was mutated during render, so StrictMode's
 * double render advanced it twice and the choice changed between renders.
 */
export default function SideImage({ side = "left", offsetY = 0, size = 380 }) {
  const id = useId();
  const pool = side === "left" ? leftImages : rightImages;

  // Stable hash of the instance id -> stable pick for the life of the element.
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  const src = pool[hash % pool.length];

  const multiplier = SCALE.find(([re]) => re.test(src))?.[1] ?? 1;
  const actualSize = Math.floor(size * multiplier);

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="lazy"
      decoding="async"
      className="absolute pointer-events-none select-none -z-10 animate-float-slow hidden lg:block"
      style={{
        top: "50%",
        [side]: `${-Math.floor(actualSize * 0.3)}px`,
        transform: `translateY(calc(-50% + ${offsetY}px))`,
        width: `${actualSize}px`,
        height: "auto",
        maxWidth: "none",
        filter: "drop-shadow(0 25px 35px rgba(36, 96, 231, 0.25))",
      }}
    />
  );
}
