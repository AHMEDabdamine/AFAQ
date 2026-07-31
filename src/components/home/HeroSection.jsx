import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Rocket, Users, Code, Cpu, Zap, Trophy, Wrench } from "lucide-react";
import { Button } from "../shared/Button";

function Img({ src, alt, className, style, fetchPriority, loading }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center text-sm rounded-2xl p-3 text-center ${
          className || ""
        }`}
        style={{
          ...style,
          background: "var(--color-accent-soft)",
          border: "1px solid var(--color-border-light)",
          color: "var(--color-text-muted)",
          filter: "none",
        }}
      >
        {alt}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      fetchPriority={fetchPriority}
      loading={loading}
    />
  );
}

function Badge({ icon, label, className }) {
  return (
    <div
      className={`absolute rounded-full shadow-lg flex items-center gap-2 px-4 py-2 text-sm font-semibold z-20 ${className}`}
      style={{ background: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border-light)' }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function HeroLeft() {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.language === "ar";
  const lines = t("hero.slogan1").split("\n");

  return (
    <div
      className={`flex-1 text-center ${
        isRTL ? "lg:text-right" : "lg:text-left"
      } relative`}
    >
      <div
        className="absolute inset-0 z-0 md:hidden animate-glow"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(59,130,246,0.35) 0%, transparent 70%)",
          borderRadius: "inherit",
        }}
      />
      <div className="relative z-10 hero-fade-up text-sm font-semibold tracking-[0.15em] uppercase mb-5"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
        {t("hero.badge")}
      </div>

      <h1 className="relative z-10 hero-fade-up-d2 display-text text-5xl sm:text-6xl lg:text-7xl mb-6"
        style={{ color: 'var(--color-text)' }}>
        {lines.map((line, li) => (
          <div key={li}>
            {line.split(" ").map((word, i, arr) => {
              const clean = word
                .replace(/[^\w\u0600-\u06FF]/g, "")
                .toLowerCase();
              const isHighlight =
                clean.includes("joy") ||
                clean.includes("آفاق") ||
                clean.includes("avenir");
              return (
                <span key={i} style={isHighlight ? { color: 'var(--color-accent)' } : undefined}>
                  {word}
                  {i < arr.length - 1 ? " " : ""}
                </span>
              );
            })}
          </div>
        ))}
      </h1>

      <p
        className={`relative z-10 hero-fade-up-d3 text-base sm:text-lg leading-relaxed max-w-lg mb-4 mx-auto ${
          isRTL ? "lg:mr-0 lg:ml-auto" : "lg:mx-0"
        }`}
        style={{ color: 'var(--color-text-muted)' }}
      >
        {(() => {
          const words = t("hero.subtitle").split(" ");
          if (words.length < 2) return t("hero.subtitle");
          const lastTwo = words.slice(-2).join(" ");
          const rest = words.slice(0, -2).join(" ");
          return (
            <>
              {rest} <span style={{ color: 'var(--color-accent)' }}>{lastTwo}</span>
            </>
          );
        })()}
      </p>

      <div className="relative z-10 hero-fade-up-d4 mt-8 flex gap-4 flex-wrap justify-center lg:justify-start">
        <Button to="/join" variant="primary" icon="arrow">
          {t("hero.cta1")}
        </Button>
        <Button to="/projects" variant="outline">
          {t("hero.cta2")}
        </Button>
      </div>
    </div>
  );
}

function HeroRight() {
  const { t, i18n } = useTranslation("home");
  const isRTL = i18n.dir() === "rtl";

  // Two orbits, not seven. The original stacked seven rotating rings carrying
  // ~90 particle nodes at 0.25 opacity - invisible work for the compositor on
  // every frame, forever.
  const ring = (radius, tilt, opacity) => ({
    width: radius * 2,
    height: radius * 2,
    borderRadius: "50%",
    border: `1px solid rgba(77,141,255,${opacity})`,
    position: "absolute",
    insetInlineStart: "50%",
    top: "50%",
    marginInlineStart: -radius,
    marginTop: -radius,
    transform: `rotateX(${tilt}deg)`,
  });

  const nodes = (count, radius) =>
    Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `rotateY(${(360 / count) * i}deg) translateZ(${radius}px)`,
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: 3,
            height: 3,
            marginLeft: -1.5,
            marginTop: -1.5,
            background: "var(--color-accent)",
            boxShadow: "0 0 8px var(--color-accent)",
          }}
        />
      </div>
    ));

  return (
    // Visible from `sm` up: the whole composition used to be `hidden lg:block`,
    // so phones and tablets got the headline and an empty blue glow.
    //
    // `shrink-0` and a fixed height below `lg` matter: as a flex-1 child in a
    // column the box got squeezed shorter than its own artwork, and the
    // absolutely-positioned boards spilled up over the buttons.
    <div className="relative shrink-0 lg:flex-1 w-full max-w-[340px] sm:max-w-md lg:max-w-none h-[320px] sm:h-[440px] lg:h-[520px] xl:h-[600px] mx-auto">
      <Img
        src="/images/hero/bolt.webp"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 w-full h-full z-0 object-contain"
        style={{
          transform: "scale(1.35)",
          filter:
            "drop-shadow(0 40px 100px rgba(59,130,246,0.4)) drop-shadow(0 0 60px rgba(59,130,246,0.14))",
        }}
      />

      <div
        className="hidden md:block absolute inset-0 z-[1] pointer-events-none"
        style={{ perspective: 1200, transformStyle: "preserve-3d" }}
        aria-hidden="true"
      >
        <div className="orbit-ring" style={{ position: "absolute", inset: 0, "--speed": "28s" }}>
          <div style={ring(240, 68, 0.22)} />
          {nodes(8, 240)}
        </div>
        <div className="orbit-ring-reverse" style={{ position: "absolute", inset: 0, "--speed": "38s" }}>
          <div style={ring(300, 80, 0.14)} />
          {nodes(10, 300)}
        </div>
      </div>

      <Img
        src="/images/hero/uno.webp"
        alt={t("hero.alt.arduino", "An Arduino Uno board")}
        loading="lazy"
        className={`absolute top-[4%] ${isRTL ? "right-[10%]" : "left-[10%]"} w-40 sm:w-56 lg:w-80 -rotate-6 float-asset z-10`}
        style={{ filter: "drop-shadow(0 20px 40px rgba(59,130,246,0.35))" }}
      />
      <Img
        src="/images/hero/robocar.webp"
        alt={t("hero.alt.robocar", "A robot car built by the club")}
        loading="lazy"
        className={`absolute bottom-[20%] ${isRTL ? "left-[-6%]" : "right-[-6%]"} w-52 sm:w-72 lg:w-[25rem] rotate-3 float-asset z-10`}
        style={{ filter: "drop-shadow(0 20px 40px rgba(59,130,246,0.35))" }}
      />
      <Img
        src="/images/hero/bord.webp"
        alt={t("hero.alt.breadboard", "A breadboard with wired components")}
        loading="lazy"
        className={`absolute bottom-[4%] ${isRTL ? "right-[2%]" : "left-[2%]"} w-28 sm:w-40 lg:w-52 -rotate-3 float-asset z-10`}
        style={{ filter: "drop-shadow(0 20px 40px rgba(59,130,246,0.35))" }}
      />

      {/* Three labels, spaced so they can't collide - the previous six chips
          and icon bubbles overlapped each other at common widths. */}
      <Badge
        icon={<Code size={15} style={{ color: "var(--color-accent)" }} />}
        label="Arduino"
        className={`hidden sm:flex top-[1%] ${isRTL ? "left-[1%]" : "right-[1%]"}`}
      />
      <Badge
        icon={<Cpu size={15} style={{ color: "var(--color-accent)" }} />}
        label="Robotics"
        className={`hidden sm:flex top-[46%] ${isRTL ? "right-[-2%]" : "left-[-2%]"}`}
      />
      <Badge
        icon={<Zap size={15} style={{ color: "var(--color-accent)" }} />}
        label="Electronics"
        className={`hidden sm:flex bottom-[2%] ${isRTL ? "left-[1%]" : "right-[1%]"}`}
      />
    </div>
  );
}

function StatsBar() {
  const { t } = useTranslation("home");
  const [data, setData] = useState(null);
  const [counts, setCounts] = useState({});
  const ref = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("stats"))))
      .then((d) => !cancelled && setData(d))
      // Fall back to the published figures rather than leaving the row at zero.
      .catch(() => !cancelled && setData({}));
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => [
    { icon: Users, value: data?.members ?? 94, labelKey: "heroStats.members" },
    { icon: Wrench, value: data?.workshops ?? 7, labelKey: "heroStats.workshops" },
    { icon: Rocket, value: data?.projects ?? 15, labelKey: "heroStats.projects" },
    { icon: Trophy, value: data?.competitions ?? 10, labelKey: "heroStats.competitions" },
  ], [data]);

  useEffect(() => {
    if (!data) return;
    const el = ref.current;
    if (!el) return;

    // Counting up is decoration; if motion is reduced, just state the numbers.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCounts(Object.fromEntries(stats.map((s, i) => [i, s.value])));
      return;
    }

    const timers = [];
    const run = () => {
      stats.forEach((s, idx) => {
        const step = Math.max(1, Math.ceil(s.value / 30));
        let current = 0;
        const timer = setInterval(() => {
          current = Math.min(current + step, s.value);
          setCounts((prev) => ({ ...prev, [idx]: current }));
          if (current >= s.value) clearInterval(timer);
        }, 40);
        timers.push(timer);
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);

    // Every one of these used to outlive the component - the intervals were
    // never cleared, so navigating away left them ticking against a dead tree.
    return () => {
      observer.disconnect();
      timers.forEach(clearInterval);
    };
  }, [data, stats]);

  return (
    <div
      ref={ref}
      className="w-full border-t py-6 md:py-12"
      style={{ background: 'var(--color-surface-alt)', borderColor: 'var(--color-border-light)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.labelKey}
            className="flex flex-col items-center justify-center text-center rounded-2xl shadow-sm px-4 py-6 md:py-8"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border-light)' }}
          >
            <s.icon size={24} className="mb-3" style={{ color: 'var(--color-accent)' }} aria-hidden="true" />
            <div
              className="text-2xl sm:text-3xl lg:text-4xl mb-1"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
            >
              {counts[i] ?? 0}+
            </div>
            <div className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {t(s.labelKey)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section
      className="flex flex-col min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]"
      style={{ background: 'var(--color-hero)' }}
    >
      {/* pt clears the fixed header, which was cropping the eyebrow on small
          screens. */}
      <div className="flex flex-1 flex-col lg:flex-row px-6 sm:px-8 lg:px-16 gap-10 lg:gap-8 items-center max-w-7xl mx-auto w-full pt-24 pb-12 sm:pt-28 sm:pb-16 lg:py-20">
        <HeroLeft />
        <HeroRight />
      </div>
      <StatsBar />
    </section>
  );
}
