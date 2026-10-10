/* eslint-disable react/prop-types */
import { FaListUl, FaPlus, FaTrash } from "react-icons/fa";

// Both Create All drag-and-drop types use the same balance table and styles.
// The caller keeps its existing draft state and supplies searchable accounts.
export default function DragAndDropAttributeEditor({
  balances, onBalancesChange, renderAttributeSelect,
  adjustments, onAdjustmentsChange, disabled = false,
}) {
  const update = (setter, index, field, value) => setter((rows) =>
    rows.map((row, i) => i === index ? { ...row, [field]: value } : row));
  const remove = (setter, index) => setter((rows) => rows.filter((_, i) => i !== index));
  return <>
    <section className="aq-card aq-ledger-card" aria-label="Debit and credit attributes">
      <div className="aq-section-heading">
        <span className="aq-section-icon"><FaListUl /></span>
        <div><h2>Debit and credit attributes</h2><p>Build the pairs used by the drag-and-drop question.</p></div>
        <button type="button" className="aq-secondary" disabled={disabled}
          onClick={() => onBalancesChange((rows) => [...rows,
            { debitAttributeId: "", debitAmount: "", creditAttributeId: "", creditAmount: "" }])}>
          <FaPlus />Add row
        </button>
      </div>
      <div className="aq-table-wrap"><table>
        <thead><tr><th>Debit</th><th>Debit amount</th><th>Credit</th><th>Credit amount</th><th /></tr></thead>
        <tbody>{balances.map((row, index) => <tr key={index}>
          <td>{renderAttributeSelect(row.debitAttributeId,
            (value) => update(onBalancesChange, index, "debitAttributeId", value), "debit", disabled, `Debit account ${index + 1}`)}</td>
          <td><input type="number" aria-label={`Debit amount ${index + 1}`} value={row.debitAmount} disabled={disabled}
            onChange={(event) => update(onBalancesChange, index, "debitAmount", event.target.value)} /></td>
          <td>{renderAttributeSelect(row.creditAttributeId,
            (value) => update(onBalancesChange, index, "creditAttributeId", value), "credit", disabled, `Credit account ${index + 1}`)}</td>
          <td><input type="number" aria-label={`Credit amount ${index + 1}`} value={row.creditAmount} disabled={disabled}
            onChange={(event) => update(onBalancesChange, index, "creditAmount", event.target.value)} /></td>
          <td><button type="button" aria-label={`Remove balance row ${index + 1}`}
            onClick={() => remove(onBalancesChange, index)} disabled={disabled || balances.length <= 1}><FaTrash /></button></td>
        </tr>)}</tbody>
      </table></div>
    </section>
    {adjustments !== undefined && <section className="aq-card aq-adjustments-card" aria-label="Adjustments">
      <div className="aq-section-heading">
        <span className="aq-section-icon"><FaListUl /></span>
        <div><h2>Adjustments</h2><p>Add the adjustments for the final accounts.</p></div>
        <button type="button" className="aq-secondary" disabled={disabled}
          onClick={() => onAdjustmentsChange((rows) => [...rows, { attributeId: "", amount: "", amount2: "", note: "" }])}>
          <FaPlus />Add adjustment row
        </button>
      </div>
      <div className="aq-table-wrap"><table>
        <thead><tr><th>Adjustment</th><th>Amount</th><th /></tr></thead>
        <tbody>{adjustments.map((row, index) => <tr key={index}>
          <td>{renderAttributeSelect(row.attributeId,
            (value) => update(onAdjustmentsChange, index, "attributeId", value), null, disabled, `Adjustment account ${index + 1}`)}
          </td>
          <td><input type="number" min="0" step="0.01" aria-label={`Adjustment amount ${index + 1}`} value={row.amount} disabled={disabled}
            onChange={(event) => update(onAdjustmentsChange, index, "amount", event.target.value)} /></td>
          <td><button type="button" aria-label={`Remove adjustment row ${index + 1}`}
            disabled={disabled || adjustments.length <= 1} onClick={() => remove(onAdjustmentsChange, index)}><FaTrash /></button></td>
        </tr>)}</tbody>
      </table></div>
    </section>}
  </>;
}
