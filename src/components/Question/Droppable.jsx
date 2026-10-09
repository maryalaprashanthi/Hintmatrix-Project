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

const Droppable = ({
  id,
  addLabel = "Particulars",
  amtLabel = "Amt (₹)",
  isCreditSide,
  matchRowCount,
  derivedRows = [],
}) => {
  const storedRows = useQuestionStore((state) => state.droppableData[id]);
  const rows = [...(storedRows ?? []), ...derivedRows];

  const theme = isCreditSide ? "theme-credit" : "theme-debit";

  const addZoneRef = useRef(null);
  const subZoneRef = useRef(null);

  const { ref: addRef, isDropTarget: isAddOver } = useDroppable({
    id: `${id}-add`,
  });
  const { ref: subRef, isDropTarget: isSubOver } = useDroppable({
    id: `${id}-less`,
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
              <tr key={`${obj.id}-${obj.conditionId ?? obj.operation}`}
                className={obj.isBlank ? "blank-row" : obj.isDerived ? "derived-row" : ""}>
                <td className="particulars-cell">{finalAccountParticular(obj, id)}</td>
                <td className="text-end amount-cell">
                  {obj.isBlank
                    ? ""
                    : obj.operation === "add"
                      ? obj.isDerived || !obj.isPaired ? "" : Number(obj.amount).toLocaleString("en-IN")
                      : obj.isPaired
                        ? `${obj.isDerived && Number(obj.amount) === 0 ? "" : "-"}${Number(obj.amount).toLocaleString("en-IN", obj.isDerived && Number(obj.amount) === 0 ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {})}`
                        : ""}
                </td>
                <td className="text-end amount-cell">
                  {obj.isBlank
                    ? ""
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
                {(addTotal - subTotal).toLocaleString("en-IN")}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Transparent drop targets layered over the table columns so the
            table itself stays a single, aligned grid. */}
        <div
          ref={mergeRefs(addRef, addZoneRef)}
          className={`drop-overlay drop-overlay-add ${
            isAddOver ? "is-over" : ""
          }`}
          aria-hidden="true"
        />
        <div
          ref={mergeRefs(subRef, subZoneRef)}
          className={`drop-overlay drop-overlay-sub ${
            isSubOver ? "is-over" : ""
          }`}
          aria-hidden="true"
        />
      </div>

      <Overlay
        target={addZoneRef.current}
        show={isAddOver}
        placement="top"
        container={document.body}
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
        container={document.body}
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
export default Droppable;
