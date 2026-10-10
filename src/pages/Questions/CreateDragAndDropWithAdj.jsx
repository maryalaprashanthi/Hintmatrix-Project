/* eslint-disable react/prop-types */
import Select from "react-select";
import { getQuestionAttributeSide } from "../../utils/questionAttributeSide";
import { emptyAdjustmentForm } from "./adjustmentQuestionForm";
import "./CreateDragAndDropWithAdj.css";

export default function CreateDragAndDropWithAdj({ value, onChange, attributes, disabled = false }) {
  const update = (section, index, field, next) => onChange({ ...value,
    [section]: value[section].map((row, i) => i === index ? { ...row, [field]: next } : row) });
  const add = (section) => onChange({ ...value, [section]: [...value[section], emptyAdjustmentForm()[section][0]] });
  const remove = (section, index) => onChange({ ...value, [section]: value[section].filter((_, i) => i !== index) });
  const select = (id, onSelect, side, label) => {
    const options = attributes.filter((item) => item.activeRow !== false && (!side ||
      getQuestionAttributeSide({ headerName: item.tableHeaderName }) === side))
      .map((item) => ({ value: String(item.attributeId), label: item.name ?? item.attributeName }));
    return <Select inputId={label} aria-label={label} classNamePrefix="adj-create-select"
      options={options} value={options.find((option) => option.value === String(id)) ??
        (id ? { value: String(id), label: `Account ${id}` } : null)}
      onChange={(option) => onSelect(option?.value ?? "")} placeholder={side ? `Please choose ${side === "debit" ? "DR" : "CR"} option` : "Please choose adjustment"}
      isSearchable isClearable isDisabled={disabled} menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 10000 }) }} />;
  };
  const amount = (section, index, field, label) => <input type="number" min="0" step="0.01" aria-label={label}
    value={value[section][index][field]} disabled={disabled} onChange={(event) => update(section, index, field, event.target.value)} />;
  return <div className="adj-create">
    <section aria-label="Trial balance"><h2>Trial Balance</h2><div className="adj-create-table"><table>
      <thead><tr><th>Debit Balance</th><th>Amount (Rs.)</th><th>Credit Balance</th><th>Amount (Rs.)</th><th /></tr></thead>
      <tbody>{value.balances.map((row, index) => <tr key={index}>
        <td>{select(row.debitAttributeId, (id) => update("balances", index, "debitAttributeId", id), "debit", `Debit account ${index + 1}`)}</td>
        <td>{amount("balances", index, "debitAmount", `Debit amount ${index + 1}`)}</td>
        <td>{select(row.creditAttributeId, (id) => update("balances", index, "creditAttributeId", id), "credit", `Credit account ${index + 1}`)}</td>
        <td>{amount("balances", index, "creditAmount", `Credit amount ${index + 1}`)}</td>
        <td><button type="button" disabled={disabled || value.balances.length === 1} aria-label={`Remove balance row ${index + 1}`} onClick={() => remove("balances", index)}>×</button></td>
      </tr>)}</tbody></table></div><button type="button" disabled={disabled} onClick={() => add("balances")}>Add Row</button>
    </section>
    <section aria-label="Adjustments"><h2>Adjustments</h2><div className="adj-create-table"><table>
      <thead><tr><th>Adjustments</th><th>Amount (Rs.)</th><th /></tr></thead>
      <tbody>{value.adjustments.map((row, index) => <tr key={index}>
        <td>{select(row.attributeId, (id) => update("adjustments", index, "attributeId", id), null, `Adjustment account ${index + 1}`)}
          <details><summary>Adjustment information / second amount</summary>
            <label>Information<textarea aria-label={`Adjustment information ${index + 1}`} value={row.note} disabled={disabled}
              onChange={(event) => update("adjustments", index, "note", event.target.value)} /></label>
            <label>Amount 2 (optional){amount("adjustments", index, "amount2", `Adjustment second amount ${index + 1}`)}</label>
          </details>
        </td><td>{amount("adjustments", index, "amount", `Adjustment amount ${index + 1}`)}</td>
        <td><button type="button" disabled={disabled || value.adjustments.length === 1} aria-label={`Remove adjustment row ${index + 1}`} onClick={() => remove("adjustments", index)}>×</button></td>
      </tr>)}</tbody></table></div><button type="button" disabled={disabled} onClick={() => add("adjustments")}>Add Adj Row</button>
    </section>
  </div>;
}

export function AdjustmentQuestionPreview({ value, attributeLabel }) {
  return <div className="adj-create">
    <h3>Trial Balance</h3><table><thead><tr><th>Debit Balance</th><th>Amount (Rs.)</th><th>Credit Balance</th><th>Amount (Rs.)</th></tr></thead>
      <tbody>{value.balances.map((row, index) => <tr key={index}><td>{row.debitAttributeId ? attributeLabel(row.debitAttributeId) : "—"}</td><td>{row.debitAmount}</td>
        <td>{row.creditAttributeId ? attributeLabel(row.creditAttributeId) : "—"}</td><td>{row.creditAmount}</td></tr>)}</tbody></table>
    <h3>Adjustments</h3><table><thead><tr><th>Adjustments</th><th>Amount (Rs.)</th></tr></thead><tbody>
      {value.adjustments.filter((row) => row.attributeId).map((row, index) => <tr key={index}><td>{attributeLabel(row.attributeId)}{row.note && <p>{row.note}</p>}</td>
        <td>{row.amount}{row.amount2 !== "" && row.amount2 != null && <div>Amount 2: {row.amount2}</div>}</td></tr>)}
    </tbody></table>
  </div>;
}
