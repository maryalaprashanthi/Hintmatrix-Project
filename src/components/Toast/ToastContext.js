import { createContext } from "react";

// { push({ type, message, duration }) => id, dismiss(id) }
export const ToastContext = createContext(null);
