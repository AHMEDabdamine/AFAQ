import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import SideImage from "../shared/SideImage";

const spring = { type: "spring", damping: 28, stiffness: 120 };

export default function IntroSection() {
  const { t } = useTranslation("home");
  const [aboutImage, setAboutImage] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/page-content/home_intro")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.image_url) setAboutImage(data.image_url);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <section
      className="py-16 md:py-20 relative z-0"
    >
      <SideImage side="left" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={spring}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="eyebrow eyebrow-center mb-5">
            {t("intro.eyebrow", "Who we are")}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl mb-6">
            {t("intro.title")}
          </h2>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "var(--color-text-muted)" }}
          >
            {t("intro.description")}
          </p>
        </motion.div>

        {/* Only rendered once there's something to show. It used to draw a
            1000x430 empty dark panel whenever the endpoint returned no image,
            leaving a large blank band in the middle of the page. */}
        {aboutImage && (
          <motion.figure
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ ...spring, delay: 0.15 }}
            className="relative mx-auto mt-16 overflow-hidden rounded-2xl m-0"
            style={{
              maxWidth: 1000,
              aspectRatio: "21/9",
              background: "var(--color-bg-alt)",
              border: "1px solid var(--color-border-light)",
              boxShadow: "0 20px 60px rgba(6, 12, 24, 0.18)",
            }}
          >
            <img
              src={aboutImage}
              alt={t("intro.imageAlt", "Club members at work")}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              style={{ opacity: imgLoaded ? 1 : 0 }}
            />
          </motion.figure>
        )}
      </div>
    </section>
  );
}
