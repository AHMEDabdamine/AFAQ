import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

function autoLink(text) {
  return text.replace(/\b(https?:\/\/[^\s<)>]+)/g, (match, offset, str) => {
    const before = str[offset - 1];
    if (before === "<" || before === "(" || before === "[") return match;
    return `<${match}>`;
  });
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatMessage({ role, content, streaming, id }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";
  // Was recomputed on every render, so every bubble showed the current clock
  // time and they all ticked forward together. The id is the send timestamp.
  const sentAt = useMemo(() => formatTime(id ?? Date.now()), [id]);

  if (!isUser && !content && !streaming) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={streaming ? {} : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          background: isUser ? "var(--color-accent)" : "var(--color-bg-alt)",
          color: isUser ? "var(--color-on-accent)" : "var(--color-text-muted)",
        }}
      >
        {isUser ? (
          <User size={14} />
        ) : (
          <img
            src="/images/ai/pfp.webp"
            alt="" aria-hidden="true"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div
        className={`flex flex-col max-w-[85%] md:max-w-[80%] group ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed prose prose-sm max-w-none"
          style={{
            background: isUser ? "var(--color-accent)" : "var(--color-bg-alt)",
            color: isUser ? "var(--color-on-accent)" : "var(--color-text)",
            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            hyphens: "auto",
          }}
        >
          {isUser ? (
            content
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-1 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-0.5 my-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-0.5 my-1">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li>{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => <em>{children}</em>,
                code: ({ children }) => (
                  <code
                    className="text-xs px-1 py-0.5 rounded"
                    style={{ background: "var(--color-border-light)" }}
                  >
                    {children}
                  </code>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--color-accent)",
                      wordBreak: "break-all",
                    }}
                    className="underline hover:opacity-80"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {autoLink(content) || ""}
            </ReactMarkdown>
          )}
          {streaming && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: "0.9em",
                background: "currentColor",
                borderRadius: 1,
                marginLeft: 2,
                verticalAlign: "middle",
                opacity: 0.7,
                animation: "cursor-blink 0.8s step-end infinite",
              }}
            />
          )}
        </div>

        {!streaming && (
          <div className="flex items-center gap-2 mt-1 px-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <span
              className="text-[10px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              {sentAt}
            </span>
            {!isUser && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: "var(--color-text-muted)" }}
                title={copied ? t("chat.copied", "Copied") : t("chat.copy", "Copy reply")}
                aria-label={copied ? t("chat.copied", "Copied") : t("chat.copy", "Copy reply")}
              >
                {copied ? <Check size={11} aria-hidden="true" /> : <Copy size={11} aria-hidden="true" />}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
