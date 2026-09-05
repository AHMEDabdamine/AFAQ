export function triggerHaptic(type = "light") {
  if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.vibrate) {
    return;
  }
  try {
    switch (type) {
      case "light":
        navigator.vibrate(12);
        break;
      case "medium":
        navigator.vibrate(24);
        break;
      case "heavy":
        navigator.vibrate(40);
        break;
      case "success":
        navigator.vibrate([15, 35, 20]);
        break;
      case "celebrate":
        navigator.vibrate([20, 30, 20, 30, 40]);
        break;
      default:
        if (typeof type === "number" || Array.isArray(type)) {
          navigator.vibrate(type);
        }
        break;
    }
  } catch {
    /* ignore unsupported vibration calls */
  }
}
