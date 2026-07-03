import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Cpu,
  Rocket,
  Wifi,
  Clock,
  Trophy,
  Code2,
  BookOpen,
  Zap,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Activity = {
  id: string;
  label: string;
  description: string;
  details: string;
  color: string;
  icon: React.ReactNode;
  position: { x: number; y: number };
};

const activities: Activity[] = [
  {
    id: "workshops",
    label: "Workshops",
    color: "#FFB454",
    icon: <Cpu size={30} />,
    position: { x: 12, y: 10 },
    description: "Hands-on sessions on Arduino, programming & electronics",
    details:
      "Our workshops cover a wide range of topics from Arduino basics to advanced programming concepts. Each session is designed to be hands-on, allowing participants to build real projects and gain practical skills that complement their academic studies.",
  },
  {
    id: "robotics",
    label: "Robotics",
    color: "#FF6B6B",
    icon: <Rocket size={30} />,
    position: { x: 88, y: 10 },
    description: "Design, build & program robots for competition",
    details:
      "The robotics program brings together students passionate about mechanical design, electronics, and programming. Teams collaborate to build robots for local and national competitions, learning project management and engineering principles along the way.",
  },
  {
    id: "iot",
    label: "IoT & Electronics",
    color: "#4C8DFF",
    icon: <Wifi size={30} />,
    position: { x: 6, y: 48 },
    description: "Connected devices & embedded systems",
    details:
      "Explore the world of connected devices through our IoT track. Members work with sensors, microcontrollers, and communication protocols to build smart systems that solve real-world problems, from home automation to environmental monitoring.",
  },
  {
    id: "hackathons",
    label: "Hackathons",
    color: "#C792EA",
    icon: <Clock size={30} />,
    position: { x: 94, y: 48 },
    description: "Intense coding sprints to solve real problems",
    details:
      "Our hackathons bring together students for intense coding sessions where teams build complete solutions in a limited time. These events foster creativity, rapid prototyping, and teamwork while addressing real-world challenges faced by our community.",
  },
  {
    id: "competitions",
    label: "Competitions",
    color: "#FFD166",
    icon: <Trophy size={30} />,
    position: { x: 12, y: 90 },
    description: "Friendly contests to showcase skills & win prizes",
    details:
      "Regular competitions give members a platform to showcase their talents, from coding challenges to robotics battles. These friendly contests encourage healthy competition, help members benchmark their skills, and build confidence.",
  },
  {
    id: "softwaredev",
    label: "Software Dev",
    color: "#FF6FB5",
    icon: <Code2 size={30} />,
    position: { x: 88, y: 90 },
    description: "Web, mobile & systems projects with modern tools",
    details:
      "The software development track focuses on building real-world applications using modern frameworks and tools. Members work on web, mobile, and systems projects, learning version control, agile methodologies, and deployment practices used in the industry.",
  },
  {
    id: "training",
    label: "Training",
    color: "#2DD4BF",
    icon: <BookOpen size={30} />,
    position: { x: 50, y: 97 },
    description: "Expert-led technical training for all levels",
    details:
      "Our training program offers structured learning paths for members at all skill levels. Led by experienced mentors, these sessions cover topics like Python, web development, embedded systems, and AI, ensuring continuous skill development throughout the academic year.",
  },
];

const CORE_COLOR = "#34E7A6";

// ─── CornerHandles ──────────────────────────────────────────────────────────

function CornerHandles({
  color,
  size = 6,
  inset = "-4px",
}: {
  color: string;
  size?: number;
  inset?: string;
}) {
  const s = `${size}px`;
  const shared = {
    width: s,
    height: s,
    borderColor: color,
  };
  return (
    <>
      <span
        className="absolute border rounded-sm"
        style={{ ...shared, top: inset, left: inset }}
      />
      <span
        className="absolute border rounded-sm"
        style={{ ...shared, top: inset, right: inset }}
      />
      <span
        className="absolute border rounded-sm"
        style={{ ...shared, bottom: inset, left: inset }}
      />
      <span
        className="absolute border rounded-sm"
        style={{ ...shared, bottom: inset, right: inset }}
      />
    </>
  );
}

// ─── CoreNode ───────────────────────────────────────────────────────────────

