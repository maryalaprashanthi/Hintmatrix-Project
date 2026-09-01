/* eslint-disable react/prop-types */
import { useRef } from "react";
import { useDroppable } from "@dnd-kit/react";
import { Overlay, Tooltip } from "react-bootstrap";
import "./Droppable.css";
import useQuestionStore from "./questionStore";

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
}) => {
  const data = useQuestionStore((state) => state.droppableData[id]);

  const theme = isCreditSide ? "theme-credit" : "theme-debit";

  const addZoneRef = useRef(null);
  const subZoneRef = useRef(null);

  const { ref: addRef, isDropTarget: isAddOver } = useDroppable({
    id: `${id}-add`,
  });
  const { ref: subRef, isDropTarget: isSubOver } = useDroppable({
    id: `${id}-less`,
  });

  const addTotal = (data || [])
    .filter((o) => o.operation === "add")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const subTotal = (data || [])
    .filter((o) => o.operation === "less")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const calcSum = (id, pairId) => {
    const addObj = data.find((o) => o.id === pairId && o.operation === "add");
    const subObj = data.find((o) => o.id === id && o.operation === "less");
    return addObj && subObj
      ? Number(addObj.amount || 0) - Number(subObj.amount || 0)
      : 0;
  };

  const rows = data ?? [];

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
            {rows.map((obj) => (
              <tr key={obj.id}>
                <td className="particulars-cell">{obj.name}</td>
                <td className="text-end amount-cell">
                  {obj.operation === "add"
                    ? Number(obj.amount).toLocaleString("en-IN")
                    : obj.isPaired
                      ? `-${Number(obj.amount).toLocaleString("en-IN")}`
                      : ""}
                </td>
                <td className="text-end amount-cell">
                  {obj.operation === "less" && !obj.isPaired
                    ? `-${Number(obj.amount).toLocaleString("en-IN")}`
                    : obj.operation === "less" && obj.isPaired
                      ? Number(calcSum(obj.id, obj.pairId)).toLocaleString(
                          "en-IN",
                        )
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
