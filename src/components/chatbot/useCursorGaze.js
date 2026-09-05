import { useEffect, useRef, useState } from "react";

// Maps the cursor's direction (relative to the mascot's centre) to one of the
// avatar's directional glance expressions, so the mascot's head/eyes visibly
// turn toward the pointer. Discrete but tweened by the avatar runtime, so it
// reads as smooth tracking. Returns "neutral" when disabled, when the pointer
// is very close (looking straight), or when it leaves the window.
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

    const onMove = (e) => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        if (Math.hypot(dx, dy) < 36) {
          setExpression("neutral");
          return;
        }
        let ang = (Math.atan2(dy, dx) * 180) / Math.PI; // 0 = right, 90 = down
        if (ang < 0) ang += 360;
        setExpression(SECTORS[Math.round(ang / 45) % 8]);
      });
    };
    const onLeave = () => setExpression("neutral");

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [ref, enabled]);

  return expression;
}
