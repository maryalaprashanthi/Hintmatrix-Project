/* eslint-disable react/prop-types */
import "./AnalyticsScopeTabs.css";

export default function AnalyticsScopeTabs({ tabs, value, onChange }) {
  return <div className="analytics-scope-field">
    <span className="analytics-scope-label">Scope</span>
    <div className="analytics-scope-tabs" role="group" aria-label="Analytics scope">
      {tabs.map((tab) => <button key={tab.key} type="button"
        aria-pressed={value === tab.key} onClick={() => onChange(tab.key)}>
        {tab.label}
      </button>)}
    </div>
  </div>;
}
