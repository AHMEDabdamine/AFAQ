import useTheme from "../../hooks/useTheme";

/**
 * The mark. `variant` forces a colourway; by default it follows the active
 * theme.
 *
 * It used to swap on `prefers-color-scheme: dark` alone, which put the white
 * mark on the permanently white navbar - invisible for anyone whose OS was in
 * dark mode while the site was not.
 *
 * Pass `decorative` where the AFAQ wordmark is already next to it, so screen
 * readers don't announce the name twice.
 */
export default function Logo({ size = 44, variant = "auto", decorative = false }) {
  const { isDark } = useTheme();
  const resolved = variant === "auto" ? (isDark ? "white" : "black") : variant;
  const src =
    resolved === "white"
      ? "/images/logo/logo_trnsp_white.webp"
      : "/images/logo/logo_trnsp_black.webp";

  return (
    <img
      src={src}
      alt={decorative ? "" : "AFAQ Scientific Club"}
      aria-hidden={decorative || undefined}
      width={size}
      height={size}
      style={{ objectFit: "contain", width: size, height: size }}
    />
  );
}
