import { useEffect, useState } from "react";
import { FiBell, FiLock, FiMonitor, FiSave, FiSettings } from "react-icons/fi";
import "./Account/AccountPages.css";

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    const saved = JSON.parse(
      localStorage.getItem("hintmatrix-settings") || "null",
    );
    return (
      saved || {
        email: true,
        activity: true,
        product: false,
        compact: false,
        twoFactor: false,
        theme: localStorage.getItem("hintmatrix-theme") || "system",
      }
    );
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const resolved =
        settings.theme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : settings.theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.dataset.themePreference = settings.theme;
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    localStorage.setItem("hintmatrix-theme", settings.theme);
    return () => media.removeEventListener("change", applyTheme);
  }, [settings.theme]);

  const toggle = (key) =>
    setSettings((current) => ({ ...current, [key]: !current[key] }));

  const saveSettings = () => {
    localStorage.setItem("hintmatrix-settings", JSON.stringify(settings));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <main className="account-page">
      <header className="account-page-header">
        <div>
          <span className="account-eyebrow">Preferences</span>
          <h1>Settings</h1>
          <p>Personalize your dashboard experience and account preferences.</p>
        </div>
        <button
          className="account-primary-button"
          type="button"
          onClick={saveSettings}
        >
          <FiSave /> {saved ? "Changes saved" : "Save changes"}
        </button>
      </header>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <button className="active" type="button">
            <FiSettings /> General
          </button>
          <button type="button">
            <FiBell /> Notifications
          </button>
          <button type="button">
            <FiMonitor /> Appearance
          </button>
          <button type="button">
            <FiLock /> Security
          </button>
        </nav>
        <div className="settings-content">
          <section className="account-card settings-section">
            <div className="account-card-heading">
              <div>
                <h2>Notifications</h2>
                <p>Choose which updates you want to receive.</p>
              </div>
              <FiBell />
            </div>
            <SettingRow
              title="Email notifications"
              description="Receive important account and learning updates."
              checked={settings.email}
              onChange={() => toggle("email")}
            />
            <SettingRow
              title="Activity reminders"
              description="Get reminders about pending lessons and exams."
              checked={settings.activity}
              onChange={() => toggle("activity")}
            />
            <SettingRow
              title="Product announcements"
              description="Hear about new tools and improvements."
              checked={settings.product}
              onChange={() => toggle("product")}
            />
          </section>
          <section className="account-card settings-section">
            <div className="account-card-heading">
              <div>
                <h2>Display</h2>
                <p>Adjust how information appears on your dashboard.</p>
              </div>
              <FiMonitor />
            </div>
            <SettingRow
              title="Compact layout"
              description="Reduce spacing to display more content at once."
              checked={settings.compact}
              onChange={() => toggle("compact")}
            />
            <div className="setting-select-row">
              <div>
                <strong>Theme</strong>
                <span>Choose your preferred interface theme.</span>
              </div>
              <select
                value={settings.theme}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    theme: event.target.value,
                  }))
                }
              >
                <option value="system">System default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </section>
          <section className="account-card settings-section">
            <div className="account-card-heading">
              <div>
                <h2>Security</h2>
                <p>Additional protection for your account.</p>
              </div>
              <FiLock />
            </div>
            <SettingRow
              title="Two-factor authentication"
              description="Require an additional verification step at sign in."
              checked={settings.twoFactor}
              onChange={() => toggle("twoFactor")}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function SettingRow({ title, description, checked, onChange }) {
  return (
    <div className="setting-row">
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <label className="account-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span />
      </label>
    </div>
  );
}
