/* eslint-disable react/prop-types */
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import NotificationService from "../../services/NotificationService";
import { NotificationContext } from "./NotificationContext";
import { ToastContext } from "../Toast/ToastContext";
import { collectNewNotifications, suppressNotificationPopup } from "../../utils/notificationUpdates";

export default function NotificationProvider({ children }) {
  const location = useLocation();
  const [, refreshIdentity] = useState(0);
  useEffect(() => {
    const storage = (event) => {
      if (event.key === "token" || event.key === null) refreshIdentity((value) => value + 1);
    };
    window.addEventListener("storage", storage);
    return () => window.removeEventListener("storage", storage);
  }, []);
  const identity = localStorage.getItem("token") || "";
  return <NotificationSession key={identity} enabled={Boolean(identity)} path={location.pathname}>{children}</NotificationSession>;
}

function NotificationSession({ children, enabled, path }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setLoading] = useState(false);
  const [notificationError, setError] = useState("");
  const [notificationsBusy, setBusy] = useState(false);
  const flight = useRef(null);
  const mutating = useRef(false);
  const active = useRef(false);
  const seen = useRef(null);
  const pending = useRef(new Map());
  const toastIds = useRef([]);
  const currentPath = useRef(path);
  currentPath.current = path;
  const { push, dismiss } = useContext(ToastContext);

  const announce = useCallback(() => {
    if (suppressNotificationPopup(currentPath.current) || document.visibilityState === "hidden") return;
    const items = [...pending.current.values()];
    pending.current.clear();
    if (!items.length) return;
    toastIds.current.push(push({ type: "info", duration: 7000, message: items.length === 1
      ? `New notification: ${items[0].title}. ${items[0].message || ""}`
      : `You have ${items.length} new notifications. Open the bell to view them.` }));
    toastIds.current = toastIds.current.slice(-4);
  }, [push]);

  const loadNotifications = useCallback(({ showLoading = false, force = false } = {}) => {
    if (!enabled) return Promise.resolve(false);
    if (mutating.current && !force) return Promise.resolve(false);
    if (flight.current) return flight.current;
    if (showLoading) setLoading(true);
    const request = (async () => {
      try {
        // Notifications must stay live; the former loadOncePerLogin cache hid new arrivals.
        const [itemsResponse, countResponse] = await Promise.all([
          NotificationService.getMine(100), NotificationService.getUnreadCount(),
        ]);
        if (!active.current) return false;
        if (!Array.isArray(itemsResponse.data) || !Number.isFinite(Number(countResponse.data?.unreadCount))) {
          throw new Error("Invalid notification response");
        }
        const items = itemsResponse.data;
        const update = collectNewNotifications(items, seen.current);
        seen.current = update.seen;
        for (const item of update.incoming) pending.current.set(item.notificationId, item);
        for (const item of items) if (item.read) pending.current.delete(item.notificationId);
        setNotifications(items);
        setUnreadCount(Number(countResponse.data.unreadCount));
        setError("");
        announce();
        return true;
      } catch {
        if (active.current) setError("Unable to refresh notifications. Please retry.");
        return false;
      } finally {
        if (active.current) setLoading(false);
      }
    })();
    flight.current = request;
    request.finally(() => { if (flight.current === request) flight.current = null; });
    return request;
  }, [enabled, announce]);

  useEffect(() => {
    active.current = true;
    if (!enabled) return () => { active.current = false; };
    loadNotifications({ showLoading: true });
    const refresh = () => { if (document.visibilityState !== "hidden") loadNotifications(); };
    const interval = window.setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);
    window.addEventListener("notifications-changed", refresh);
    window.addEventListener("storage", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active.current = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("notifications-changed", refresh);
      window.removeEventListener("storage", refresh);
      document.removeEventListener("visibilitychange", refresh);
      toastIds.current.forEach(dismiss);
    };
  }, [loadNotifications, dismiss, enabled]);

  useEffect(() => {
    if (suppressNotificationPopup(path)) {
      toastIds.current.forEach(dismiss);
      toastIds.current = [];
    } else announce();
  }, [path, announce, dismiss]);

  const markNotificationsRead = async (id) => {
    if (mutating.current) return false;
    mutating.current = true;
    setBusy(true);
    try {
      // Finish an older snapshot before writing, then always fetch a fresh server count.
      if (flight.current) await flight.current;
      if (id == null) await NotificationService.markAllRead();
      else await NotificationService.markRead(id);
      if (!active.current) return false;
      return await loadNotifications({ force: true });
    } catch {
      if (active.current) setError("Could not mark notification as read. Please retry.");
      return false;
    } finally {
      mutating.current = false;
      if (active.current) setBusy(false);
    }
  };

  return <NotificationContext.Provider value={{ notifications, unreadCount, notificationsLoading,
    notificationError, notificationsBusy, loadNotifications, markNotificationsRead }}>{children}</NotificationContext.Provider>;
}
