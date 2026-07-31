import { useEffect, useId, useState } from "react";

/*
  Decorative hardware photos that flank the sections — a Pi, an ESP32, a
  breadboard. They are a desktop flourish: below the layout's large breakpoint
  they hang mostly off-screen behind the content, where they cost a download
  and buy nothing. So they are not rendered there at all, rather than hidden
  with CSS (a `display:none` image is still fetched by most browsers).
*/

const IMAGES = {
  left: [
    { src: "/images/side/pi-removed-bg.webp", w: 900, h: 500, scale: 1.3 },
    { src: "/images/side/led-removed-bg.webp", w: 700, h: 450, scale: 1 },
    { src: "/images/side/screwdriver.webp", w: 360, h: 360, scale: 1 },
  ],
  right: [
    { src: "/images/side/robocar-removed-bg.webp", w: 900, h: 600, scale: 1.35 },
    { src: "/images/side/esp32-removed-bg.webp", w: 900, h: 500, scale: 1.35 },
    { src: "/images/side/breadbord.webp", w: 1408, h: 768, scale: 1.3 },
  ],
};

const DESKTOP = "(min-width: 1024px)";

/* Which photo an instance gets is derived from its own React id, so it is
   stable for the life of the component and identical on every render. The
   previous version counted instances in a module-level tally that only ever
   went up: it drifted further out of step with every client-side navigation,
   and under StrictMode's double-mount it handed the same photo to neighbouring
   sections. */
function poolIndex(id, length) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % length;
}

function useDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(DESKTOP).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    setIsDesktop(mq.matches);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

export default function SideImage({ side = "left", offsetY = 0, size = 380, variant }) {
  const isDesktop = useDesktop();
  const id = useId();

  if (!isDesktop) return null;

  const pool = IMAGES[side];
  // `variant` lets a caller pin a specific photo; otherwise it is derived.
  const image =
    variant !== undefined
      ? pool[variant % pool.length]
      : pool[poolIndex(id, pool.length)];

  const width = Math.floor(size * image.scale);
  const height = Math.round(width * (image.h / image.w));

  return (
    <img
      src={image.src}
      alt=""
      aria-hidden="true"
      draggable={false}
      /* Explicit intrinsic size: the browser reserves the box before the file
         arrives instead of reflowing the section around it. */
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className="side-image absolute pointer-events-none select-none -z-10"
      style={{
        top: "50%",
        [side]: `${-Math.floor(width * 0.3)}px`,
        transform: `translateY(calc(-50% + ${offsetY}px))`,
        width: `${width}px`,
        height: "auto",
        maxWidth: "none",
      }}
    />
  );
}
