import { OverlayTrigger, Popover, Table } from "react-bootstrap";
import "../../DropdownQuestions/DropdownQuestion.css";
import Select from "react-select";
import { useState } from "react";
import { useOverlayContainer } from "../ExamShell/useOverlayContainer";
import { useRuleTables } from "./useRuleTables";

const menuPortalStyles = { menuPortal: (base) => ({ ...base, zIndex: 9999 }) };

// The Debit and Credit selects inside an open transaction. The popover mounts
// this only while it is open, so the rule engine calls happen when the student
// first opens a transaction. Every transaction offers the same list: all the
// accounts that any attribute of the question can use. Later opens reuse the
// first requests (see examRules).
const DropdownSelects = ({
  item,
  attributeIds,
  chapterId,
  onTablesLoaded,
  debitValue,
  creditValue,
  isFilled,
  overlayContainer,
  onPick,
}) => {
  const { status, tables, retry } = useRuleTables(attributeIds, chapterId, onTablesLoaded);
  const loading = status === "loading";

  const optionsDebitData = tables.map((table) => ({
    label: `${table.name} ... Dr`,
    value: table.id,
  }));
  const optionsCreditData = tables.map((table) => ({
    label: `To ${table.name}`,
    value: table.id,
  }));

  return (
    <div style={{ width: "400px" }}>
      {status === "error" && (
        <p className="small" role="alert">
          The accounts did not load.{" "}
          <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={retry}>
            Try again
          </button>
        </p>
      )}
      <div className="mb-4">
        <Select
          options={optionsDebitData}
          placeholder={loading ? "Loading accounts…" : "Select Debit A/C"}
          value={debitValue}
          closeMenuOnSelect={false}
          menuPortalTarget={overlayContainer}
          styles={menuPortalStyles}
          onChange={(selected) => onPick(item.questionAttributeId, "Debit", selected)}
          isDisabled={isFilled || loading}
          isLoading={loading}
          isSearchable
        />
      </div>

      <Select
        options={optionsCreditData}
        placeholder={loading ? "Loading accounts…" : "Select Credit A/C"}
        value={creditValue}
        closeMenuOnSelect={false}
        menuPortalTarget={overlayContainer}
        styles={menuPortalStyles}
        onChange={(selected) => onPick(item.questionAttributeId, "Credit", selected)}
        isDisabled={isFilled || loading}
        isLoading={loading}
        isSearchable
      />
    </div>
  );
};

// Exam version of DropdownQuestion: any option the user picks is accepted
// and shown, there is no rule-matching / correct-incorrect check, and no
// hint or autofill affordance.
const ExamDropdownQuestion = ({
  data,
  chapterId,
  onTablesLoaded,
  answeredData,
  setAnsweredData,
}) => {
  const attributeIds = [...new Set(data.map((item) => String(item.attributeId)))];
  const [openAttributeId, setOpenAttributeId] = useState(null);
  // Must follow the fullscreen element, or the popover and its menus render
  // outside the painted subtree once the exam starts.
  const overlayContainer = useOverlayContainer();

  const handleAdd = (id, type, selectedOption) => {
    if (!selectedOption) {
      return;
    }

    const text = selectedOption.label;

    const neededData = data.find(
      (obj) => String(obj.questionAttributeId) === String(id),
    );

    if (!neededData) {
      return;
    }

    const existing = (answeredData[id] || []).filter(
      (entry) => !entry.particulars?.startsWith("(Being"),
    );

    // A transaction has exactly one Debit select and one Credit select, so a
    // pick REPLACES that side's line rather than adding another. Re-picking the
    // account already shown is then a no-op instead of a duplicate row, and
    // switching to a different account leaves the table agreeing with what the
    // select displays. (The journal question is deliberately different: there,
    // one transaction can legitimately need several Debit/Credit lines.)
    const currentForSide = existing.find((entry) => entry.side === type);

    if (currentForSide?.particulars === text) {
      return;
    }

    const newEntry = {
      side: type,
      optionValue: selectedOption.value,
      date: "",
      particulars: text,
      lf: "",
      debit: type === "Debit" ? neededData.amount : "",
      credit: type === "Credit" ? neededData.amount : "",
    };

    const beingRow = {
      date: "",
      particulars: `(Being ${neededData.attributeName})`,
      lf: "",
      debit: "",
      credit: "",
    };

    const otherSide = existing.filter((entry) => entry.side !== type);

    const updated =
      type === "Debit" ? [newEntry, ...otherSide] : [...otherSide, newEntry];

    setAnsweredData((prev) => ({
      ...prev,
      [id]: [...updated, beingRow],
    }));
  };

  // The saved rows ARE the selection - there is no separate selection state to
  // drift out of sync. So removing a row from the solution table clears the
  // matching select and unlocks the transaction, and picks survive navigating
  // away and back (answeredData is cached per question, local state would not).
  const pickedFor = (attributeId, type) => {
    const row = (answeredData[attributeId] || []).find(
      (entry) => entry.side === type,
    );

    return row ? { label: row.particulars, value: row.optionValue } : null;
  };

  return (
    <div className="dropdown-question-wrap">
      <div className="table-responsive">
        <Table bordered className="align-middle mb-0 dropdown-table">
          <thead>
            <tr>
              <th>Transaction</th>
              <th className="text-end">Amount (₹)</th>
              <th className="text-end">Amount (₹)</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => {
              const debitValue = pickedFor(item.questionAttributeId, "Debit");
              const creditValue = pickedFor(item.questionAttributeId, "Credit");

              const isFilled = Boolean(debitValue && creditValue);

              return (
                <OverlayTrigger
                  key={item.questionAttributeId}
                  trigger={isFilled ? [] : "click"}
                  show={
                    openAttributeId === item.questionAttributeId && !isFilled
                  }
                  placement="right"
                  rootClose
                  container={overlayContainer}
                  popperConfig={{ strategy: "fixed" }}
                  onToggle={(nextShow) => {
                    if (!nextShow) {
                      setOpenAttributeId(null);
                    }
                  }}
                  overlay={
                    <Popover
                      id={`popover-${item.questionAttributeId}`}
                      className="dropdown-popover"
                    >
                      <Popover.Header as="h3">
                        Transaction of <strong>{item.attributeName}</strong> is
                        ₹{item.amount}
                        {item.amount2 ? `/${item.amount2}` : ""}
                      </Popover.Header>

                      <Popover.Body>
                        <DropdownSelects
                          item={item}
                          attributeIds={attributeIds}
                          chapterId={chapterId}
                          onTablesLoaded={onTablesLoaded}
                          debitValue={debitValue}
                          creditValue={creditValue}
                          isFilled={isFilled}
                          overlayContainer={overlayContainer}
                          onPick={handleAdd}
                        />
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <tr
                    onClick={() => {
                      if (!isFilled) {
                        setOpenAttributeId((current) =>
                          current === item.questionAttributeId
                            ? null
                            : item.questionAttributeId,
                        );
                      }
                    }}
                    style={{
                      cursor: isFilled ? "not-allowed" : "pointer",
                      opacity: isFilled ? 0.6 : 1,
                    }}
                  >
                    <td>{item.attributeName}</td>
                    <td className="text-end">{item.amount ?? "-"}</td>
                    <td className="text-end">{item.amount2 ?? "-"}</td>
                  </tr>
                </OverlayTrigger>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default ExamDropdownQuestion;
