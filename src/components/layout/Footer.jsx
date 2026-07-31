import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Logo from "../shared/Logo";
import SocialIcons from "../shared/SocialIcons";
import { Mail, MapPin } from "lucide-react";
import {
  TextHoverEffect,
  FooterBackgroundGradient,
} from "@/components/ui/hover-footer";

const spring = { type: "spring", damping: 28, stiffness: 120 };

/** Every destination in the site, so the footer works as a real site map. */
const NAV_ITEMS = [
  { key: "about", path: "/about" },
  { key: "projects", path: "/projects" },
  { key: "events", path: "/events" },
  { key: "gallery", path: "/gallery" },
  { key: "announcements", path: "/announcements" },
  { key: "join", path: "/join" },
  { key: "contact", path: "/contact" },
];

export default function Footer() {
  const { t } = useTranslation();

  const contactInfo = [
    {
      icon: Mail,
      text: "afaqclub.bouira@gmail.com",
      href: "mailto:afaqclub.bouira@gmail.com",
    },
    { icon: MapPin, text: "Bouira, Algeria" },
  ];

  return (
    // The footer was translucent dark over a light page, which left near-black
    // body text sitting on mid-grey. It's now solidly dark, so the light type
    // and the #3ca2fa accent both clear AA comfortably.
    <footer className="on-dark relative h-fit bg-[#0a1220] text-[#b3c2da]">
      <FooterBackgroundGradient />

      <div className="max-w-7xl mx-auto px-6 py-14 md:px-14 md:py-16 z-10 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={spring}
            className="flex flex-col gap-4"
          >
            <Link to="/" className="flex items-center gap-2.5 w-fit">
              <Logo size={40} variant="white" decorative />
              <span
                className="text-3xl text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                AFAQ
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>
            <SocialIcons className="mt-1" />
          </motion.div>

          <motion.nav
            aria-label={t("footer.quickLinks")}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ ...spring, delay: 0.1 }}
          >
            <h2 className="text-base font-semibold mb-5 text-white">
              {t("footer.quickLinks")}
            </h2>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    className="text-sm text-[#c7d2e4] hover:text-[#3ca2fa] transition-colors"
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ ...spring, delay: 0.2 }}
          >
            <h2 className="text-base font-semibold mb-5 text-white">
              {t("footer.connect")}
            </h2>
            <ul className="flex flex-col gap-4 list-none p-0 m-0">
              {contactInfo.map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <item.icon
                    size={18}
                    className="text-[#3ca2fa] shrink-0"
                    aria-hidden="true"
                  />
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm text-[#c7d2e4] hover:text-[#3ca2fa] transition-colors break-all"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-sm">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <hr className="border-0 border-t border-white/12 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-[#8fa0bb]">
          <p className="text-center md:text-start">
            &copy; {new Date().getFullYear()} AFAQ Scientific Club.{" "}
            {t("footer.rights")}
          </p>
          <p>{t("footer.university")}</p>
        </div>

        {/* Purely ornamental wordmark - hidden from assistive tech, and no
            longer wearing a pointer cursor it can't honour. */}
        <div
          className="flex w-full h-[6rem] sm:h-[9rem] md:h-[12rem] lg:h-[15rem] mt-6 md:mt-10"
          aria-hidden="true"
        >
          <TextHoverEffect text="AFAQ" />
        </div>
      </div>
    </footer>
  );
}
