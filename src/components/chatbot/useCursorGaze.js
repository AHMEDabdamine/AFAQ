import { useEffect, useRef, useState } from "react";

// Maps the cursor or tilt direction (relative to the mascot's centre) to one of the
// avatar's directional glance expressions, so the mascot's head/eyes visibly
// turn toward the pointer, touch, or device orientation angle.
const SECTORS = [
  "far-right-glance", // E
  "asymmetric-down-right", // SE
  "downward-gaze", // S
  "gentle-downward-gaze", // SW
  "curious-left", // W
  "curious-left", // NW
  "upward-side-glance", // N
  "upward-side-glance", // NE
];

export function useCursorGaze(ref, enabled = true) {
  const [expression, setExpression] = useState("neutral");
  const raf = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setExpression("neutral");
      return;
    }

    const updateFromCoord = (clientX, clientY) => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = clientX - (r.left + r.width / 2);
        const dy = clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < 36) {
          setExpression("neutral");
          return;
        }
        let ang = (Math.atan2(dy, dx) * 180) / Math.PI; // 0 = right, 90 = down
        if (ang < 0) ang += 360;
        setExpression(SECTORS[Math.round(ang / 45) % 8]);
      });
    };

    const onMouseMove = (e) => updateFromCoord(e.clientX, e.clientY);

    const onTouch = (e) => {
      if (e.touches && e.touches[0]) {
        updateFromCoord(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onOrientation = (e) => {
      if (raf.current || e.gamma == null || e.beta == null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        // gamma: left/right tilt (-90 to 90)
        // beta: forward/back tilt (resting phone angle ~45 deg)
        const gx = e.gamma;
        const gy = e.beta - 45;
        if (Math.hypot(gx, gy) < 12) {
          setExpression("neutral");
          return;
        }
        let ang = (Math.atan2(gy, gx) * 180) / Math.PI;
        if (ang < 0) ang += 360;
        setExpression(SECTORS[Math.round(ang / 45) % 8]);
      });
    };

    const onLeave = () => setExpression("neutral");

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    if (typeof window.DeviceOrientationEvent !== "undefined") {
      window.addEventListener("deviceorientation", onOrientation, { passive: true });
    }
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("deviceorientation", onOrientation);
      document.removeEventListener("mouseleave", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [ref, enabled]);

  return expression;
}
