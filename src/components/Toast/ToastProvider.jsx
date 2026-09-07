/* eslint-disable react/prop-types */
import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";
import { ToastContext } from "./ToastContext";
import "./Toast.css";

const ICONS = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

const DEFAULT_DURATION = 4000;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    ({ type = "info", message, duration }) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setToasts((current) => [
        ...current.slice(-3), // keep at most 4 on screen
        { id, type, message },
      ]);

      const ms = duration ?? DEFAULT_DURATION;
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), ms),
      );

      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="hm-toast-stack" role="region" aria-label="Notifications">
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type] ?? FiInfo;
            return (
              <div
                key={toast.id}
                className={`hm-toast hm-toast--${toast.type}`}
                role={toast.type === "error" ? "alert" : "status"}
              >
                <Icon className="hm-toast__icon" aria-hidden="true" />
                <p className="hm-toast__message">{toast.message}</p>
                <button
                  type="button"
                  className="hm-toast__close"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(toast.id)}
                >
                  <FiX />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
