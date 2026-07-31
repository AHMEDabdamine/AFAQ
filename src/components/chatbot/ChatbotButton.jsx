import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function ChatbotButton({ open, onClick }) {
  const { t } = useTranslation();

  return (
    // `end-6` rather than `right-6` so the launcher sits on the correct side
    // in Arabic. Hidden entirely while the panel is open - the panel has its
    // own close button, and the second floating X used to overlap it.
    <div className="fixed bottom-6 end-6 z-[99]">
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="flex items-center justify-center cursor-pointer bg-transparent border-none p-0 rounded-full"
            aria-label={t("chat.open", "Open the AFAQ assistant")}
            aria-expanded={open}
          >
            <img
              src="/images/ai/aufu.webp"
              alt=""
              aria-hidden="true"
              className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-lg"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
