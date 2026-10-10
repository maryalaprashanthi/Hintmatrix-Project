/* eslint-disable react/prop-types */
import { useRef } from "react";
import { useDroppable } from "@dnd-kit/react";
import { Overlay, Tooltip } from "react-bootstrap";
import "./Droppable.css";
import useQuestionStore from "./questionStore";
import { finalAccountParticular } from "./SampleData";

const mergeRefs =
  (...refs) =>
  (node) => {
    refs.forEach((r) => {
      if (typeof r === "function") r(node);
      else if (r && typeof r === "object") r.current = node;
    });
  };

// Group metadata comes from the question controller's rule relationships.
// Keep the group's first position, but put its base account before its effects.
const orderGroupedRows = (rows) => {
  const groups = new Map();
  for (const row of rows) {
    if (row.groupId == null || row.isDerived) continue;
    const key = String(row.groupId);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  const emitted = new Set();
  return rows.flatMap((row) => {
    if (row.groupId == null || row.isDerived) return [row];
    const key = String(row.groupId);
    if (emitted.has(key)) return [];
    emitted.add(key);
    const members = groups.get(key);
    return [...members.filter((member) => member.isGroupBase),
      ...members.filter((member) => !member.isGroupBase)];
  });
};

// Both question types render this table; callers may provide their own answer
// state without subscribing to the ordinary practice question store.
const DropTable = ({
  id,
  addLabel = "Particulars",
  amtLabel = "Amt (₹)",
  isCreditSide,
  matchRowCount,
  derivedRows = [],
  rows: placedRows = [],
  total,
  busy = false,
  onPlaceSelected,
  onRemove,
}) => {
  const rows = [...orderGroupedRows(placedRows), ...derivedRows];

  const theme = isCreditSide ? "theme-credit" : "theme-debit";

  const addZoneRef = useRef(null);
  const subZoneRef = useRef(null);

  const { ref: addRef, isDropTarget: isAddOver } = useDroppable({
    id: `${id}-add`,
    disabled: busy,
  });
  const { ref: subRef, isDropTarget: isSubOver } = useDroppable({
    id: `${id}-less`,
    disabled: busy,
  });

  const addTotal = rows
    .filter((o) => o.operation === "add")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const subTotal = rows
    .filter((o) => o.operation === "less")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const pairedSubtotal = (deduction) => {
    const additions = rows.filter((row) => row.operation === "add" &&
      String(row.attributeId) === String(deduction.pairId));
    const deductions = rows.filter((row) => row.operation === "less" &&
      row.isPaired && String(row.pairId) === String(deduction.pairId));
    if (!additions.length || deductions.at(-1) !== deduction) return "";
    return (additions.reduce((sum, row) => sum + Number(row.amount || 0), 0) -
      deductions.reduce((sum, row) => sum + Number(row.amount || 0), 0))
      .toLocaleString("en-IN");
  };

  const groupMembers = new Map();
  for (const row of rows) {
    if (row.groupId == null || row.isDerived) continue;
    const key = String(row.groupId);
    if (!groupMembers.has(key)) groupMembers.set(key, []);
    groupMembers.get(key).push(row);
  }
  const isGrouped = (row) => row.groupId != null && !row.isDerived && !row.isBlank;
  const groupSubtotal = (row) => {
    const members = groupMembers.get(String(row.groupId));
    if (members.at(-1) !== row) return "";
    const cents = members.reduce((sum, member) => sum +
      (member.operation === "less" ? -1 : 1) * Math.round(Number(member.amount || 0) * 100), 0);
    return (cents / 100).toLocaleString("en-IN");
  };
  const particular = (row) => {
    if (!isGrouped(row) || row.isGroupBase) return finalAccountParticular(row, id);
    const name = String(row.name ?? "").trim().replace(/^(?:To\s+|By\s+|Add:\s*|Less:\s*)/i, "");
    return `${row.operation === "less" ? "Less" : "Add"}: ${name}`;
  };

  const targetRows = Math.max(rows.length, matchRowCount ?? rows.length);
  const displayRows = [...rows];

  while (displayRows.length < targetRows) {
    displayRows.push({
      id: `${id}-empty-${displayRows.length}`,
      name: "",
      amount: "",
      operation: "empty",
      isBlank: true,
    });
  }

  return (
    <div className={`q-droppable ${theme}`}>
      <div className="qd-surface">
        <table className="table table-sm mb-0 qd-table">
          <colgroup>
            <col style={{ width: "44%" }} />
            <col style={{ width: "28%" }} />
            <col style={{ width: "28%" }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">{addLabel}</th>
              <th scope="col" className="text-end">
                {amtLabel}
              </th>
              <th scope="col" className="text-end">
                {amtLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((obj) => (
              <tr key={obj.key ?? `${obj.id}-${obj.conditionId ?? obj.operation}`}
                className={obj.isBlank ? "blank-row" : obj.isDerived ? "derived-row" : ""}>
                <td className="particulars-cell">{particular(obj)}
                  {onRemove && !obj.isBlank && !obj.isDerived && <button
                    className="drop-remove btn btn-sm"
                    type="button"
                    aria-label={`Remove ${obj.name}`}
                    disabled={busy}
                    onClick={() => onRemove(obj)}
                  >×</button>}
                </td>
                <td className="text-end amount-cell">
                  {obj.isBlank
                    ? ""
                    : isGrouped(obj)
                      ? `${obj.operation === "less" ? "-" : ""}${Number(obj.amount).toLocaleString("en-IN")}`
                    : obj.operation === "add"
                      ? obj.isDerived || !obj.isPaired ? "" : Number(obj.amount).toLocaleString("en-IN")
                      : obj.isPaired
                        ? `${obj.isDerived && Number(obj.amount) === 0 ? "" : "-"}${Number(obj.amount).toLocaleString("en-IN", obj.isDerived && Number(obj.amount) === 0 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {})}`
                        : ""}
                </td>
                <td className="text-end amount-cell">
                  {obj.isBlank
                    ? ""
                    : isGrouped(obj)
                      ? groupSubtotal(obj)
                    : obj.operation === "less" && !obj.isPaired
                      ? `${obj.isDerived && Number(obj.amount) === 0 ? "" : "-"}${Number(obj.amount).toLocaleString("en-IN", obj.isDerived && Number(obj.amount) === 0 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {})}`
                      : obj.operation === "less" && obj.isPaired
                        ? pairedSubtotal(obj)
                        : obj.operation === "add" && (obj.isDerived || !obj.isPaired)
                          ? Number(obj.amount).toLocaleString("en-IN", obj.isDerived && Number(obj.amount) === 0 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {})
                          : " "}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td className="fw-bold">Total</td>
              <td className="fw-bold text-end" />
              <td className="fw-bold text-end amount-cell">
                {(Number.isFinite(total) ? total : addTotal - subTotal).toLocaleString("en-IN")}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Transparent drop targets layered over the table columns so the
            table itself stays a single, aligned grid. */}
        {onPlaceSelected ? <button
          ref={mergeRefs(addRef, addZoneRef)}
          className={`drop-overlay drop-overlay-add ${isAddOver ? "is-over" : ""}`}
          type="button"
          disabled={busy}
          aria-label={`Add to ${id}`}
          onClick={() => onPlaceSelected(`${id}-add`)}
        ><span className="visually-hidden">Add</span></button> : <div
          ref={mergeRefs(addRef, addZoneRef)}
          className={`drop-overlay drop-overlay-add ${
            isAddOver ? "is-over" : ""
          }`}
          aria-hidden="true"
        />}
        {onPlaceSelected ? <button
          ref={mergeRefs(subRef, subZoneRef)}
          className={`drop-overlay drop-overlay-sub ${isSubOver ? "is-over" : ""}`}
          type="button"
          disabled={busy}
          aria-label={`Subtract from ${id}`}
          onClick={() => onPlaceSelected(`${id}-less`)}
        ><span className="visually-hidden">Less</span></button> : <div
          ref={mergeRefs(subRef, subZoneRef)}
          className={`drop-overlay drop-overlay-sub ${
            isSubOver ? "is-over" : ""
          }`}
          aria-hidden="true"
        />}
      </div>

      <Overlay
        target={addZoneRef.current}
        show={isAddOver}
        placement="top"
        container={typeof document === "undefined" ? undefined : document.body}
      >
        {(overlayProps) => (
          <Tooltip
            id={`${id}-add-tooltip`}
            className="add-tooltip"
            {...overlayProps}
          >
            Add
          </Tooltip>
        )}
      </Overlay>

      <Overlay
        target={subZoneRef.current}
        show={isSubOver}
        placement="top"
        container={typeof document === "undefined" ? undefined : document.body}
      >
        {(overlayProps) => (
          <Tooltip
            id={`${id}-sub-tooltip`}
            className="sub-tooltip"
            {...overlayProps}
          >
            Less
          </Tooltip>
        )}
      </Overlay>
    </div>
  );
};

const StoreDroppable = (props) => {
  const storedRows = useQuestionStore((state) => state.droppableData[props.id]);
  return <DropTable {...props} rows={storedRows ?? []} />;
};

const Droppable = (props) => props.rows !== undefined
  ? <DropTable {...props} />
  : <StoreDroppable {...props} />;

export default Droppable;
