import { useDroppable } from "@dnd-kit/react";
import "./Droppable.css";

const Droppable = ({
  id,
  data,
  addLabel = "Particulars",
  amtLabel = "Amt (₹)",
}) => {
  // Theme: anything with "cr", "credit", or "assets" in the id gets the green theme,
  // everything else (dr, debit, liabilities) gets the blue/purple theme —
  // matching the Dr./Cr. color coding in the screenshot.
  const isCreditSide = /cr|credit|assets/i.test(id || "");
  const theme = isCreditSide ? "theme-credit" : "theme-debit";

  const { ref: addRef, isDropTarget: isAddOver } = useDroppable({
    id: `${id}-add`,
  });
  const { ref: subRef, isDropTarget: isSubOver } = useDroppable({
    id: `${id}-sub`,
  });

  const addTotal = (data || [])
    .filter((o) => o.operation === "+")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  const subTotal = (data || [])
    .filter((o) => o.operation === "-")
    .reduce((sum, o) => sum + Number(o.amount || 0), 0);

  return (
    <div className={`droppable-group ${theme}`}>
      <div className="row g-0">
        <div
          ref={addRef}
          className={`dropzone add-zone col-12 col-sm-8 ${isAddOver ? "active-dropzone-add" : ""}`}
        >
          <table className="table table-sm mb-0 dropzone-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: "70%" }}>
                  {addLabel}
                </th>
                <th scope="col" style={{ width: "30%" }} className="text-end">
                  {amtLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {data !== undefined &&
                data.map((obj) => (
                  <tr key={obj.id}>
                    <td>{obj.name}</td>
                    <td className="text-end">
                      {obj.operation === "+"
                        ? Number(obj.amount).toLocaleString("en-IN")
                        : ""}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td className="fw-bold">Total</td>
                <td className="fw-bold text-end">
                  {addTotal.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div
          ref={subRef}
          className={`dropzone sub-zone col-12 col-sm-4 ${isSubOver ? "active-dropzone-sub" : ""}`}
        >
          <table className="table table-sm mb-0 dropzone-table">
            <thead>
              <tr>
                <th scope="col" style={{ width: "100%" }} className="text-end">
                  {amtLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {data !== undefined &&
                data.map((obj) => (
                  <tr key={obj.id}>
                    <td className="text-end">
                      {obj.operation === "-"
                        ? `-${Number(obj.amount).toLocaleString("en-IN")}`
                        : "\u00A0"}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td className="fw-bold text-end">
                  {subTotal ? `-${subTotal.toLocaleString("en-IN")}` : "\u00A0"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Droppable;
