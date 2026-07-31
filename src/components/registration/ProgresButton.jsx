// Progres MESRS auto-fill integration
import { useState, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { useTranslation, Trans } from "react-i18next";
import { X, Loader2, ShieldCheck } from "lucide-react";
import useProgresAuth from "../../hooks/useProgresAuth";
import useScrollLock from "../../hooks/useScrollLock";
import useFocusTrap from "../../hooks/useFocusTrap";

export default function ProgresButton({ onSuccess }) {
  const { t } = useTranslation("common");
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error, reset } = useProgresAuth();

  const fieldId = useId();
  const userId = `${fieldId}-user`;
  const passId = `${fieldId}-pass`;
  const errorId = `${fieldId}-error`;

  const open = useCallback(() => {
    setModalOpen(true);
    setUsername("");
    setPassword("");
    reset();
  }, [reset]);

  const close = useCallback(() => {
    setModalOpen(false);
    reset();
  }, [reset]);

  useScrollLock(modalOpen);
  const modalRef = useFocusTrap(modalOpen, close);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(username, password);
      onSuccess?.(data);
      close();
    } catch {
      /* surfaced through the hook's error state */
    }
  };

  const dialog = (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${fieldId}-title`}
        className="modal-card"
        style={{ maxWidth: 430, padding: "32px 28px" }}
      >
        <button
          type="button"
          onClick={close}
          className="modal-close"
          aria-label={t("progres.close", "Close")}
        >
          <X size={20} aria-hidden="true" />
        </button>

        <h2
          id={`${fieldId}-title`}
          style={{ margin: "0 0 6px", fontSize: 20, paddingInlineEnd: 40 }}
        >
          {t("progres.title")}
        </h2>

        <p
          style={{
            margin: "0 0 22px",
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "var(--color-text-muted)",
          }}
        >
          <Trans
            i18nKey="progres.subtitle"
            ns="common"
            components={{
              strong: <strong />,
              red: <span style={{ color: "var(--color-danger)", fontWeight: 600 }} />,
            }}
          />
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div>
            <label className="form-label" htmlFor={userId}>
              {t("progres.usernameLabel")}
            </label>
            <input
              id={userId}
              className="form-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              data-autofocus
            />
          </div>

          <div>
            <label className="form-label" htmlFor={passId}>
              {t("progres.passwordLabel")}
            </label>
            <input
              id={passId}
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
          </div>

          {/* role="alert" so a failed sign-in is announced, not just coloured. */}
          {error && (
            <p id={errorId} role="alert" className="field-error" style={{ paddingInlineStart: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-accent btn-md"
            style={{ marginTop: 4 }}
          >
            {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {loading ? t("progres.submitting") : t("progres.submit")}
          </button>

          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              margin: 0,
              fontSize: 12,
              color: "var(--color-text-muted)",
            }}
          >
            <ShieldCheck size={14} className="shrink-0" aria-hidden="true" />
            {t(
              "progres.privacy",
              "Your credentials go straight to Progres and are never stored."
            )}
          </p>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="btn btn-accent btn-sm"
      >
        <img
          src="/images/logo/progres.webp"
          alt=""
          aria-hidden="true"
          className="w-5 h-5 rounded-full"
        />
        {t("progres.button")}
      </button>

      {/* Rendered into <body>: inside the page the dialog inherited the
          section's `relative z-0` stacking context, so its z-index couldn't
          beat the navbar and it appeared clipped behind it. */}
      {modalOpen && createPortal(dialog, document.body)}
    </>
  );
}
