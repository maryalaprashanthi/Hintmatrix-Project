import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ActivitySessionService from "../services/ActivitySessionService";
import { logoutUser } from "../interceptors/axiosInterceptor";
import { useToast } from "../components/Toast/useToast";

const SESSION_KEY = "activitySessionKey";
const LAST_ACTIVITY_KEY = "lastUserActivityAt";
const HEARTBEAT_INTERVAL_MS = 30_000;
const IDLE_AFTER_MS = 5 * 60_000;
const LOGOUT_AFTER_MS = 30 * 60_000;

export default function useActivitySession() {
  const navigate = useNavigate();
  const toast = useToast();
  const toastRef = useRef(toast);
  const sessionKeyRef = useRef(localStorage.getItem(SESSION_KEY));
  const lastActivityRef = useRef(
    Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now(),
  );
  const idleRef = useRef(false);
  const requestInFlightRef = useRef(false);
  const lastRecordedEventRef = useRef(0);
  const sessionExpiredRef = useRef(false);

  toastRef.current = toast;

  useEffect(() => {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivityRef.current));

    const isInactivityExpiry = (error) =>
      error.response?.status === 401 &&
      String(error.response?.data?.message || "")
        .toLowerCase()
        .includes("inactivity");

    const expireForInactivity = () => {
      if (sessionExpiredRef.current) return;
      sessionExpiredRef.current = true;
      toastRef.current.info(
        "Your session expired after 30 minutes of inactivity. Please sign in again.",
        8000,
      );
      logoutUser(navigate);
    };

    const saveSession = (response) => {
      const sessionKey = response.data.sessionKey;
      sessionKeyRef.current = sessionKey;
      localStorage.setItem(SESSION_KEY, sessionKey);
      idleRef.current = response.data.status === "IDLE";
    };

    const startSession = async () => {
      if (requestInFlightRef.current) return;
      requestInFlightRef.current = true;
      try {
        if (sessionKeyRef.current) {
          const response = await ActivitySessionService.resume(
            sessionKeyRef.current,
          );
          saveSession(response);
        } else {
          saveSession(await ActivitySessionService.start());
        }
      } catch (error) {
        if (isInactivityExpiry(error)) {
          expireForInactivity();
          return;
        }
        if (error.response?.status === 401) {
          logoutUser(navigate);
          return;
        }

        // A stale or already closed activity record should not block login.
        if ([404, 409].includes(error.response?.status)) {
          localStorage.removeItem(SESSION_KEY);
          sessionKeyRef.current = null;
          try {
            saveSession(await ActivitySessionService.start());
          } catch {
            // A temporary tracking failure must not log the user out.
          }
        }
      } finally {
        requestInFlightRef.current = false;
      }
    };

    const markActive = () => {
      const now = Date.now();
      if (now - lastRecordedEventRef.current < 1_000) return;
      lastRecordedEventRef.current = now;
      lastActivityRef.current = now;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));

      if (
        idleRef.current &&
        sessionKeyRef.current &&
        !requestInFlightRef.current
      ) {
        requestInFlightRef.current = true;
        ActivitySessionService.resume(sessionKeyRef.current)
          .then(() => {
            idleRef.current = false;
          })
          .catch((error) => {
            if (isInactivityExpiry(error)) expireForInactivity();
            else if (error.response?.status === 401) logoutUser(navigate);
          })
          .finally(() => {
            requestInFlightRef.current = false;
          });
      }
    };

    const checkActivity = async () => {
      const sessionKey = sessionKeyRef.current;
      if (requestInFlightRef.current) return;
      if (!sessionKey) {
        await startSession();
        return;
      }

      const inactiveFor = Date.now() - lastActivityRef.current;
      if (inactiveFor >= LOGOUT_AFTER_MS) {
        expireForInactivity();
        return;
      }

      requestInFlightRef.current = true;
      try {
        if (inactiveFor >= IDLE_AFTER_MS) {
          if (!idleRef.current) {
            await ActivitySessionService.idle(sessionKey);
            idleRef.current = true;
          }
        } else if (document.visibilityState === "visible") {
          await ActivitySessionService.heartbeat(sessionKey);
          idleRef.current = false;
        }
      } catch (error) {
        if (isInactivityExpiry(error)) expireForInactivity();
        else if (error.response?.status === 401) logoutUser(navigate);
        // Network/heartbeat failures intentionally do not log the user out.
      } finally {
        requestInFlightRef.current = false;
      }
    };

    const events = [
      "pointerdown",
      "pointermove",
      "keydown",
      "scroll",
      "touchstart",
    ];
    events.forEach((eventName) =>
      window.addEventListener(eventName, markActive, { passive: true }),
    );
    window.addEventListener("focus", markActive);

    startSession();
    const intervalId = window.setInterval(checkActivity, HEARTBEAT_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      events.forEach((eventName) =>
        window.removeEventListener(eventName, markActive),
      );
      window.removeEventListener("focus", markActive);
    };
  }, [navigate]);
}
