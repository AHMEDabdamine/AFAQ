import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  animate,
} from "framer-motion";
import { X } from "lucide-react";
import AfaqMascot from "./AfaqMascot";
import { useCursorGaze } from "./useCursorGaze";

const HOVER_ANGRY_THRESHOLD = 6; // hovers beyond this make it angry
const DRAG_ANGRY_DISTANCE = 5000; // px of accumulated drag before it gets angry
const ANGRY_COOLDOWN_MS = 3000; // angry face holds this long, then cools down
const EDGE_MARGIN = 24; // gap from the viewport edge when docked

const SNAP_SPRING = { type: "spring", stiffness: 500, damping: 38 };

export default function ChatbotButton({ open, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [angry, setAngry] = useState(false);
  const [dragging, setDragging] = useState(false);
  const hoverCount = useRef(0);
  const dragAccum = useRef(0);
  const angryTimer = useRef(0);
  const mascotRef = useRef(null);
  const dragRef = useRef(null);
  const constraintsRef = useRef(null);
  const hasDragged = useRef(false);

  // Drag offset from the anchored bottom-right corner.
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleClick = (e) => {
    if (hasDragged.current) {
      hasDragged.current = false;
      return;
    }
    onClick?.(e);
  };

  // Latch the angry face, then cool down after a few seconds.
  const triggerAngry = () => {
    setAngry(true);
    hoverCount.current = 0;
    dragAccum.current = 0;
    clearTimeout(angryTimer.current);
    angryTimer.current = setTimeout(() => setAngry(false), ANGRY_COOLDOWN_MS);
  };

  useEffect(() => () => clearTimeout(angryTimer.current), []);

  // On release, dock to whichever side (left/right) it's closest to and clamp
  // it vertically inside the viewport.
  const snapToEdge = () => {
    const el = dragRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const toLeft = r.left + r.width / 2 < vw / 2;
    const targetLeft = toLeft ? EDGE_MARGIN : vw - EDGE_MARGIN - r.width;
    animate(x, x.get() + (targetLeft - r.left), SNAP_SPRING);

    let dy = 0;
    if (r.top < EDGE_MARGIN) dy = EDGE_MARGIN - r.top;
    else if (r.bottom > vh - EDGE_MARGIN) dy = vh - EDGE_MARGIN - r.bottom;
    if (dy) animate(y, y.get() + dy, SNAP_SPRING);
  };

  // Idle: head follows the cursor. Hover: it plays. Pester it (too many hovers
  // or too much dragging) and it holds an angry stare until it cools down.
  const gaze = useCursorGaze(
    mascotRef,
    !open && !isHovered && !angry && !dragging
  );
  const mascotProps = angry
    ? { expression: "angry-brows" }
    : isHovered
    ? { animation: "playful" }
    : { expression: gaze };

  return (
    <>
      {/* Invisible viewport-sized box that keeps the dragged mascot on screen. */}
      <div
        ref={constraintsRef}
        aria-hidden
        className="fixed inset-2 z-[98] pointer-events-none"
      />

      <div className="fixed bottom-6 right-6 z-[99]">
        <AnimatePresence>
          {!open && (
            <motion.button
              ref={dragRef}
              style={{ x, y }}
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.12}
              dragMomentum={false}
              onPointerDown={() => {
                hasDragged.current = false;
              }}
              onDragStart={() => {
                hasDragged.current = true;
                setDragging(true);
                dragAccum.current = 0;
              }}
              onDrag={(_e, info) => {
                if (Math.hypot(info.offset.x, info.offset.y) > 4) {
                  hasDragged.current = true;
                }
                dragAccum.current += Math.hypot(info.delta.x, info.delta.y);
                if (dragAccum.current > DRAG_ANGRY_DISTANCE) triggerAngry();
              }}
              onDragEnd={() => {
                setDragging(false);
                snapToEdge();
                setTimeout(() => {
                  hasDragged.current = false;
                }, 120);
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              whileDrag={{ scale: 1.05, cursor: "grabbing" }}
              onHoverStart={() => {
                setIsHovered(true);
                hoverCount.current += 1;
                if (hoverCount.current > HOVER_ANGRY_THRESHOLD) triggerAngry();
              }}
              onHoverEnd={() => setIsHovered(false)}
              onClick={handleClick}
              className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0 drop-shadow-xl touch-none"
              title="Open AI Assistant"
            >
              {/* Gentle breathing/float so it reads as alive at rest. */}
              <motion.div
                ref={mascotRef}
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <AfaqMascot
                  size={76}
                  {...mascotProps}
                  className="drop-shadow-lg"
                />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {open && (
        <div className="fixed bottom-6 right-6 z-[99]">
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 md:w-10 md:h-10 rounded-xl shadow-md flex items-center justify-center cursor-pointer"
            style={{
              background: "var(--color-bg-alt)",
              color: "var(--color-text-muted)",
            }}
            onClick={onClick}
          >
            <X size={14} />
          </motion.button>
        </div>
      )}
    </>
  );
}
