import React, { useState, useCallback, useMemo } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import {
  Cpu,
  Rocket,
  Wifi,
  Clock,
  Trophy,
  Code2,
  BookOpen,
  Zap,
  X,
} from "lucide-react";
import useScrollLock from "../../hooks/useScrollLock";
import useFocusTrap from "../../hooks/useFocusTrap";

/**
 * The club's activities drawn as a board: a powered core with traces running
 * out to seven component nodes.
 *
 * Previously this was a dark-only widget sitting on a light page - the heading
 * was `text-white` on near-white, the node boxes were hardcoded near-black, and
 * each node carried its own colour from an unrelated seven-hue rainbow. The
 * shapes are kept; the colour now comes from the board (accent traces, a gold
 * core) and everything follows the active theme.
 */

type Activity = {
  id: string;
  label: string;
  description: string;
  details: string;
  icon: React.ReactNode;
  position: { x: number; y: number };
};

const ACTIVITIES: Activity[] = [
  { id: "workshops", label: "Workshops", icon: <Cpu size={28} />, position: { x: 12, y: 10 }, description: "", details: "" },
  { id: "robotics", label: "Robotics", icon: <Rocket size={28} />, position: { x: 88, y: 10 }, description: "", details: "" },
  { id: "iot", label: "IoT & Electronics", icon: <Wifi size={28} />, position: { x: 6, y: 48 }, description: "", details: "" },
  { id: "hackathons", label: "Hackathons", icon: <Clock size={28} />, position: { x: 94, y: 48 }, description: "", details: "" },
  { id: "competitions", label: "Competitions", icon: <Trophy size={28} />, position: { x: 12, y: 90 }, description: "", details: "" },
  { id: "softwaredev", label: "Software Dev", icon: <Code2 size={28} />, position: { x: 88, y: 90 }, description: "", details: "" },
  { id: "training", label: "Training", icon: <BookOpen size={28} />, position: { x: 50, y: 92 }, description: "", details: "" },
];

/** Solder-pad corner marks, the one flourish kept from the original. */
function CornerHandles({ size = 6, inset = "-4px" }: { size?: number; inset?: string }) {
  const shared = { width: `${size}px`, height: `${size}px`, borderColor: "currentColor" };
  return (
    <>
      <span className="absolute border rounded-sm" style={{ ...shared, top: inset, insetInlineStart: inset }} />
      <span className="absolute border rounded-sm" style={{ ...shared, top: inset, insetInlineEnd: inset }} />
      <span className="absolute border rounded-sm" style={{ ...shared, bottom: inset, insetInlineStart: inset }} />
      <span className="absolute border rounded-sm" style={{ ...shared, bottom: inset, insetInlineEnd: inset }} />
    </>
  );
}

