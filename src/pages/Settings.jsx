/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiLock, FiSave, FiSettings } from "react-icons/fi";
import SettingsService from "../services/SettingsService";
import UserService from "../services/UserService";
import NotificationService from "../services/NotificationService";
import { readSettingsViewState, saveSettingsViewState } from "../utils/settingsViewState";
import { parseNotificationPreferences } from "../utils/notificationPreferences";
import "./Account/AccountPages.css";

export default function Settings() {
  const [section, setSection] = useState("general");
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [saved, setSaved] = useState(false);
  const [retry, setRetry] = useState(0);
  const [announcement, setAnnouncement] = useState({ title: "", message: "" });
  const [sending, setSending] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");
  const [announcementStatus, setAnnouncementStatus] = useState("");
  const alive = useRef(false);
  const saveLock = useRef(false);
  const sendLock = useRef(false);

  useEffect(() => {
    let active = true;
    alive.current = true;
    setLoading(true); setError(""); setProfileError(""); setSaved(false);
    Promise.allSettled([SettingsService.getMine(), UserService.getMyProfile()]).then(([preferences, account]) => {
      if (!active) return;
      try {
        if (preferences.status !== "fulfilled") throw new Error();
        const data = parseNotificationPreferences(preferences.value.data);
        const accountProfile = account.status === "fulfilled" ? account.value.data : null;
        const view = accountProfile?.userId ? readSettingsViewState(accountProfile.userId, data) : null;
        setSettings(view?.draft || data); setBaseline(data);
        if (view) {
          setSection(view.section === "announcements" && accountProfile.role !== "SUPER_ADMIN" ? "general" : view.section);
          if (accountProfile.role === "SUPER_ADMIN") setAnnouncement(view.announcement);
        }
      } catch {
        setSettings(null); setBaseline(null);
        setError("Unable to load your settings. Please retry.");
      }
      if (account.status === "fulfilled" && account.value.data?.userId) setProfile(account.value.data);
      else { setProfile(null); setProfileError("Unable to load your account details."); }
      setLoading(false);
    });
    return () => { active = false; alive.current = false; };
  }, [retry]);

  useEffect(() => {
    if (loading || !profile?.userId || !settings || !baseline) return;
    saveSettingsViewState(profile.userId, { section, draft: settings, baseline,
      announcement: profile.role === "SUPER_ADMIN" ? announcement : { title: "", message: "" } });
  }, [loading, profile, settings, baseline, section, announcement]);

  const dirty = settings && JSON.stringify(settings) !== JSON.stringify(baseline);
  const toggle = (key) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
    setSaved(false);
  };
  const saveSettings = async () => {
    if (!dirty || saveLock.current || loading) return;
    saveLock.current = true; setSaving(true); setError(""); setSaved(false);
    try {
      const { data } = await SettingsService.saveMine(settings);
      const updated = parseNotificationPreferences(data);
      if (!alive.current) return;
      setSettings(updated); setBaseline(updated); setSaved(true);
      window.dispatchEvent(new CustomEvent("user-settings-changed", {
        detail: { preferences: updated, identity: localStorage.getItem("token") || "" },
      }));
      // Notify other tabs without storing preferences or leaking them between accounts.
      try { localStorage.setItem("user-settings-changed", String(Date.now())); }
      catch { /* Saving still succeeds when browser storage is disabled. */ }
    } catch {
      if (alive.current) setError("Unable to save your settings. Your changes have not been saved. Please retry.");
    } finally {
      saveLock.current = false;
      if (alive.current) setSaving(false);
    }
  };
  const valueOf = (value) => value == null || value === "" ? "Not provided" : String(value);
  const lastLogin = profile?.lastLoginAt ? new Date(profile.lastLoginAt) : null;
  const isSuperAdmin = profile?.role === "SUPER_ADMIN";
  const sendAnnouncement = async (event) => {
    event.preventDefault();
    if (!isSuperAdmin || sendLock.current) return;
    const request = { title: announcement.title.trim(), message: announcement.message.trim() };
    if (!request.title || !request.message) {
      setAnnouncementError("Enter an announcement title and message.");
      return;
    }
    sendLock.current = true; setSending(true); setAnnouncementError(""); setAnnouncementStatus("");
    try {
      const { data } = await NotificationService.announce(request);
      if (!alive.current) return;
      setAnnouncement({ title: "", message: "" });
      setAnnouncementStatus(`Announcement sent to ${data.recipientCount} users.`);
      window.dispatchEvent(new Event("notifications-changed"));
    } catch (failure) {
      if (alive.current) setAnnouncementError(failure.response?.status === 403
        ? "Only Super Admins can send announcements."
        : "Unable to confirm announcement delivery. Your draft has been kept. Check notifications before retrying.");
    } finally {
      sendLock.current = false;
      if (alive.current) setSending(false);
    }
  };

  return (
    <main className="account-page">
      <header className="account-page-header">
        <div>
          <span className="account-eyebrow">Preferences</span>
          <h1>Settings</h1>
          <p>Manage your account information and in-app notification preferences.</p>
        </div>
        <button className="account-primary-button" type="button" onClick={saveSettings}
          disabled={loading || saving || !dirty}>
          <FiSave /> {saving ? "Saving..." : "Save changes"}
        </button>
      </header>
      {error && <div className="alert alert-danger" role="alert">
        {error} {!settings && <button type="button" className="btn btn-link" onClick={() => setRetry((value) => value + 1)}>Retry</button>}
      </div>}
      {saved && <p role="status" className="alert alert-success">Your settings have been saved.</p>}
      {loading ? <div className="account-card" role="status">Loading your settings...</div> : (
        <div className="settings-layout">
          <nav className="settings-nav" aria-label="Settings sections">
            {[["general", "General", FiSettings], ["notifications", "Notifications", FiBell], ["security", "Security", FiLock],
              ...(isSuperAdmin ? [["announcements", "Product announcements", FiBell]] : [])].map(([key, label, Icon]) => (
              <button key={key} className={section === key ? "active" : ""} type="button"
                aria-pressed={section === key} onClick={() => setSection(key)}><Icon /> {label}</button>
            ))}
          </nav>
          <div className="settings-content">
            {profileError && <div className="alert alert-warning" role="alert">{profileError}
              <button type="button" className="btn btn-link" disabled={saving || dirty} onClick={() => setRetry((value) => value + 1)}>Retry</button>
            </div>}
            {section === "general" && <section className="account-card settings-section">
              <div className="account-card-heading"><div><h2>Account</h2><p>Your current account details. View only.</p></div><FiSettings /></div>
              <div className="details-grid">
                {[["Full name", profile?.name], ["Email address", profile?.email], ["Role", profile?.role?.replaceAll("_", " ")],
                  ["User ID", profile?.userId]].map(([label, value]) => <div key={label}><span>{label}</span><p>{valueOf(value)}</p></div>)}
              </div>
              <Link to="/profile" className="btn btn-link">View full profile</Link>
            </section>}
            {section === "notifications" && <section className="account-card settings-section">
              <div className="account-card-heading"><div><h2>Notifications</h2><p>These preferences control popups. Notifications remain available in the bell.</p></div><FiBell /></div>
              {settings && <>
                <SettingRow id="notification-popups" title="Notification popups" description="Show new notification popups across the application, except during exams and mock exams."
                  checked={settings.notificationPopups} disabled={saving} onChange={() => toggle("notificationPopups")} />
                <SettingRow id="activity-reminders" title="Activity reminders" description="Show exam and attendance reminder popups."
                  checked={settings.activityReminders} disabled={saving || !settings.notificationPopups} onChange={() => toggle("activityReminders")} />
                <SettingRow id="product-announcements" title="Product announcement popups" description="Show system and product announcement popups."
                  checked={settings.productAnnouncements} disabled={saving || !settings.notificationPopups} onChange={() => toggle("productAnnouncements")} />
              </>}
              <div className="setting-row"><div><strong>Email notifications</strong><span>Email delivery is not available yet.</span></div><span>Unavailable</span></div>
            </section>}
            {section === "announcements" && isSuperAdmin && <section className="account-card settings-section">
              <div className="account-card-heading"><div><h2>Product announcements</h2><p>Send an update to all active users, including students and administrators.</p></div><FiBell /></div>
              <p>Every recipient receives it in the notification bell. Popup preferences and exam restrictions still apply.</p>
              <form onSubmit={sendAnnouncement}>
                <label className="form-label" htmlFor="announcement-title">Title</label>
                <input id="announcement-title" className="form-control mb-3" value={announcement.title} required maxLength={160} disabled={sending}
                  onChange={(event) => { setAnnouncement((current) => ({ ...current, title: event.target.value })); setAnnouncementStatus(""); }} />
                <label className="form-label" htmlFor="announcement-message">Update message</label>
                <textarea id="announcement-message" className="form-control" value={announcement.message} required maxLength={500} rows={5} disabled={sending}
                  aria-describedby="announcement-length" onChange={(event) => { setAnnouncement((current) => ({ ...current, message: event.target.value })); setAnnouncementStatus(""); }} />
                <p id="announcement-length" className="text-muted mt-2">{announcement.message.length}/500 characters</p>
                {announcementError && <p className="alert alert-danger" role="alert">{announcementError}</p>}
                {announcementStatus && <p className="alert alert-success" role="status">{announcementStatus}</p>}
                <div className="settings-announcement-actions">
                  <button type="submit" className="account-primary-button" disabled={sending || !announcement.title.trim() || !announcement.message.trim()}>
                    {sending ? "Sending..." : "Send to all users"}
                  </button>
                </div>
              </form>
            </section>}
            {section === "security" && <section className="account-card settings-section">
              <div className="account-card-heading"><div><h2>Security</h2><p>Your current sign-in information.</p></div><FiLock /></div>
              <div className="setting-row"><div><strong>Login type</strong><span>{valueOf(profile?.loginType?.replaceAll("_", " "))}</span></div></div>
              <div className="setting-row"><div><strong>Last login</strong><span>{lastLogin && !Number.isNaN(lastLogin.getTime()) ? lastLogin.toLocaleString() : "Not provided"}</span></div></div>
              <div className="setting-row"><div><strong>Two-factor authentication</strong><span>Two-factor authentication is not available yet.</span></div><span>Unavailable</span></div>
            </section>}
            {dirty && <button className="btn btn-outline-secondary" type="button" disabled={saving}
              onClick={() => { setSettings(baseline); setSaved(false); setError(""); }}>Discard changes</button>}
          </div>
        </div>
      )}
    </main>
  );
}

function SettingRow({ id, title, description, checked, disabled, onChange }) {
  return (
    <div className="setting-row">
      <div><label htmlFor={id}><strong>{title}</strong></label><span id={id + "-description"}>{description}</span></div>
      <label className="account-switch">
        <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={onChange} aria-describedby={id + "-description"} />
        <span aria-hidden="true" />
      </label>
    </div>
  );
}