function CoreNode() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 z-20"
      style={{ transform: "translate(-50%, -50%)" }}
      animate={
        reduced
          ? {}
          : {
              boxShadow: [
                `0 0 18px ${CORE_COLOR}44, 0 0 40px ${CORE_COLOR}22`,
                `0 0 36px ${CORE_COLOR}88, 0 0 80px ${CORE_COLOR}44, 0 0 120px ${CORE_COLOR}22`,
                `0 0 18px ${CORE_COLOR}44, 0 0 40px ${CORE_COLOR}22`,
              ],
            }
      }
      transition={
        reduced ? {} : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <div
        className="relative w-[150px] h-[150px] border-[1.5px] flex items-center justify-center"
        style={{
          borderColor: CORE_COLOR,
          boxShadow: `0 0 18px ${CORE_COLOR}44`,
          background: "#0E1012",
        }}
      >
        <CornerHandles color={CORE_COLOR} />
        <div className="flex flex-col items-center gap-1">
          <Zap size={28} style={{ color: CORE_COLOR }} />
          <span
            className="font-bold text-sm tracking-wider uppercase"
            style={{ color: CORE_COLOR }}
          >
            AFAQ
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ActivityNode ───────────────────────────────────────────────────────────

function ActivityNode({
  activity,
  index,
  onClick,
}: {
  activity: Activity;
  index: number;
  onClick: () => void;
}) {
  const reduced = useReducedMotion();
  const boxSize = 104;

  return (
    <motion.div
      className="absolute z-10 cursor-pointer"
      style={{
        left: `${activity.position.x}%`,
        top: `${activity.position.y}%`,
        width: boxSize,
        height: boxSize,
        transform: "translate(-50%, -50%)",
      }}
      initial={reduced ? {} : { opacity: 0, scale: 0.85 }}
      animate={reduced ? {} : { opacity: 1, scale: 1 }}
      whileHover={reduced ? {} : { scale: 1.1 }}
      whileTap={reduced ? {} : { scale: 0.92 }}
      transition={{
        delay: index * 0.07,
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onClick}
    >
      <div
        className="relative w-full h-full rounded flex items-center justify-center"
        style={{
          border: `1.5px solid ${activity.color}`,
          boxShadow: `0 0 18px ${activity.color}33`,
          background: "#0E1012",
        }}
      >
        <CornerHandles color={activity.color} />
        <span style={{ color: activity.color }}>{activity.icon}</span>
      </div>

      <div
        className="absolute left-1/2 font-mono text-xs whitespace-nowrap"
        style={{
          bottom: `calc(100% + 10px)`,
          transform: "translateX(-50%)",
          color: activity.color,
        }}
      >
        {activity.label}
      </div>

      <div
        className="absolute left-1/2 font-mono text-[10px] text-neutral-500 leading-relaxed text-center"
        style={{
          top: `calc(100% + 10px)`,
          transform: "translateX(-50%)",
          width: 150,
        }}
      >
        {activity.description}
      </div>
    </motion.div>
  );
}

// ─── Connectors ─────────────────────────────────────────────────────────────

function Connectors({ activities: acts }: { activities: Activity[] }) {
  const reduced = useReducedMotion();
  const cx = 50;
  const cy = 63;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        {acts.map((a) => {
          const px = a.position.x;
          const py = a.position.y;
          return (
            <linearGradient
              key={a.id}
              id={`grad-${a.id}`}
              gradientUnits="userSpaceOnUse"
              x1={cx}
              y1={cy}
              x2={px}
              y2={py}
            >
              <stop offset="0%" stopColor={CORE_COLOR} />
              <stop offset="100%" stopColor={a.color} />
            </linearGradient>
          );
        })}
      </defs>

      {acts.map((a) => {
        const px = a.position.x;
        const py = a.position.y;
        const dx = px - cx;
        const dy = py - cy;
        const cp1x = cx + dx * 0.2;
        const cp1y = cy + dy * 0.4;
        const cp2x = px - dx * 0.2;
        const cp2y = py - dy * 0.4;
        const d = `M ${cx} ${cy} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${px} ${py}`;

        return (
          <motion.path
            key={a.id}
            d={d}
            fill="none"
            stroke={`url(#grad-${a.id})`}
            strokeWidth={0.5}
            strokeDasharray="3 5"
            opacity={0.7}
            initial={reduced ? {} : { strokeDashoffset: 0 }}
            animate={reduced ? {} : { strokeDashoffset: -16 }}
            transition={
              reduced ? {} : { duration: 0.8, repeat: Infinity, ease: "linear" }
            }
          />
        );
      })}
    </svg>
  );
}

// ─── NodePopup ──────────────────────────────────────────────────────────────

function NodePopup({
  activity,
  onClose,
}: {
  activity: Activity;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        className="relative"
        initial={reduced ? {} : { scale: 0.7, opacity: 0 }}
        animate={reduced ? {} : { scale: 1, opacity: 1 }}
        exit={reduced ? {} : { scale: 0.7, opacity: 0 }}
        transition={
          reduced ? {} : { type: "spring", damping: 14, stiffness: 260 }
        }
      >
        <div
          className="relative p-8 rounded-2xl border-[1.5px]"
          style={{
            borderColor: activity.color,
            boxShadow: `0 0 30px ${activity.color}44, 0 0 60px ${activity.color}22`,
            background: "#0E1012",
            width: 400,
            maxWidth: "90vw",
          }}
        >
          <CornerHandles color={activity.color} />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full border border-neutral-700 text-neutral-500 hover:text-white hover:border-neutral-500 transition-colors text-sm"
          >
            ✕
          </button>

          <div className="mb-5" style={{ color: activity.color }}>
            {React.cloneElement(activity.icon as React.ReactElement, {
              size: 36,
            })}
          </div>

          <h3
            className="font-mono text-lg font-bold mb-3"
            style={{ color: activity.color }}
          >
            {activity.label}
          </h3>

          <p className="font-mono text-sm text-neutral-400 leading-relaxed">
            {activity.details}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── DiagramDesktop ─────────────────────────────────────────────────────────

function DiagramDesktop({
  activities: acts,
  onNodeClick,
  title,
  sub,
}: {
  activities: Activity[];
  onNodeClick: (a: Activity) => void;
  title: string;
  sub: string;
}) {
  return (
    <div className="hidden md:block">
      <div className="text-center mb-10">
        <h2 className="font-sans font-bold text-4xl text-white mb-2">
          {title}
        </h2>
        <p className="font-mono text-sm text-neutral-400">{sub}</p>
      </div>

      <div
        className="relative mx-auto w-full rounded-2xl"
        style={{
          minHeight: 500,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <Connectors activities={acts} />
        <CoreNode />
        {acts.map((a, i) => (
          <ActivityNode
            key={a.id}
            activity={a}
            index={i}
            onClick={() => onNodeClick(a)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── DiagramMobile ──────────────────────────────────────────────────────────

function MobileRow({
  activity,
  index,
  onClick,
  isCore,
}: {
  activity: Activity;
  index: number;
  onClick?: () => void;
  isCore?: boolean;
}) {
  const reduced = useReducedMotion();
  const c = isCore ? CORE_COLOR : activity.color;
  const pulseAnim = isCore && !reduced;

  return (
    <motion.div
      className={`relative flex items-center ${
        onClick ? "cursor-pointer" : ""
      }`}
      style={{ minHeight: isCore ? 80 : 76 }}
      initial={reduced ? {} : { opacity: 0, x: -8 }}
      whileInView={reduced ? {} : { opacity: 1, x: 0 }}
      viewport={{ once: true }}
      whileTap={onClick && !reduced ? { scale: 0.97 } : {}}
      transition={{
        delay: index * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={onClick}
    >
      {/* Horizontal branch line — matches .m-row::before */}
      <div
        className="absolute top-1/2 h-[1.5px] -translate-y-1/2 pointer-events-none z-0"
        style={{
          left: -16,
          width: 16,
          background: `linear-gradient(to right, ${CORE_COLOR}, ${c})`,
        }}
      />

      {/* Joint dot at trunk — matches .m-dot.d-trunk */}
      <span
        className="absolute w-[5px] h-[5px] rounded-full top-1/2 -translate-y-1/2 z-10 pointer-events-none"
        style={{
          left: -15.5,
          border: `1.3px solid ${CORE_COLOR}`,
          background: "#0a0b0d",
        }}
      />

      {/* Joint dot at card — matches .m-dot.d-card */}
      <span
        className="absolute w-[5px] h-[5px] rounded-full top-1/2 -translate-y-1/2 z-10 pointer-events-none"
        style={{
          left: -2.5,
          border: `1.3px solid ${c}`,
          background: "#0a0b0d",
        }}
      />

      {/* Card — matches .m-card */}
      <motion.div
        className="flex-1 min-w-0 flex items-center gap-[10px] rounded-[4px] px-3 py-[10px]"
        style={{
          border: `1.5px solid ${c}`,
          background: isCore ? "rgba(52,231,166,0.08)" : "#0f1113",
          boxShadow: `0 0 14px ${c}48`,
        }}
        animate={
          pulseAnim
            ? {
                boxShadow: [
                  `0 0 26px ${CORE_COLOR}38`,
                  `0 0 46px ${CORE_COLOR}66`,
                  `0 0 26px ${CORE_COLOR}38`,
                ],
              }
            : {}
        }
        transition={
          pulseAnim
            ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            : {}
        }
      >
        {/* Icon box — matches .m-icon */}
        <div
          className="relative w-[34px] h-[34px] shrink-0 flex items-center justify-center rounded-[4px]"
          style={{
            border: `1.3px solid ${c}`,
            background: isCore ? "transparent" : "#0f1113",
          }}
        >
          <CornerHandles color={c} size={5} inset="-3.5px" />
          <span style={{ color: c }}>
            {React.cloneElement(activity.icon as React.ReactElement, {
              size: 16,
            })}
          </span>
        </div>

        {/* Text — matches .m-text */}
        <div className="min-w-0">
          <div
            className="font-mono text-[11px] font-medium tracking-[0.02em]"
            style={{ color: c }}
          >
            {activity.label}
          </div>
          <div
            className={`font-mono leading-[1.42] text-[#6b7178] ${
              isCore ? "text-[9px] tracking-[0.05em] uppercase" : "text-[10px]"
            }`}
          >
            {activity.description}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DiagramMobile({
  activities: acts,
  onNodeClick,
  title,
  sub,
}: {
  activities: Activity[];
  onNodeClick: (a: Activity) => void;
  title: string;
  sub: string;
}) {
  const { t } = useTranslation("home");

  const hubActivity: Activity = {
    id: "hub",
    label: "AFAQ",
    description: t("activities.core"),
    details: "",
    color: CORE_COLOR,
    icon: <Zap size={16} />,
    position: { x: 0, y: 0 },
  };

  return (
    <div className="md:hidden">
      <div className="text-center mb-[26px]">
        <h2 className="font-sans font-bold text-[32px] text-white mb-[14px]">
          {title}
        </h2>
        <p className="font-mono text-sm text-neutral-400 max-w-[460px] mx-auto leading-relaxed">
          {sub}
        </p>
      </div>

      {/* Mobile list container */}
      <div
        className="relative mx-auto"
        style={{
          maxWidth: 360,
          paddingLeft: 28,
        }}
      >
        {/* Vertical trunk line — matches .mobile-list::before */}
        <div
          className="absolute w-[2px] pointer-events-none"
          style={{
            left: 12,
            top: 38,
            bottom: 38,
            opacity: 0.6,
            background: `linear-gradient(to bottom, ${CORE_COLOR}, #33373d 92%, transparent)`,
          }}
        />

        <div className="space-y-2">
          <MobileRow activity={hubActivity} index={0} isCore />
          {acts.map((a, i) => (
            <MobileRow
              key={a.id}
              activity={a}
              index={i + 1}
              onClick={() => onNodeClick(a)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ActivitiesDiagram (exported) ───────────────────────────────────────────

export default function ActivitiesDiagram() {
  const { t } = useTranslation("home");
  const [selected, setSelected] = useState<Activity | null>(null);

  const localeKey = useCallback(
    (id: string) => (id === "softwaredev" ? "software" : id),
    []
  );

  const translated = useMemo(
    () =>
      activities.map((a) => ({
        ...a,
        label: t(`activities.${localeKey(a.id)}.title`),
        description: t(`activities.${localeKey(a.id)}.desc`),
        details: t(`activities.${localeKey(a.id)}.details`),
      })),
    [t, localeKey]
  );

  const handleNodeClick = useCallback((a: Activity) => setSelected(a), []);
  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence>
          {selected && (
            <NodePopup key="popup" activity={selected} onClose={handleClose} />
          )}
        </AnimatePresence>

        <DiagramDesktop
          activities={translated}
          onNodeClick={handleNodeClick}
          title={t("activities.title")}
          sub={t("activities.sub")}
        />
        <DiagramMobile
          activities={translated}
          onNodeClick={handleNodeClick}
          title={t("activities.title")}
          sub={t("activities.sub")}
        />
      </div>
    </section>
  );
}
