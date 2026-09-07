import { useContext } from "react";
import { ToastContext } from "./ToastContext";

// Lightweight notifications - a replacement for alert() and the full-screen
// SuccessModal / DeleteModal cards.
//
//   const toast = useToast();
//   toast.success("Chapter saved");
//   toast.error("Couldn't save chapter");
//   toast.info("Upload started");
//
// Falls back to console + alert if used outside <ToastProvider> so a missing
// provider never crashes a page.
export function useToast() {
  const ctx = useContext(ToastContext);

  const push = (type, message, duration) => {
    if (!message) return;
    if (ctx) {
      ctx.push({ type, message: String(message), duration });
    } else {
      console[type === "error" ? "error" : "log"](`[toast:${type}]`, message);
    }
  };

  return {
    success: (message, duration) => push("success", message, duration),
    error: (message, duration) => push("error", message, duration ?? 6000),
    info: (message, duration) => push("info", message, duration),
    dismiss: (id) => ctx?.dismiss(id),
  };
}

export default useToast;