function CoreNode({ label }: { label: string }) {
  const reduced = useReducedMotion();
  return (
    <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
      <motion.div
        className="relative w-[140px] h-[140px] border-[1.5px] flex items-center justify-center rounded-sm"
        style={{
          borderColor: "var(--color-gold)",
          color: "var(--color-gold)",
          background: "var(--color-card)",
        }}
        animate={reduced ? {} : {
          boxShadow: [
            "0 0 18px color-mix(in srgb, var(--color-gold) 25%, transparent)",
            "0 0 38px color-mix(in srgb, var(--color-gold) 45%, transparent)",
            "0 0 18px color-mix(in srgb, var(--color-gold) 25%, transparent)",
          ],
        }}
        transition={reduced ? {} : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <CornerHandles />
        <div className="flex flex-col items-center gap-1.5">
          <Zap size={26} />
          <span className="text-sm tracking-wider" style={{ fontFamily: "var(--font-display)" }}>
            {label}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function ActivityNode({
  activity, index, onClick,
}: { activity: Activity; index: number; onClick: () => void }) {
  const reduced = useReducedMotion();

  return (
    <motion.button
      type="button"
      // A div with onClick can't be reached, focused or activated from a
      // keyboard; these are real buttons now.
      className="absolute z-10 activity-node"
      style={{
        insetInlineStart: `${activity.position.x}%`,
        top: `${activity.position.y}%`,
        width: 104,
        height: 104,
        transform: "translate(-50%, -50%)",
      }}
      initial={reduced ? {} : { opacity: 0, scale: 0.85 }}
      whileInView={reduced ? {} : { opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={reduced ? {} : { scale: 1.08 }}
      whileTap={reduced ? {} : { scale: 0.94 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      aria-label={`${activity.label}. ${activity.description}`}
    >
      <span
        className="relative w-full h-full rounded flex items-center justify-center"
        style={{
          border: "1.5px solid var(--color-accent)",
          color: "var(--color-accent)",
          background: "var(--color-card)",
          boxShadow: "0 0 18px color-mix(in srgb, var(--color-accent) 18%, transparent)",
        }}
      >
        <CornerHandles />
        {activity.icon}
      </span>

      <span
        className="absolute start-1/2 -translate-x-1/2 text-xs whitespace-nowrap"
        style={{ bottom: "calc(100% + 10px)", fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}
      >
        {activity.label}
      </span>

      <span
        className="absolute start-1/2 -translate-x-1/2 text-center block"
        style={{
          top: "calc(100% + 10px)",
          width: 160,
          // Was 10px at ~3:1; small print is where legibility gets lost first.
          fontSize: 12,
          lineHeight: 1.45,
          color: "var(--color-text-muted)",
        }}
      >
        {activity.description}
      </span>
    </motion.button>
  );
}

function Connectors({ activities }: { activities: Activity[] }) {
  const reduced = useReducedMotion();
  const cx = 50;
  const cy = 63;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="trace-grad" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="var(--color-gold)" />
          <stop offset="100%" stopColor="var(--color-accent)" />
        </linearGradient>
      </defs>
      {activities.map((a) => {
        const dx = a.position.x - cx;
        const dy = a.position.y - cy;
        const d = `M ${cx} ${cy} C ${cx + dx * 0.2} ${cy + dy * 0.4} ${a.position.x - dx * 0.2} ${a.position.y - dy * 0.4} ${a.position.x} ${a.position.y}`;
        return (
          <motion.path
            key={a.id}
            d={d}
            fill="none"
            stroke="url(#trace-grad)"
            strokeWidth={0.5}
            strokeDasharray="3 5"
            opacity={0.55}
            initial={false}
            animate={reduced ? {} : { strokeDashoffset: -16 }}
            transition={reduced ? {} : { duration: 0.9, repeat: Infinity, ease: "linear" }}
          />
        );
      })}
    </svg>
  );
}

function NodePopup({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  const { t } = useTranslation("home");
  const reduced = useReducedMotion();
  useScrollLock(true);
  const ref = useFocusTrap(true, onClose);

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        ref={ref as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-popup-title"
        className="modal-card"
        style={{ maxWidth: 420, padding: 32 }}
        initial={reduced ? {} : { scale: 0.85, opacity: 0 }}
        animate={reduced ? {} : { scale: 1, opacity: 1 }}
        exit={reduced ? {} : { scale: 0.85, opacity: 0 }}
        transition={reduced ? {} : { type: "spring", damping: 18, stiffness: 260 }}
      >
        <button
          type="button"
          onClick={onClose}
          className="modal-close"
          aria-label={t("activities.close", "Close")}
          data-autofocus
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="mb-4" style={{ color: "var(--color-accent)" }} aria-hidden="true">
          {React.cloneElement(activity.icon as React.ReactElement, { size: 34 })}
        </div>

        <h3 id="activity-popup-title" className="text-xl mb-3" style={{ paddingInlineEnd: 36 }}>
          {activity.label}
        </h3>

        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          {activity.details}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function ActivitiesDiagram() {
  const { t } = useTranslation("home");
  const [selected, setSelected] = useState<Activity | null>(null);

  const translated = useMemo(
    () =>
      ACTIVITIES.map((a) => {
        const key = a.id === "softwaredev" ? "software" : a.id;
        return {
          ...a,
          label: t(`activities.${key}.title`),
          description: t(`activities.${key}.desc`),
          details: t(`activities.${key}.details`),
        };
      }),
    [t]
  );

  const close = useCallback(() => setSelected(null), []);

  return (
    <section className="pt-16 pb-28 md:pt-20 md:pb-36 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          {/* Was `text-white`, which made this heading invisible on the light
              page it actually sits on. */}
          <h2 className="text-3xl md:text-4xl mb-3">{t("activities.title")}</h2>
          <p
            className="text-sm md:text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            {t("activities.sub")}
          </p>
        </div>

        {/* Board view, wide screens only. Both layouts used to render at once,
            doubling the DOM and running two sets of infinite animations. */}
        <div
          className="relative mx-auto w-full rounded-2xl hidden md:block"
          style={{ minHeight: 540 }}
        >
          <div className="dot-grid rounded-2xl" style={{ backgroundSize: "22px 22px" }} aria-hidden="true" />
          <Connectors activities={translated} />
          <CoreNode label="AFAQ" />
          {translated.map((a, i) => (
            <ActivityNode key={a.id} activity={a} index={i} onClick={() => setSelected(a)} />
          ))}
        </div>

        {/* Narrow screens get the same information as a plain list. */}
        <ul className="md:hidden flex flex-col gap-3 list-none p-0 m-0 max-w-md mx-auto">
          {translated.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setSelected(a)}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-start transition-colors"
                style={{
                  border: "1px solid var(--color-border-light)",
                  background: "var(--color-card)",
                }}
              >
                <span
                  className="relative w-10 h-10 shrink-0 flex items-center justify-center rounded-lg"
                  style={{ border: "1.3px solid var(--color-accent)", color: "var(--color-accent)" }}
                >
                  {React.cloneElement(a.icon as React.ReactElement, { size: 18 })}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{a.label}</span>
                  <span className="block text-xs leading-snug" style={{ color: "var(--color-text-muted)" }}>
                    {a.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <AnimatePresence>
          {selected &&
            createPortal(
              <NodePopup key="popup" activity={selected} onClose={close} />,
              document.body
            )}
        </AnimatePresence>
      </div>
    </section>
  );
}
