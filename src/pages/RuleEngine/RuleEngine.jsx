import { useState } from "react";
import RuleEngineForm from "./RuleEngineForm";
import RuleEngineTable from "./RuleEngineTable";
import "./RuleEngine.css";

function RuleEngine() {
  const [showModal, setShowModal] = useState(false);
  const [ruleEngineList, setRuleEngineList] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);

  // Open Add Form
  const handleAdd = () => {
    setSelectedRule(null);
    setShowModal(true);
  };

  // Open Edit Form
  const handleEdit = (rule) => {
    setSelectedRule(rule);
    setShowModal(true);
  };

  // Delete
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this rule?")) {
      setRuleEngineList((prev) => prev.filter((rule) => rule.ruleId !== id));
    }
  };

  // Save (Add / Edit)
  const handleSave = (ruleData) => {
    if (selectedRule) {
      // Update
      setRuleEngineList((prev) =>
        prev.map((rule) =>
          rule.ruleId === selectedRule.ruleId
            ? { ...ruleData, ruleId: selectedRule.ruleId }
            : rule,
        ),
      );
    } else {
      // Add
      setRuleEngineList((prev) => [
        ...prev,
        {
          ruleId: Date.now(),
          ...ruleData,
        },
      ]);
    }

    setShowModal(false);
    setSelectedRule(null);
  };

  // Close Modal
  const handleClose = () => {
    setShowModal(false);
    setSelectedRule(null);
  };

  return (
    <div className="rule-engine-container">
      <div className="page-header">
        <h2>Rule Engine</h2>

        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Rule
        </button>
      </div>

      <RuleEngineTable
        ruleEngineList={ruleEngineList}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <RuleEngineForm
        show={showModal}
        onClose={handleClose}
        onSave={handleSave}
        selectedRuleData={selectedRule}
      />
    </div>
  );
}

export default RuleEngine;
