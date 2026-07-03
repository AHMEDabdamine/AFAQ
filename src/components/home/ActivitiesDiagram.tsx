import React, { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
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

function CornerHandles({ color }: { color: string }) {
  const box = "w-[6px] h-[6px] border absolute";
  return (
    <>
      <span
        className={`${box} top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-sm`}
        style={{ borderColor: color }}
      />
      <span
        className={`${box} top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-sm`}
        style={{ borderColor: color }}
      />
      <span
        className={`${box} bottom-0 left-0 -translate-x-1/2 translate-y-1/2 rounded-sm`}
        style={{ borderColor: color }}
      />
      <span
        className={`${box} bottom-0 right-0 translate-x-1/2 translate-y-1/2 rounded-sm`}
        style={{ borderColor: color }}
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
        reduced
          ? {}
          : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <div
        className="relative w-[150px] h-[150px] rounded border-[1.5px] flex items-center justify-center"
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

function Connectors() {
  const reduced = useReducedMotion();
  const cx = 50;
  const cy = 50;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        {activities.map((a) => {
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

      {activities.map((a) => {
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
              reduced
                ? {}
                : { duration: 0.8, repeat: Infinity, ease: "linear" }
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
          reduced
            ? {}
            : { type: "spring", damping: 14, stiffness: 260 }
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
  onNodeClick,
}: {
  onNodeClick: (a: Activity) => void;
}) {
  return (
    <div className="hidden md:block">
      <div className="text-center mb-10">
        <h2 className="font-sans font-bold text-4xl text-white mb-2">
          Activities
        </h2>
        <p className="font-mono text-sm text-neutral-400">
          Our core programs &amp; events
        </p>
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
        <Connectors />
        <CoreNode />
        {activities.map((a, i) => (
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

// ─── MobileCard ─────────────────────────────────────────────────────────────

function MobileCard({
  activity,
  index,
  onClick,
}: {
  activity: Activity;
  index: number;
  onClick: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="flex items-start gap-4 p-4 rounded-xl border border-neutral-800 bg-[#0E1012] cursor-pointer"
      style={{ borderLeft: `2px solid ${activity.color}` }}
      initial={reduced ? {} : { opacity: 0, x: -16 }}
      whileInView={reduced ? {} : { opacity: 1, x: 0 }}
      viewport={{ once: true }}
      whileHover={reduced ? {} : { scale: 1.02 }}
      whileTap={reduced ? {} : { scale: 0.98 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      onClick={onClick}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ color: activity.color, background: `${activity.color}15` }}
      >
        {activity.icon}
      </div>
      <div className="min-w-0">
        <p
          className="font-mono text-sm font-semibold mb-0.5"
          style={{ color: activity.color }}
        >
          {activity.label}
        </p>
        <p className="font-mono text-xs text-neutral-500 leading-relaxed">
          {activity.description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── DiagramMobile ──────────────────────────────────────────────────────────

function DiagramMobile({
  onNodeClick,
}: {
  onNodeClick: (a: Activity) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="md:hidden space-y-5">
      <div className="text-center mb-2">
        <h2 className="font-sans font-bold text-3xl text-white mb-2">
          Activities
        </h2>
        <p className="font-mono text-sm text-neutral-400">
          Our core programs &amp; events
        </p>
      </div>

      <motion.div
        className="flex items-center justify-center gap-2 py-2"
        initial={reduced ? {} : { opacity: 0, y: -8 }}
        whileInView={reduced ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border"
          style={{
            borderColor: CORE_COLOR,
            color: CORE_COLOR,
            background: `${CORE_COLOR}10`,
          }}
        >
          <Zap size={16} />
          <span className="font-bold text-sm tracking-wider uppercase">
            AFAQ
          </span>
        </div>
      </motion.div>

      <div className="space-y-3">
        {activities.map((a, i) => (
          <MobileCard
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

// ─── ActivitiesDiagram (exported) ───────────────────────────────────────────

export default function ActivitiesDiagram() {
  const [selected, setSelected] = useState<Activity | null>(null);

  const handleNodeClick = useCallback(
    (a: Activity) => setSelected(a),
    []
  );
  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <AnimatePresence>
          {selected && (
            <NodePopup
              key="popup"
              activity={selected}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>

        <DiagramDesktop onNodeClick={handleNodeClick} />
        <DiagramMobile onNodeClick={handleNodeClick} />
      </div>
    </section>
  );
}
